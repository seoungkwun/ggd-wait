export const config = {
  runtime: "nodejs",
};

export default async function handler(req, res) {
  try {
    // 1️⃣ 먼저 세션 생성
    const sessionRes = await fetch(
      "https://ggsts.gg.go.kr/receipt/getTotalWaitInfo.json",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded; charset=UTF-8",
        },
        body: "TR=GA11130",
      }
    );

    const data = await sessionRes.json();

    if (!data || data.RESCODE !== "0000") {
      return res.status(500).json({
        error: "외부 API 응답 이상",
        raw: data,
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      error: "API 호출 실패",
      detail: error.toString(),
    });
  }
}
