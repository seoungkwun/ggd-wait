export const config = {
  runtime: "nodejs",
};

export default async function handler(req, res) {
  try {
    // 1️⃣ 세션 생성
    const sessionRes = await fetch(
      "https://ggsts.gg.go.kr/",
      { method: "GET" }
    );

    const cookies = sessionRes.headers.get("set-cookie");

    if (!cookies) {
      return res.status(500).json({
        error: "세션 쿠키 생성 실패",
      });
    }

    // 2️⃣ 실제 데이터 요청 (쿠키 포함)
    const response = await fetch(
      "https://ggsts.gg.go.kr/receipt/getTotalWaitInfo.json",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded; charset=UTF-8",
          "Cookie": cookies,
          "Referer": "https://ggsts.gg.go.kr/",
          "Origin": "https://ggsts.gg.go.kr",
        },
        body: "TR=GA11130",
      }
    );

    const text = await response.text();

    if (!text) {
      return res.status(500).json({
        error: "빈 응답 반환",
      });
    }

    const data = JSON.parse(text);

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      error: "API fetch 실패",
      detail: error.toString(),
    });
  }
}
