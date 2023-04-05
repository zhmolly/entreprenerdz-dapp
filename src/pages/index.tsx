import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import { useEntreprenerdzProgram } from "@/hooks/useEntreprenerdzProgram";
import {
  findEditionPda,
  findEscrowAccount,
  findFreezeAccount,
  findGlobalAccount,
  findMetadataPda,
  MEMO_PROGRAM_ID,
  METADATA_PROGRAM_ID,
  sleep,
} from "@/utils";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { useEffect, useMemo, useState } from "react";
import { NftType, WlType } from "@/types";
import { useGlobalState } from "@/hooks/useGlobalState";
import { useHandleRequestTransaction } from "@/hooks/useHandleRequestTransaction";
import { useFetchWalletNfts } from "@/hooks/useFetchWalletNfts";
import { toast } from "react-hot-toast";
import { ENTREPRENERDZ_STAKE_NUM } from "@/constants";
import {
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import EntreprenerdzCard from "@/components/EntreprenerdzCard";
import WlTokenCard from "@/components/WlTokenCard";
import { useRouter } from "next/router";
import { useHandleCompleteTransaction } from "@/hooks/useHandleCompleteTransaction";

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();
  const { publicKey, sendTransaction, signAllTransactions } = useWallet();
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const program = useEntreprenerdzProgram(connection, wallet);

  const globalState = useGlobalState(program);

  const [entreprenerdzs, setEntreprenerdzs] = useState<NftType[]>([]);
  const [wlTokens, setWlTokens] = useState<WlType[]>([]);
  const [selectedNfts, setSelectedNfts] = useState<string[]>([]);
  const [selectedWL, setSelectedWL] = useState<string>();
  const [isStaking, setStaking] = useState<boolean>(false);

  const handleRequestTransaction = useHandleRequestTransaction();
  const handleCompleteTransaction = useHandleCompleteTransaction();

  const { data, isLoading: walletLoading } = useFetchWalletNfts({
    address: publicKey?.toString(),
  });

  const verified = useMemo(() => {
    if (session && session.user.wallet && publicKey) {
      if (session.user.wallet == publicKey.toString()) {
        return true;
      }
    }

    return false;
  }, [
    session,
    publicKey
  ])

  useEffect(() => {
    if (data) {
      setEntreprenerdzs(data.entreprenerdzs);
      setWlTokens(data.wlTokens);
    }
  }, [data]);

  const handleSelectNft = (mint: string, isAdd: boolean) => {
    if (isAdd) {
      setSelectedNfts((prevNfts) => [...prevNfts, mint]);
    } else {
      setSelectedNfts((prevNfts) =>
        prevNfts.filter((item, i) => item !== mint)
      );
    }
  };

  const handleSelectToken = (mint: string) => {
    setSelectedWL(mint);
  };

  const handleStake = async () => {
    if (
      !connection ||
      !sendTransaction ||
      !publicKey ||
      !program ||
      !signAllTransactions
    ) {
      return toast.error("You need to connect wallet");
    }

    if (!verified) {
      return toast.error("You need to verify wallet");
    }

    if (selectedNfts.length != ENTREPRENERDZ_STAKE_NUM) {
      return toast.error(
        `You need to select ${ENTREPRENERDZ_STAKE_NUM} Entreprenerdz NFTs`
      );
    }

    if (!selectedWL) {
      return toast.error(`You need to select 1 Entreprenerdz WL Token`);
    }

    const toastId = toast.loading("Processing stake nfts...");
    setStaking(true);

    handleRequestTransaction.mutate(
      {
        wallet: publicKey.toString(),
        nftMints: selectedNfts,
        wlMint: selectedWL,
      },
      {
        onSuccess: async (resp) => {
          try {
            const tx = Transaction.from(bs58.decode(resp.serializedTx));

            const stakeAccount = new PublicKey(resp.stakeAccount);

            const txSignature = await sendTransaction(tx, connection, {
              preflightCommitment: "confirmed",
              maxRetries: 10,
            });
            console.log(txSignature);

            const [globalAccount] = findGlobalAccount();

            let stakeState;
            for (let i = 0; i < 10; i++) {
              stakeState = await program.account.stakeAccount.fetchNullable(
                stakeAccount,
                "confirmed"
              );
              if (stakeState) {
                break;
              }

              await sleep(3);
            }

            if (!stakeState) {
              toast.success(
                "Transaction not confirmed.\n You can check in stake page.",
                {
                  id: toastId,
                }
              );
              setStaking(false);
              return;
            }

            // Once paid, then start staking
            const { blockhash, lastValidBlockHeight } =
              await connection.getLatestBlockhash("confirmed");

            let txs = [];

            // Add nft stake ix
            for (let i = 0; i < ENTREPRENERDZ_STAKE_NUM; i++) {
              let mint = new PublicKey(selectedNfts[i]);
              const [escrowAccount] = findEscrowAccount(publicKey, mint);
              const metadataAccount = findMetadataPda(mint);
              const ownerTokenAccount = await getAssociatedTokenAddress(
                mint,
                publicKey
              );

              const ix = await program.methods
                .addStake(stakeState.idx)
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

            // Add freeze ix
            {
              let wlMint = new PublicKey(selectedWL);
              const [wlEscrow] = findFreezeAccount(publicKey, wlMint);
              const wlEdition = findEditionPda(wlMint);
              const wlMetadata = findMetadataPda(wlMint);
              const wlToken = await getAssociatedTokenAddress(
                wlMint,
                publicKey
              );

              const ix = await program.methods
                .freezeWl(stakeState.idx)
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

            // Sign and complete transaction
            txs = await signAllTransactions(txs);
            for (const tx of txs) {
              const txHash = await connection.sendRawTransaction(
                tx.serialize(),
                {
                  preflightCommitment: "confirmed",
                  maxRetries: 10,
                }
              );
              console.log(txHash);
            }

            handleCompleteTransaction.mutate(
              {
                txSignature
              },
              {
                onSuccess: () => {
                  toast.success("Stake nfts successed.", {
                    id: toastId,
                  });
                  setStaking(false);

                  setTimeout(() => {
                    router.push("/stake");
                  }, 2000);
                },
                onError: (ex: any) => {
                  console.log(ex);
                  toast.error(ex.toString(), {
                    id: toastId,
                  });
                  router.reload()
                  setStaking(false);
                },
              }
            );
          } catch (ex: any) {
            let errorMsg = "Stake nfts failed.";
            if (ex.message) {
              errorMsg = ex.message;
            }

            toast.error(errorMsg, {
              id: toastId,
            });
            setStaking(false);
          }
        },
        onError: (ex: any) => {
          let errorMsg = "Stake nfts request failed.";
          if (ex.message) {
            errorMsg = ex.message;
          }

          toast.error(errorMsg, {
            id: toastId,
          });
          setStaking(false);
        },
      }
    );
  };

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
            <div className="my-8 flex justify-between items-center">
              <p className="text-white text-2xl text-left">
                {`Select ${ENTREPRENERDZ_STAKE_NUM} Entreprenerdz NFTs and WL token with ${globalState?.stakeFee || "-"
                  } SOL`}
              </p>
              <button
                type="button"
                className="text-white bg-blue-500 hover:bg-blue-400 disabled:bg-blue-400 px-8 py-2 font-semibold rounded-lg text-xl"
                onClick={handleStake}
                disabled={isStaking || !verified}
              >
                Stake
              </button>
            </div>

            <div className="border border-gray-600 p-4 rounded-lg">
              {walletLoading ? (
                <p className="text-white py-8 text-center">
                  Loading Entreprenerdz NFTs...
                </p>
              ) : (
                <>
                  <div className="grid xl:grid-cols-8 md:grid-cols-4 xs:grid-cols-2 grid-cols-1 gap-4 w-full">
                    {entreprenerdzs &&
                      entreprenerdzs.map((nft, idx) => (
                        <EntreprenerdzCard
                          key={`{entre-${idx}}`}
                          nft={nft}
                          onSelect={handleSelectNft}
                        />
                      ))}
                  </div>

                  <div className="divider h-[1px] w-full bg-gray-400 my-4" />

                  <div className="grid xl:grid-cols-8 md:grid-cols-4 xs:grid-cols-2 grid-cols-1 gap-4 w-full">
                    {wlTokens &&
                      wlTokens.map((wlToken, idx) => (
                        <WlTokenCard
                          key={`{wl-${idx}}`}
                          wlToken={wlToken}
                          selectedWL={selectedWL}
                          onSelect={handleSelectToken}
                        />
                      ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
