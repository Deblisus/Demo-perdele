import jwt from "jsonwebtoken";
import crypto from "crypto";
import { NetopiaIpnPayloadSchema, type NetopiaIpnPayload } from "./types";

/**
 * Verify a Netopia IPN webhook request.
 *
 * 1. SHA-512 hash the raw body and base64-encode it
 * 2. Verify the RS512-signed JWT from the `verification-token` header
 * 3. Check that the JWT `sub` matches the body hash
 * 4. Check that the JWT `aud` matches our posSignature
 * 5. Parse and validate the body against the IPN schema
 *
 * @param rawBody - The exact raw text body of the request (before JSON parsing)
 * @param verificationToken - The JWT from the `verification-token` header
 * @returns The parsed and validated IPN payload
 * @throws Error if verification fails
 */
export function verifyIpn(
  rawBody: string,
  verificationToken: string
): NetopiaIpnPayload {
  const publicKey = process.env.NETOPIA_PUBLIC_KEY ?? "";
  const posSignature = process.env.NETOPIA_POS_SIGNATURE ?? "";

  if (!publicKey) {
    throw new Error("NETOPIA_PUBLIC_KEY is not configured");
  }

  // 1. Hash the raw body
  const hash = crypto
    .createHash("sha512")
    .update(rawBody, "utf8")
    .digest("base64");

  // 2. Verify the JWT
  const decoded = jwt.verify(verificationToken, publicKey, {
    algorithms: ["RS512"],
  }) as jwt.JwtPayload;

  // 3. Verify body hash matches JWT sub
  if (decoded.sub !== hash) {
    throw new Error("IPN body hash mismatch with JWT sub claim");
  }

  // 4. Verify audience matches posSignature
  if (decoded.aud !== posSignature) {
    throw new Error("IPN audience mismatch with POS signature");
  }

  // 5. Parse and validate
  const parsedBody = JSON.parse(rawBody);
  return NetopiaIpnPayloadSchema.parse(parsedBody);
}
