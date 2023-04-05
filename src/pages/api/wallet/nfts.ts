// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { RPC_URL } from "@/constants";
import { NftType } from "@/types";
import { Metadata, Metaplex } from "@metaplex-foundation/js";
import { Connection, PublicKey } from "@solana/web3.js";
import {
  getAssociatedTokenAddressSync,
  getMultipleAccounts,
} from "@solana/spl-token";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { WlToken } from "@prisma/client";

type ResponseData = {
  entreprenerdzs: NftType[];
  wlTokens: WlToken[];
};

type ErrorData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { address } = req.query;
    if (!address) {
      return res.status(400).json({ message: "Wallet address not valid" });
    }

    const connection = new Connection(RPC_URL);
    const metaplex = new Metaplex(connection);
    const owner = new PublicKey(address);

    const walletNfts = (await metaplex.nfts().findAllByOwner({
      owner,
    })) as Metadata[];
    const mintAddresses = walletNfts.map((nft) => nft.mintAddress.toString());

    const _nfts = await prisma.nft.findMany({
      where: {
        mint: {
          in: mintAddresses,
        },
      },
      include: {
        traits: {
          where: {
            attribute: "Profession",
          },
          select: {
            value: true,
          },
        },
      },
    });

    const entreprenerdzs = _nfts
      .map((nft) => {
        const profession = nft.traits[0].value ?? "";

        return {
          name: nft.name,
          image: nft.image,
          mint: nft.mint,
          rank: nft.rank,
          profession,
        };
      })
      .sort((a, b) => a.profession.localeCompare(b.profession));

    let wlTokens = await prisma.wlToken.findMany({
      where: {
        mint: {
          in: mintAddresses,
        },
      },
    });

    // Get token accounts
    const wlTokenAccounts = wlTokens.map((token) =>
      getAssociatedTokenAddressSync(new PublicKey(token.mint), owner)
    );
    const wlTokensInfo = await getMultipleAccounts(
      connection,
      wlTokenAccounts,
      "confirmed"
    );

    // Exclude freeze accounts
    const unfreezeWlMints = wlTokensInfo
      .filter((tokenInfo) => !tokenInfo.isFrozen)
      .map((tokenInfo) => tokenInfo.mint.toString());
    wlTokens = wlTokens.filter((token) => unfreezeWlMints.includes(token.mint));

    res.status(200).json({ entreprenerdzs, wlTokens });
  } catch (ex: any) {
    console.log(ex);
    return res.status(500).json({ message: ex });
  }
}
