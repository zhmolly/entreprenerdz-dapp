import { ENTREPRENERDZ_PROGRAM_ID } from "@/constants";
import { IDL } from "@/entreprenerdz_program";
import * as anchor from "@project-serum/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

import { useMemo } from "react";

export const useEntreprenerdzProgram = (
  connection: anchor.web3.Connection,
  anchorWallet: AnchorWallet | undefined
) => {
  const program = useMemo(() => {
    if (anchorWallet) {
      const provider = new anchor.AnchorProvider(
        connection,
        anchorWallet,
        anchor.AnchorProvider.defaultOptions()
      );
      return new anchor.Program(IDL, ENTREPRENERDZ_PROGRAM_ID, provider);
    }
  }, [connection, anchorWallet]);

  return program;
};
