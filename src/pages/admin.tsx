import Header from "@/components/Header";
import { useEntreprenerdzProgram } from "@/hooks/useEntreprenerdzProgram";
import { useGlobalState } from "@/hooks/useGlobalState";
import { findGlobalAccount } from "@/utils";
import { BN } from "@project-serum/anchor";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

export default function Admin() {
  const router = useRouter();
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const program = useEntreprenerdzProgram(connection, wallet);
  const globalState = useGlobalState(program);

  const { register, handleSubmit, watch, setValue } = useForm();

  useEffect(() => {
    if (globalState && publicKey) {
      if (globalState) {
        if (!globalState.authority.equals(publicKey)) {
          router.push("/");
        } else {
          setValue("authority", globalState.authority.toString());
          setValue(
            "collection",
            globalState.entreprenerdzCollection.toString()
          );
          setValue("vault", globalState.vaultAccount.toString());
          setValue("collection", globalState.entreprenerdzCollection.toString());
          setValue("wlToken", globalState.wlTokenCreator.toString());
          setValue("lamports", globalState.stakeFee);
          setValue("period", globalState.stakePeriod);
        }
      } else {
        setValue("authority", publicKey.toString());
      }
    }
  }, [globalState, publicKey]);

  const onSubmit = async (data: any) => {
    if (!program || !publicKey) {
      return toast.error("You need to connect wallet first");
    }

    const vaultPubkey = new PublicKey(data.vault);
    const collectionPubkey = new PublicKey(data.collection);
    const wlTokenPubkey = new PublicKey(data.wlToken);
    const stakeFee = new BN(parseFloat(data.lamports) * LAMPORTS_PER_SOL);
    const stakePeriod = new BN(data.period);

    const [globalPDA, globalBump] = findGlobalAccount();

    const toastId = toast.loading("Processing...");

    if (!globalState) {
      try {
        const tx = await program.methods
          .initialize(stakeFee, stakePeriod)
          .accounts({
            authority: publicKey,
            globalAccount: globalPDA,
            vaultAccount: vaultPubkey,
            entreprenerdzCollection: collectionPubkey,
            wlTokenCreator: wlTokenPubkey,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
          })
          .rpc();
        toast.success("Initialize program successed.", {
          id: toastId,
        });
      } catch (ex) {
        toast.error("Initialize program failed.", {
          id: toastId,
        });
      }
    } else {
      const authorityPubkey = new PublicKey(data.authority);

      try {
        const tx = await program.methods
          .updateSetting(stakeFee, stakePeriod)
          .accounts({
            authority: publicKey,
            newAuthority: authorityPubkey,
            globalAccount: globalPDA,
            vaultAccount: vaultPubkey,
            entreprenerdzCollection: collectionPubkey,
            wlTokenCreator: wlTokenPubkey,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
          })
          .rpc();
        toast.success("Update setting successed.", {
          id: toastId,
        });
      } catch (ex) {
        toast.error("Update setting failed.", {
          id: toastId,
        });
      }
    }
  };

  return (
    <>
      <div className="container mx-auto">
        <Header />

        <p className="my-8 text-white text-2xl text-left">
          {`Initialize or update global setting of staking`}
        </p>

        <form onSubmit={handleSubmit((data) => onSubmit(data))}>
          <div className="grid gap-6 mb-6 md:grid-cols-2">
            <div className="block">
              <span className="text-white">Authority Pubkey</span>
              <input
                type="text"
                className="mt-1 block w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0"
                {...register("authority")}
              />
            </div>
            <div className="block">
              <span className="text-white">Vault Pubkey</span>
              <input
                type="text"
                className="mt-1 block w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0"
                {...register("vault")}
              />
            </div>
            <div className="block">
              <span className="text-white">Entre.Collection Address</span>
              <input
                type="text"
                className="mt-1 block w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0"
                {...register("collection")}
              />
            </div>
            <div className="block">
              <span className="text-white">WL Token Creator</span>
              <input
                type="text"
                className="mt-1 block w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0"
                {...register("wlToken")}
              />
            </div>
            <div className="block">
              <span className="text-white">Stake Fee (SOL)</span>
              <input
                type="text"
                className="mt-1 block w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0"
                {...register("lamports")}
              />
            </div>
            <div className="block">
              <span className="text-white">Stake Period (seconds)</span>
              <input
                type="text"
                className="mt-1 block w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0"
                {...register("period")}
              />
            </div>
          </div>

          <button
            type="submit"
            className="text-white bg-blue-500 hover:bg-blue-400 disabled:bg-blue-400 px-8 py-2 font-semibold rounded-lg text-xl"
          >
            {globalState ? "Update Setting" : "Initialize"}
          </button>
        </form>
      </div>
    </>
  );
}
