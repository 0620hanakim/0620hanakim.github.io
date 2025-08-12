// netlify/functions/inicis-sign.js
import crypto from "crypto";

export default async (req) => {
  try {
    const { price, oid } = await req.json(); // 프론트에서 넘겨줄 금액/주문번호

    const mid = process.env.INICIS_MID;
    const signKey = process.env.INICIS_SIGNKEY;
    if (!mid || !signKey) {
      return new Response(JSON.stringify({ error: "ENV not set" }), { status: 500 });
    }

    const timestamp = Date.now().toString();

    // 웹표준 예시: signature = SHA256("oid=...&price=...&timestamp=...")
    const raw = `oid=${oid}&price=${price}&timestamp=${timestamp}`;
    const signature = crypto.createHash("sha256").update(raw).digest("hex");

    // 일부 결제수단에서 요구되는 mKey = SHA256(signKey)
    const mKey = crypto.createHash("sha256").update(signKey).digest("hex");

    return new Response(
      JSON.stringify({ mid, timestamp, signature, mKey }),
      { headers: { "content-type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
