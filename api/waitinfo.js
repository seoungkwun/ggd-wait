export const config = {
  runtime: "nodejs",
};

export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://ggsts.gg.go.kr/receipt/getTotalWaitInfo.json",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded; charset=UTF-8",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Referer": "https://ggsts.gg.go.kr/",
          "Origin": "https://ggsts.gg.go.kr",
        },
        body: "TR=GA11130",
      }
    );

    const text = await response.text();

    if (!text) {
      return res.status(500).json({
        error: "외부 API가 빈 응답 반환",
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
