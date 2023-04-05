// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

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

    let data = await (
      await fetch(
        "https://moonrank.app/mints/entreprenerdz?after=0&seen=10000&complete=true&crawl_id=1633627904586801152"
      )
    ).json();

    const nfts = [];
    const nftTraits = [];
    for (var item of data["mints"]) {
      nfts.push({
        name: item["name"],
        image: item["image"],
        rank: item["rank"],
        mint: item["mint"],
      });

      for (var trait of item["rank_explain"]) {
        nftTraits.push({
          attribute: trait["attribute"],
          value: trait["value"],
          mint: item["mint"],
        });
      }
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