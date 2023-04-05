import { ENTREPRENERDZ_PROGRAM_ID } from "@/constants";
import * as anchor from "@project-serum/anchor";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

export const PREFIX = "entreprenerdz";
export const STAKE_PREFIX = "stake";
export const FREEZE_PREFIX = "freeze";
export const ESCROW_PREFIX = "escrow";

export const METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);
export const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
);

export const findMetadataPda = (mint: PublicKey): PublicKey => {
  const [metadata] = findProgramAddressSync(
    [Buffer.from("metadata"), METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    METADATA_PROGRAM_ID
  );

  return metadata;
};

export const findEditionPda = (mint: PublicKey): PublicKey => {
  const [edition] = findProgramAddressSync(
    [
      Buffer.from("metadata"),
      METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
      Buffer.from("edition"),
    ],
    METADATA_PROGRAM_ID
  );

  return edition;
};

export const findGlobalAccount = (): [PublicKey, number] => {
  return findProgramAddressSync(
    [Buffer.from(PREFIX)],
    ENTREPRENERDZ_PROGRAM_ID
  );
};

export const findStakeAccount = (
  order_idx: anchor.BN,
  payer: PublicKey
): [PublicKey, number] => {
  return findProgramAddressSync(
    [
      Buffer.from(PREFIX),
      payer.toBuffer(),
      order_idx.toArrayLike(Buffer, "be", 8),
      Buffer.from(STAKE_PREFIX),
    ],
    ENTREPRENERDZ_PROGRAM_ID
  );
};

export const findFreezeAccount = (
  owner: PublicKey,
  mint: PublicKey
): [PublicKey, number] => {
  return findProgramAddressSync(
    [
      Buffer.from(PREFIX),
      owner.toBuffer(),
      mint.toBuffer(),
      Buffer.from(FREEZE_PREFIX),
    ],
    ENTREPRENERDZ_PROGRAM_ID
  );
};

export const findEscrowAccount = (
  owner: PublicKey,
  mint: PublicKey
): [PublicKey, number] => {
  return findProgramAddressSync(
    [
      Buffer.from(PREFIX),
      owner.toBuffer(),
      mint.toBuffer(),
      Buffer.from(ESCROW_PREFIX),
    ],
    ENTREPRENERDZ_PROGRAM_ID
  );
};

export const sleep = async (seconds: number) => {
  await new Promise((f) => setTimeout(f, 1000 * seconds));
};

export const shortenPublicKey = (publicKey: string | undefined) => {
  return `${publicKey?.slice(0, 4)}...${publicKey?.slice(-4)}`;
};
