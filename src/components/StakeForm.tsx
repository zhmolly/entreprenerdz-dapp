import { GlobalState, NftType, StakeState, WlType } from "@/types";
import { useEffect, useMemo, useState } from "react";
import {
  Connection,
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import EntreprenerdzCard from "./EntreprenerdzCard";
import WlTokenCard from "./WlTokenCard";
import { toast } from "react-hot-toast";
import { BN } from "@project-serum/anchor";
import {
  SignerWalletAdapterProps,
  WalletAdapterProps,
} from "@solana/wallet-adapter-base";
import { useFetchStakeNfts } from "@/hooks/useFetchStakeNfts";
import { Program } from "@project-serum/anchor";
import { EntreprenerdzProgram } from "@/entreprenerdz_program";
import {
  findEditionPda,
  findEscrowAccount,
  findFreezeAccount,
  findGlobalAccount,
  findMetadataPda,
  findStakeAccount,
  METADATA_PROGRAM_ID,
} from "@/utils";
import { ENTREPRENERDZ_STAKE_NUM } from "@/constants";
import { useHandleCompleteTransaction } from "@/hooks/useHandleCompleteTransaction";
import { useRouter } from "next/router";

export default function StakeForm({
  stakeState,
  globalState,
  publicKey,
  connection,
  program,
  signAllTransactions,
}: {
  stakeState: StakeState;
  globalState: GlobalState;
  publicKey: PublicKey;
  connection: Connection;
  program: Program<EntreprenerdzProgram>;
  signAllTransactions: SignerWalletAdapterProps["signAllTransactions"];
}) {
  const [entreprenerdzs, setEntreprenerdzs] = useState<NftType[]>([]);
  const [wlToken, setWlToken] = useState<WlType>();
  const [isProcessing, setProcessing] = useState<boolean>(false);

  const router = useRouter();

  const { data, isLoading: walletLoading, refetch } = useFetchStakeNfts({
    account: stakeState.account.toString(),
  });

  const unstakeTime = useMemo(() => {
    if (stakeState && stakeState.stakedAt > 0) {
      return new Date((stakeState.stakedAt + globalState.stakePeriod) * 1000);
    }
    return null;
  }, [stakeState]);

  const isUnstakeAvailable = useMemo(() => {
    if (unstakeTime) {
      const now = new Date().getTime();
      return now > unstakeTime.getTime();
    }

    return false;
  }, [unstakeTime]);

  useEffect(() => {
    if (data) {
      setEntreprenerdzs(data.entreprenerdzs);
      setWlToken(data.wlToken);
    }
  }, [data]);

  const handleStake = () => {
    const completeStake = async () => {
      const toastId = toast.loading("Processing stake nfts...");
      setProcessing(true);

      try {
        const { blockhash, lastValidBlockHeight } =
          await connection.getLatestBlockhash("confirmed");

        const stakeIdx = new BN(stakeState.idx);

        const [globalAccount] = findGlobalAccount();
        const [stakeAccount] = findStakeAccount(stakeIdx, publicKey);

        let txs = [];

        // Add missing stakes ix
        for (let i = 0; i < ENTREPRENERDZ_STAKE_NUM; i++) {
          let mint = stakeState.entreprenerdzMints[i];
          const [escrowAccount] = findEscrowAccount(publicKey, mint);
          const metadataAccount = findMetadataPda(mint);
          const ownerTokenAccount = await getAssociatedTokenAddress(
            mint,
            publicKey
          );
          const balanceInfo = await connection.getTokenAccountBalance(
            ownerTokenAccount
          );
          if (!balanceInfo.value.uiAmount || balanceInfo.value.uiAmount == 0) {
            continue;
          }

          const ix = await program.methods
            .addStake(stakeIdx)
            .accounts({
              globalAccount,
              owner: publicKey,
              stakeAccount,
              mint,
              metadataAccount,
              ownerTokenAccount,
              escrowAccount,
              metadataProgram: METADATA_PROGRAM_ID,
              tokenProgram: TOKEN_PROGRAM_ID,
              systemProgram: SystemProgram.programId,
              rent: SYSVAR_RENT_PUBKEY,
            })
            .instruction();

          const tx = new Transaction({
            lastValidBlockHeight,
            blockhash,
            feePayer: publicKey,
          }).add(ix);
          txs.push(tx);
        }

        // Add freeze ix if not freeze
        if (!stakeState.isFrozen) {
          let wlMint = stakeState.wlMint;
          const [wlEscrow] = findFreezeAccount(publicKey, wlMint);
          const wlEdition = findEditionPda(wlMint);
          const wlMetadata = findMetadataPda(wlMint);
          const wlToken = await getAssociatedTokenAddress(wlMint, publicKey);

          const ix = await program.methods
            .freezeWl(new BN(stakeState.idx))
            .accounts({
              owner: publicKey,
              globalAccount,
              stakeAccount,
              escrowAccount: wlEscrow,
              wlMint,
              wlEdition,
              wlMetadata,
              wlToken,
              metadataProgram: METADATA_PROGRAM_ID,
              tokenProgram: TOKEN_PROGRAM_ID,
              systemProgram: SystemProgram.programId,
              rent: SYSVAR_RENT_PUBKEY,
            })
            .instruction();

          const tx = new Transaction({
            lastValidBlockHeight,
            blockhash,
            feePayer: publicKey,
          }).add(ix);
          txs.push(tx);
        }

        txs = await signAllTransactions(txs);
        for (const tx of txs) {
          const txHash = await connection.sendRawTransaction(tx.serialize(), {
            preflightCommitment: "confirmed",
            maxRetries: 10,
          });
          console.log(txHash);
        }

        toast.success("Stake nfts successed.", {
          id: toastId,
        });

        refetch();
        setProcessing(false);
      } catch (ex) {
        console.log(ex);
        toast.error("Stake nfts failed.", {
          id: toastId,
        });
        setProcessing(false);
      }
    };

    completeStake();
  };

  const handleUnstake = () => {
    const completeUnstake = async () => {
      const toastId = toast.loading("Processing unstake nfts...");
      setProcessing(true);

      try {
        const { blockhash, lastValidBlockHeight } =
          await connection.getLatestBlockhash("confirmed");

        const stakeIdx = new BN(stakeState.idx);

        const [globalAccount] = findGlobalAccount();
        const [stakeAccount] = findStakeAccount(stakeIdx, publicKey);

        let txs = [];

        for (let i = stakeState.totalStaked - 1; i >= 0; i--) {
          let mint = stakeState.entreprenerdzMints[i];
          const [escrowAccount] = findEscrowAccount(publicKey, mint);
          const ownerTokenAccount = await getAssociatedTokenAddress(
            mint,
            publicKey
          );

          const ix = await program.methods
            .unstake(stakeIdx)
            .accounts({
              owner: publicKey,
              globalAccount,
              stakeAccount,
              mint,
              ownerTokenAccount,
              escrowAccount,
              tokenProgram: TOKEN_PROGRAM_ID,
              systemProgram: SystemProgram.programId,
              rent: SYSVAR_RENT_PUBKEY,
            })
            .instruction();

          const tx = new Transaction({
            lastValidBlockHeight,
            blockhash,
            feePayer: publicKey,
          }).add(ix);
          txs.push(tx);
        }

        {
          const wlMint = stakeState.wlMint;
          const wlEdition = findEditionPda(wlMint);
          const [wlEscrow] = findFreezeAccount(publicKey, wlMint);
          const wlToken = await getAssociatedTokenAddress(wlMint, publicKey);

          const ix = await program.methods
            .unfreezeWl(stakeIdx)
            .accounts({
              owner: publicKey,
              globalAccount,
              stakeAccount,
              escrowAccount: wlEscrow,
              wlMint: wlMint,
              wlEdition,
              wlToken,
              metadataProgram: METADATA_PROGRAM_ID,
              tokenProgram: TOKEN_PROGRAM_ID,
              systemProgram: SystemProgram.programId,
              rent: SYSVAR_RENT_PUBKEY,
            })
            .instruction();

          const tx = new Transaction({
            lastValidBlockHeight,
            blockhash,
            feePayer: publicKey,
          }).add(ix);
          txs.push(tx);
        }

        txs = await signAllTransactions(txs);
        for (const tx of txs) {
          const txHash = await connection.sendRawTransaction(tx.serialize(), {
            preflightCommitment: "confirmed",
            maxRetries: 10,
          });
          console.log(txHash);
        }

        setTimeout(() => {
          toast.success("Unstake nfts successed.", {
            id: toastId,
          });
          setProcessing(false);

          router.reload();
        }, 3000);
      } catch (ex) {
        console.log(ex);

        toast.error("Unstake nfts failed.", {
          id: toastId,
        });
        setProcessing(false);
      }
    };

    completeUnstake();
  };

  return (
    <div>
      {stakeState && (
        <div className="my-8 flex justify-between items-center">
          {unstakeTime ? (
            <>
              <p className="text-white text-2xl text-left">
                {`Claim available date: ${unstakeTime.toISOString()}`} <br />
              </p>
              <button
                type="button"
                className="text-white bg-blue-500 hover:bg-blue-400 disabled:bg-blue-400 px-8 py-2 font-semibold rounded-lg text-xl"
                onClick={handleUnstake}
                disabled={!isUnstakeAvailable || isProcessing}
              >
                Claim
              </button>
            </>
          ) : (
            <>
              <p className="text-white text-2xl text-left">
                {`Complete stake nfts and freeze WL token`}
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  className="text-white bg-blue-500 hover:bg-blue-400 disabled:bg-blue-400 px-8 py-2 font-semibold rounded-lg text-xl"
                  onClick={handleStake}
                  disabled={isProcessing}
                >
                  Complete Stake
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <div className="border border-gray-600 p-4 rounded-lg">
        {walletLoading ? (
          <p className="text-white py-8 text-center">Loading ...</p>
        ) : (
          <div className="flex gap-4 w-full overflow-x-auto">
            {entreprenerdzs &&
              entreprenerdzs.map((nft, idx) => (
                <EntreprenerdzCard key={idx} nft={nft} />
              ))}

            {wlToken && <WlTokenCard wlToken={wlToken} />}
          </div>
        )}
      </div>
    </div>
  );
}
