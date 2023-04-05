import { clusterApiUrl, PublicKey } from "@solana/web3.js";

export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ?? clusterApiUrl("mainnet-beta");

export const ENTREPRENERDZ_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_ENTREPRENERDZ_PROGRAM_ID ?? ""
);

export const PROFESSIONS = [
  "Code Wizard",
  "Trader",
  "Degen",
  "Marketer",
  "Artist",
  "Entrepreneur",
  "Business Developer",
  "Accountant",
];

export const ENTREPRENERDZ_STAKE_NUM = 8;
