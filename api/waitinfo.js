export const config = {
  runtime: "nodejs"
};

export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://ggsts.gg.go.kr/receipt/getTotalWaitInfo.json",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        body: "TR=GA11130",
      }
    );

    if (!response.ok) {
      return res.status(500).json({ error: "외부 API 응답 오류" });
    }

    const data = await response.json();

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      error: "API fetch 실패",
      detail: error.toString(),
    });
  }
}
