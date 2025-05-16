import type { NextApiRequest, NextApiResponse } from "next";
import { generateXVerify } from "@/utils/phonepe";

const {
  PHONEPE_CLIENT_ID,
  PHONEPE_CLIENT_SECRET,
  PHONEPE_CLIENT_APP_VERSION,
  PHONEPE_BASE_URL,
} = process.env;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { transactionId } = req.query;

  if (!transactionId || typeof transactionId !== "string") {
    return res.status(400).json({ error: "Invalid transaction ID" });
  }

  const apiPath = `/pg/v1/status/${PHONEPE_CLIENT_ID}/${transactionId}`;
  const xVerify = generateXVerify("", apiPath, PHONEPE_CLIENT_SECRET!);

  try {
    const response = await fetch(`${PHONEPE_BASE_URL}${apiPath}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": xVerify,
        "X-CLIENT-ID": PHONEPE_CLIENT_ID!,
        "X-APP-VERSION": PHONEPE_CLIENT_APP_VERSION!,
      },
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Failed to verify payment", detail: (error as Error).message });
  }
}
