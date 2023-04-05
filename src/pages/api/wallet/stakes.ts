// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ENTREPRENERDZ_PROGRAM_ID, RPC_URL } from "@/constants";
import { NftType } from "@/types";
import * as anchor from "@project-serum/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { Prisma, WlToken } from "@prisma/client";
import { IDL } from "@/entreprenerdz_program";

type ResponseData = {
  entreprenerdzs: NftType[];
  wlToken: WlToken | null;
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
    const { account } = req.query;
    if (!account) {
      return res.status(400).json({ message: "Wallet address not valid" });
    }

    const stakeAccount = new PublicKey(account);
    const connection = new Connection(RPC_URL);

    const provider = new anchor.AnchorProvider(
      connection,
      new anchor.Wallet(Keypair.generate()),
      anchor.AnchorProvider.defaultOptions()
    );
    const program = new anchor.Program(IDL, ENTREPRENERDZ_PROGRAM_ID, provider);

    const stakeState = await program.account.stakeAccount.fetch(stakeAccount);
    if (!stakeState) {
      return res.status(400).json({ message: "No stake info in this wallet" });
    }

    const mintAddresses = stakeState.entreprenerdzMints.map((nft) =>
      nft.toString()
    );

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
      orderBy: {
        name: Prisma.SortOrder.asc,
      },
    });

    const entreprenerdzs = _nfts.map((nft) => {
      const profession = nft.traits[0].value ?? "";

      return {
        name: nft.name,
        image: nft.image,
        mint: nft.mint,
        rank: nft.rank,
        profession,
      };
    });

    const wlToken = await prisma.wlToken.findUnique({
      where: {
        mint: stakeState.wlMint.toString(),
      },
    });

    res.status(200).json({ entreprenerdzs, wlToken });
  } catch (ex: any) {
    console.log(ex);
    return res.status(500).json({ message: ex });
  }
}
