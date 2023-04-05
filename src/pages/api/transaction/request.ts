// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ENTREPRENERDZ_PROGRAM_ID, PROFESSIONS, RPC_URL } from "@/constants";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { AnchorProvider, Program, Wallet } from "@project-serum/anchor";
import { findGlobalAccount, findStakeAccount, MEMO_PROGRAM_ID } from "@/utils";
import { EntreprenerdzProgram, IDL } from "@/entreprenerdz_program";
import { getSession } from "next-auth/react";
import { getServerSession } from "next-auth";

type ResponseData = {
  serializedTx: string;
  stakeAccount: string;
};

type ErrorData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>,
) {
  const session = await getServerSession(req, res, {});
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { wallet, nftMints, wlMint } = JSON.parse(req.body);
    if (!wallet || !nftMints || !wlMint) {
      return res.status(400).json({ message: "Missing params" });
    }

    // Validate profession traits
    const nfts = await prisma.nftTrait.findMany({
      where: {
        attribute: "Profession",
        mint: {
          in: nftMints,
        },
      },
    });
    if (nfts.length != PROFESSIONS.length) {
      return res.status(400).json({ message: "You need to select exact nfts" });
    }

    const nftProfessions = nfts.map((nft) => nft.value);
    for (const profession of PROFESSIONS) {
      if (!nftProfessions.includes(profession)) {
        return res
          .status(400)
          .json({ message: `You need to add ${profession} nft` });
      }
    }

    const wlToken = await prisma.wlToken.findUnique({
      where: {
        mint: wlMint,
      },
    });
    if (!wlToken) {
      return res
        .status(400)
        .json({ message: "You need to select valid WL token" });
    }

    const authorityKeypair = Keypair.fromSecretKey(
      bs58.decode(process.env.AUTHORITY_WALLET ?? "")
    );
    const authorityWallet = new Wallet(authorityKeypair);
    console.log(authorityKeypair.publicKey.toString());

    const connection = new Connection(RPC_URL, {
      commitment: "confirmed",
    });
    const provider = new AnchorProvider(connection, authorityWallet, {
      commitment: "confirmed",
    });
    const program = new Program<EntreprenerdzProgram>(
      IDL,
      ENTREPRENERDZ_PROGRAM_ID,
      provider
    );

    const userPubkey = new PublicKey(wallet);
    const [globalAccount] = findGlobalAccount();
    const globalState = await program.account.globalAccount.fetchNullable(
      globalAccount
    );
    if (!globalState) {
      return res.status(400).json({ message: "Program not initialized" });
    }

    const [stakeAccount] = findStakeAccount(
      globalState.totalOrders,
      userPubkey
    );

    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash("confirmed");

    const remainingAccounts = [];
    for (const nftMint of nftMints) {
      remainingAccounts.push({
        pubkey: new PublicKey(nftMint),
        isSigner: false,
        isWritable: false,
      });
    }

    remainingAccounts.push({
      pubkey: new PublicKey(wlMint),
      isSigner: false,
      isWritable: false,
    });

    const tx = new Transaction({
      blockhash,
      lastValidBlockHeight,
      feePayer: userPubkey,
    });

    const ix = await program.methods
      .createStake()
      .accounts({
        authority: authorityKeypair.publicKey,
        owner: userPubkey,
        globalAccount,
        stakeAccount,
        vaultAccount: globalState.vaultAccount,
        systemProgram: SystemProgram.programId,
      })
      .remainingAccounts(remainingAccounts)
      .instruction();
    tx.add(ix);


    const txData = {
      store: "ENTREPRENERDZ",
      type: "stake",
      username: session.user.name,
      discordId: session.user.discordId,
    };

    tx.add(new TransactionInstruction({
      keys: [
        {
          pubkey: userPubkey,
          isSigner: true,
          isWritable: true
        }
      ],
      data: Buffer.from(JSON.stringify(txData).replace(" ", ""), "utf8"),
      programId: MEMO_PROGRAM_ID,
    }))

    tx.partialSign(authorityKeypair);

    const serializedTx = bs58.encode(
      tx.serialize({
        requireAllSignatures: false,
      })
    );

    res
      .status(200)
      .json({ serializedTx, stakeAccount: stakeAccount.toString() });
  } catch (ex: any) {
    console.log(ex);
    return res.status(500).json({ message: ex });
  }
}
