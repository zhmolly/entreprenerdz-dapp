import { EntreprenerdzProgram, IDL } from "@/entreprenerdz_program";
import { GlobalState } from "@/types";
import { findGlobalAccount } from "@/utils";
import * as anchor from "@project-serum/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

import { useEffect, useState } from "react";

export const useGlobalState = (
  program: anchor.Program<EntreprenerdzProgram> | undefined
) => {
  const [globalState, setGlobalState] = useState<GlobalState | null>();

  useEffect(() => {
    const fetchGlobalState = async () => {
      if (program) {
        const [globalPDA] = findGlobalAccount();
        const globalAccount = await program.account.globalAccount.fetchNullable(
          globalPDA
        );

        if (globalAccount) {
          setGlobalState({
            authority: globalAccount.authority,
            entreprenerdzCollection: globalAccount.entreprenerdzCollection,
            wlTokenCreator: globalAccount.wlTokenCreator,
            vaultAccount: globalAccount.vaultAccount,
            stakeFee: globalAccount.stakeFee.toNumber() / LAMPORTS_PER_SOL,
            stakePeriod: globalAccount.stakePeriod.toNumber()
          });
        } else {
          setGlobalState(null);
        }
      }
    };

    fetchGlobalState();
  }, [program]);

  return globalState;
};
