import { PublicKey } from "@solana/web3.js";

export type NftType = {
  name: string;
  mint: string;
  image: string;
  rank: number;
  profession: string;
};

export type WlType = {
  name: string;
  mint: string;
  image: string;
};

export type GlobalState = {
  authority: PublicKey;
  entreprenerdzCollection: PublicKey;
  wlTokenCreator: PublicKey;
  vaultAccount: PublicKey;
  stakeFee: number;
  stakePeriod: number;
};

export type StakeState = {
  idx: number;
  account: PublicKey;
  owner: PublicKey;
  entreprenerdzMints: PublicKey[];
  wlMint: PublicKey;
  isFrozen: boolean;
  totalStaked: number;
  stakedAt: number;
};
