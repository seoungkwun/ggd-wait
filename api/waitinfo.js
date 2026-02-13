export const config = { runtime: "nodejs" };

function pickSetCookies(headers) {
  const getSetCookie = headers.getSetCookie?.bind(headers);
  if (getSetCookie) return getSetCookie();
  const sc = headers.get("set-cookie");
  return sc ? [sc] : [];
}

export default async function handler(req, res) {
  try {
    // 1) 세션 쿠키 생성
    const sessionRes = await fetch("https://ggsts.gg.go.kr/", {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        Accept: "text/html,*/*",
      },
    });

    const setCookies = pickSetCookies(sessionRes.headers);
    if (!setCookies.length) {
      return res.status(502).json({
        error: "SESSION_COOKIE_MISSING",
        detail: "ggsts에서 set-cookie를 받지 못했습니다.",
        sessionStatus: sessionRes.status,
      });
    }

    const cookieHeader = setCookies
      .map((c) => String(c).split(";")[0])
      .filter(Boolean)
      .join("; ");

    // 2) 실제 데이터 요청
    const apiRes = await fetch("https://ggsts.gg.go.kr/receipt/getTotalWaitInfo.json", {
      method: "POST",
      redirect: "follow",
      cache: "no-store",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        Accept: "application/json, text/javascript, */*; q=0.01",
        "X-Requested-With": "XMLHttpRequest",
        Origin: "https://ggsts.gg.go.kr",
        Referer: "https://ggsts.gg.go.kr/",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        Cookie: cookieHeader,
      },
      body: "tr=W9401",
    });

    const text = (await apiRes.text())?.trim();

    // ✅ 빈 응답
    if (!text) {
      return res.status(502).json({
        error: "UPSTREAM_EMPTY",
        upstreamStatus: apiRes.status,
        upstreamStatusText: apiRes.statusText,
      });
    }

    // ✅ "null" 응답 (지금 너 상황)
    if (text === "null") {
      return res.status(502).json({
        error: "UPSTREAM_RETURNED_NULL",
        upstreamStatus: apiRes.status,
        upstreamStatusText: apiRes.statusText,
        hint: "ggsts가 세션/파라미터를 인정하지 않거나 차단했을 때 종종 null을 반환합니다.",
      });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(502).json({
        error: "UPSTREAM_NOT_JSON",
        upstreamStatus: apiRes.status,
        preview: text.slice(0, 300),
      });
    }

    // ✅ JSON인데 구조가 이상할 때
    if (!data || typeof data !== "object") {
      return res.status(502).json({
        error: "UPSTREAM_BAD_JSON",
        upstreamStatus: apiRes.status,
        preview: text.slice(0, 300),
      });
    }

    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({
      error: "PROXY_FETCH_FAILED",
      detail: String(e),
    });
  }
}
