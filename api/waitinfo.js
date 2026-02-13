export const config = { runtime: "nodejs" };

export default async function handler(req, res) {
  try {
    // 1) 세션 쿠키 생성 (ggsts 메인)
    const sessionRes = await fetch("https://ggsts.gg.go.kr/", {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        Accept: "text/html,*/*",
      },
    });

    // Node(undici) 환경이면 getSetCookie()가 있을 수 있습니다.
    const getSetCookie = sessionRes.headers.getSetCookie?.bind(sessionRes.headers);
    const setCookies = getSetCookie
      ? getSetCookie()
      : [sessionRes.headers.get("set-cookie")].filter(Boolean);

    if (!setCookies || setCookies.length === 0) {
      return res.status(502).json({
        error: "SESSION_COOKIE_MISSING",
        detail: "ggsts에서 set-cookie를 받지 못했습니다.",
      });
    }

    // Cookie 헤더용으로 name=value만 추출
    const cookieHeader = setCookies
      .map((c) => String(c).split(";")[0])
      .filter(Boolean)
      .join("; ");

    // 2) 실제 데이터 요청
    const apiRes = await fetch(
      "https://ggsts.gg.go.kr/receipt/getTotalWaitInfo.json",
      {
        method: "POST",
        redirect: "follow",
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
        body: "TR=GA11130",
      }
    );

    const text = (await apiRes.text())?.trim();

    if (!text) {
      return res.status(502).json({
        error: "UPSTREAM_EMPTY",
        status: apiRes.status,
        statusText: apiRes.statusText,
      });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(502).json({
        error: "UPSTREAM_NOT_JSON",
        preview: text.slice(0, 200),
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
