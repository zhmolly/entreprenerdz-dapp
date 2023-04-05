import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import { useEntreprenerdzProgram } from "@/hooks/useEntreprenerdzProgram";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { StakeState } from "@/types";
import StakeForm from "@/components/StakeForm";
import { useGlobalState } from "@/hooks/useGlobalState";

export default function StakePage() {
  const session = useSession();
  const { publicKey, signAllTransactions } = useWallet();
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const program = useEntreprenerdzProgram(connection, wallet);
  const globalState = useGlobalState(program);

  const [stakes, setStakes] = useState<StakeState[]>();

  useEffect(() => {
    const fetchStakeAccounts = async () => {
      if (program && publicKey) {
        const stakeAccounts = await program.account.stakeAccount.all([
          {
            memcmp: {
              offset: 16,
              bytes: publicKey.toString(),
            },
          },
        ]);

        setStakes(
          stakeAccounts.map((stakeAccount) => ({
            idx: stakeAccount.account.idx.toNumber(),
            account: stakeAccount.publicKey,
            owner: stakeAccount.account.owner,
            entreprenerdzMints: stakeAccount.account.entreprenerdzMints,
            wlMint: stakeAccount.account.wlMint,
            totalStaked: stakeAccount.account.totalStaked,
            isFrozen: stakeAccount.account.isFrozen,
            stakedAt: stakeAccount.account.stakedAt.toNumber(),
          }))
        );
      } else {
        setStakes([]);
      }
    };

    fetchStakeAccounts();
  }, [program, publicKey]);

  return (
    <>
      <div className="container mx-auto">
        <Header />

        {!publicKey || !session || !program || !signAllTransactions ? (
          <p className="text-white text-2xl text-center">
            Connect wallet and sign with Discord
          </p>
        ) : (
          <div>
            {stakes &&
              globalState &&
              stakes.map((stakeState) => (
                <StakeForm
                  key={`stake-form-${stakeState.idx}`}
                  stakeState={stakeState}
                  globalState={globalState}
                  publicKey={publicKey}
                  connection={connection}
                  program={program}
                  signAllTransactions={signAllTransactions}
                />
              ))}
          </div>
        )}
      </div>
    </>
  );
}
