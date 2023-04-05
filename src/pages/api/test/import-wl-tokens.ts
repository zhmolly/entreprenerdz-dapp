// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

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

    let data = await (
      await fetch(
        "https://moonrank.app/mints/entreprenerdz_wl_token?after=0&seen=10000&complete=true&crawl_id=1633627904586801152"
      )
    ).json();

    const wlTokens = [];
    for (var item of data["mints"]) {
      wlTokens.push({
        name: item["name"],
        image: item["image"],
        mint: item["mint"],
      });

      numTokens++;
    }

    await prisma.wlToken.createMany({
      data: wlTokens,
    });

    res.status(200).json({ numTokens });
  } catch (ex: any) {
    console.log(ex);
    return res.status(500).json({ message: ex });
  }
}
