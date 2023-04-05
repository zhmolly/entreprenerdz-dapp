// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ENTREPRENERDZ_PROGRAM_ID, RPC_URL } from "@/constants";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

import { AnchorProvider, Program, Wallet } from "@project-serum/anchor";
import { EntreprenerdzProgram, IDL } from "@/entreprenerdz_program";
import { getSession } from "next-auth/react";
import { SolanaParser } from "@/utils/solana-parser";
import { MEMO_PROGRAM_ID } from "@/utils";
import { getServerSession } from "next-auth";

type ResponseData = {
  message: string;
};

type ErrorData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) {
  const session = await getServerSession(req, res, {});
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { txSignature } = JSON.parse(req.body);
    if (!txSignature) {
      return res.status(400).json({ message: "Missing signature param" });
    }

    const connection = new Connection(RPC_URL, {
      commitment: "confirmed",
    });
    const authorityWallet = new Wallet(Keypair.generate());
    const provider = new AnchorProvider(connection, authorityWallet, {
      commitment: "confirmed",
    });
    const program = new Program<EntreprenerdzProgram>(
      IDL,
      ENTREPRENERDZ_PROGRAM_ID,
      provider
    );
    const parser = new SolanaParser([
      {
        idl: IDL,
        programId: ENTREPRENERDZ_PROGRAM_ID,
      }
    ])

    // parse transaction signature
    const parsedTransactions = await parser.parseTransaction(connection, txSignature, false);
    if (!parsedTransactions || parsedTransactions.length == 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // parse stake instruction
    const stakeTransaction = parsedTransactions[0];
    if (stakeTransaction.name != "createStake") {
      return res.status(500).json({ message: "Invalid transaction id" });
    }

    const userWallet = stakeTransaction.accounts.filter(a => a.name == 'owner')[0].pubkey;
    const stakeAccount = stakeTransaction.accounts.filter(a => a.name == 'stakeAccount')[0].pubkey;

    // parse memo instruction
    const memoTransaction = parsedTransactions[1];
    if (!memoTransaction.programId.equals(MEMO_PROGRAM_ID)) {
      return res.status(500).json({ message: "Invalid memo pubkey" });
    }

    if (!memoTransaction.accounts[0].pubkey.equals(userWallet)) {
      return res.status(500).json({ message: "Invalid memo account" });
    }

    const memoInput = (memoTransaction.args as any)['unknown'].toString();
    const memoData = JSON.parse(memoInput);
    if (!memoData['store']
      || !memoData['type']
      || !memoData['username']) {
      return res.status(500).json({ message: "Invalid memo data" });
    }

    if (memoData['store'] != 'ENTREPRENERDZ'
      || memoData['type'] != 'stake') {
      return res.status(500).json({ message: "Invalid memo type" });
    }

    const username = memoData['username']

    // validate stake account
    const stakeState = await program.account.stakeAccount.fetchNullable(
      stakeAccount
    );
    if (!stakeState || !stakeState.owner.equals(userWallet)) {
      return res.status(400).json({ message: "Stake owner not valid" });
    }
    if (stakeState.totalStaked < 8 || !stakeState.isFrozen) {
      return res.status(400).json({ message: "You need to stake all tokens or freeze wl token to get rewards" });
    }

    const entreMints = stakeState.entreprenerdzMints
      .map((mint) => mint.toString())
      .join(",");
    await prisma.stakeTransaction.create({
      data: {
        txSignature,
        discordId: username,
        wallet: stakeState.owner.toString(),
        wlMint: stakeState.wlMint.toString(),
        entreMints: entreMints,
        stakeAt: new Date(stakeState.createdAt.toNumber() * 1000),
      },
    });

    res.status(200).json({ message: "Transaction recorded" });
  } catch (ex: any) {
    console.log(ex);
    return res.status(500).json({ message: ex });
  }
}
