import crypto from "crypto";

export function generateXVerify(payload: string, apiPath: string, clientSecret: string): string {
  const dataToHash = `${payload}${apiPath}${clientSecret}`;
  const hash = crypto.createHash("sha256").update(dataToHash).digest("hex");
  return `${hash}###1`; // `###1` is a fixed suffix required by PhonePe
}

export function encodeToBase64(obj: object): string {
  return Buffer.from(JSON.stringify(obj)).toString("base64");
}

