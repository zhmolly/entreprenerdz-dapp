import type { NextApiRequest, NextApiResponse } from "next";

import { getSession } from "next-auth/react";
import { randomStringForEntropy } from "@stablelib/random";
import { getServerSession } from "next-auth";

type ResponseData = {
  nonce: string;
};

type ErrorData = {
  message: string;
};

export const createNonce = async (address: string) => {
  const nonce = randomStringForEntropy(48);
  if (!nonce || nonce.length < 8) {
    throw new Error("Error during nonce creation");
  }

  return nonce;
};

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

  const { address } = JSON.parse(req.body);

  if (!address) {
    return res.status(400).json({ message: "Missing address" });
  }

  const nonce = await createNonce(address);

  await prisma.user.update({
    where: {
      name: session.user.name,
    },
    data: {
      nonce
    }
  })

  // TODO: check if wallet exists
  res.status(200).json({ nonce });
}