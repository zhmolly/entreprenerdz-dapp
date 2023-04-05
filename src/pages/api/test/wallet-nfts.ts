// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { Metadata, Metaplex } from "@metaplex-foundation/js";
import { Connection, PublicKey } from "@solana/web3.js";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { PROFESSIONS, RPC_URL } from "@/constants";

const ENTREPRENERDZ_COLLECTION = "5iYYCirG8ZVVLp1C36JNYiJNXjitwNhhN132ifWpNxaK";

type ResponseData = {
  numNfts: number;
};

type ErrorData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) {
  try {
    let numNfts = 0;

    const { address } = req.query;
    if (!address) {
      return res.status(400).json({ message: "Wallet address not valid" });
    }

    const connection = new Connection(RPC_URL);
    const metaplex = new Metaplex(connection);
    const publicKey = new PublicKey(address);

    const walletNfts = (
      await metaplex.nfts().findAllByOwner({
        owner: publicKey,
      })
    ).filter(
      (nft) => nft.collection?.address.toString() == ENTREPRENERDZ_COLLECTION
    ) as Metadata[];

    const nfts = [];
    const nftTraits = [];

    for (var item of walletNfts) {
      const mint = item.mintAddress.toString();
      nfts.push({
        name: item.name,
        image:
          "https://creator-hub-prod.s3.us-east-2.amazonaws.com/entreprenerdz_pfp_1678070577551.png",
        mint: mint,
        rank: 1,
      });

      nftTraits.push({
        mint,
        attribute: "Profession",
        value: PROFESSIONS[Math.floor(Math.random() * PROFESSIONS.length)],
      });

      numNfts++;
    }

    await prisma.nft.createMany({
      data: nfts,
    });

    await prisma.nftTrait.createMany({
      data: nftTraits,
    });

    res.status(200).json({ numNfts });
  } catch (ex: any) {
    console.log(ex);
    return res.status(500).json({ message: ex });
  }
}
