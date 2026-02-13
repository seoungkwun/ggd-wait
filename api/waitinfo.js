export default async function handler(req, res) {
  try {
    const response = await fetch("https://ggsts.gg.go.kr/receipt/getTotalWaitInfo.json", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
      },
      body: "TR=GA11130"
    });

    const data = await response.json();

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "API fetch error", detail: error.toString() });
  }
}
