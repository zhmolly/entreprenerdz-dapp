import type { NextApiRequest, NextApiResponse } from "next";

import { getSession } from "next-auth/react";
import { Connection } from "@solana/web3.js";
import { RPC_URL } from "@/constants";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import nacl from "tweetnacl";
import { User } from "@prisma/client";
import { getServerSession } from "next-auth";

type ResponseData = {
  user: User;
};

type ErrorData = {
  message: string;
};

const connection = new Connection(RPC_URL);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) {
  const session = await getServerSession(req, res, {});
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { address, signedMessage, memoTx } = JSON.parse(
    req.body
  );

  if (!memoTx) {
    if (!signedMessage) {
      return res.status(400).json({ message: "Missing signed message" });
    }
  }

  const user = await prisma.user.findUnique({
    where: {
      name: session.user.name,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (memoTx) {
    let tx;
    for (let i = 0; i < 10; i++) {
      const foundTx = await connection.getTransaction(memoTx as string, {
        commitment: 'confirmed',
      });

      if (foundTx) {
        tx = foundTx;
        break;
      }
      await new Promise((r) => setTimeout(r, 3000));
    }

    if (!tx) {
      return res.send({
        message: "Transaction is not found",
      });
    }

    if (
      !tx.transaction.message.accountKeys
        .map((a) => a.toString())
        .includes(address)
    ) {
      return res.send({
        message: "Transaction is not signed by this address",
      });
    }
  }
  else {
    try {
      const rawMessage = `Verify wallet ownership by signing this message \n Nonce: ${user.nonce}`;
      const decodedMessage = new TextEncoder().encode(rawMessage);
      const decodedSignedMesage = bs58.decode(signedMessage);
      const decodedAddress = bs58.decode(address);

      const isVerified = !!nacl.sign.detached.verify(
        decodedMessage,
        decodedSignedMesage,
        decodedAddress
      );
      if (!isVerified) {
        return res.send({
          message: "Signed message mismatched",
        });
      }
    } catch (error) {
      console.log(error);
      return res.send({
        message: "Signed message verification failed",
      });
    }
  }

  const updatedUser = await prisma.user.update({
    where: {
      name: session.user.name,
    },
    data: {
      wallet: address as string
    }
  })

  res.status(200).json({ user: updatedUser });
}
