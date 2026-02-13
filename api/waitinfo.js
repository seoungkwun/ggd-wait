export const config = {
  runtime: "nodejs",
};

export default async function handler(req, res) {
  try {
    // ✅ 1) 세션(쿠키) 생성: 반드시 ggsts 도메인으로 GET
    const sessionRes = await fetch("https://ggsts.gg.go.kr/", {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    const setCookie = sessionRes.headers.get("set-cookie");

    if (!setCookie) {
      return res.status(500).json({
        error: "세션 쿠키 생성 실패",
        hint: "외부 서버에서 set-cookie가 오지 않았습니다.",
      });
    }

    // ✅ 2) 실제 데이터 요청: 쿠키 포함 POST
    const apiRes = await fetch(
      "https://ggsts.gg.go.kr/receipt/getTotalWaitInfo.json",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "Accept": "application/json, text/javascript, */*; q=0.01",
          "X-Requested-With": "XMLHttpRequest",
          "Origin": "https://ggsts.gg.go.kr",
          "Referer": "https://ggsts.gg.go.kr/",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
          // ✅ 핵심: 세션 쿠키 전달
          "Cookie": setCookie,
        },
        body: "TR=GA11130",
      }
    );

    const text = await apiRes.text();

    if (!text) {
      return res.status(500).json({
        error: "외부 API가 빈 응답 반환",
        status: apiRes.status,
        statusText: apiRes.statusText,
      });
    }

    // 일부 환경에서 앞뒤 공백/개행이 섞일 수 있어 trim
    const trimmed = text.trim();

    // JSON 파싱
    let data;
    try {
      data = JSON.parse(trimmed);
    } catch (e) {
      return res.status(500).json({
        error: "외부 API 응답이 JSON이 아님",
        status: apiRes.status,
        preview: trimmed.slice(0, 200),
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      error: "API fetch 실패",
      detail: String(error),
    });
  }
}
