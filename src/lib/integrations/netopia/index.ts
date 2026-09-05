import { NetopiaClient } from "./client";
import type { NetopiaConfig } from "./types";

export * from "./types";
export * from "./client";
export { verifyIpn } from "./ipn";

const netopiaConfig: NetopiaConfig = {
  apiKey: process.env.NETOPIA_API_KEY ?? "",
  posSignature: process.env.NETOPIA_POS_SIGNATURE ?? "",
  isLive: process.env.NETOPIA_IS_LIVE === "true",
  publicKey: process.env.NETOPIA_PUBLIC_KEY ?? "",
};

export const netopiaClient = new NetopiaClient(netopiaConfig);
