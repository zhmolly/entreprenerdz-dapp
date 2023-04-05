// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { Metadata, Metaplex } from "@metaplex-foundation/js";
import { Connection, PublicKey } from "@solana/web3.js";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { PROFESSIONS, RPC_URL } from "@/constants";

const WL_COLLECTION = "7U3qDv2y9PKoTJ9eTxm5ncarwuWrzr9TzK37QnCSoXfn";

type ResponseData = {
  numTokens: number;
};

type ErrorData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) {
  try {
    let numTokens = 0;

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
      (nft) =>
        nft.creators.length > 0 &&
        nft.creators[0].address.toString() == WL_COLLECTION
    ) as Metadata[];

    const nfts = [];
    for (var item of walletNfts) {
      const mint = item.mintAddress.toString();
      nfts.push({
        name: item.name,
        image:
          "https://nftstorage.link/ipfs/bafybeidiyxgui5awfdaebjfgculq7ovkzuc2nph4ticmoyluzs56xz66ai/0.png",
        mint: mint,
      });

      numTokens++;
    }

    await prisma.wlToken.createMany({
      data: nfts,
    });

    res.status(200).json({ numTokens });
  } catch (ex: any) {
    console.log(ex);
    return res.status(500).json({ message: ex });
  }
}
