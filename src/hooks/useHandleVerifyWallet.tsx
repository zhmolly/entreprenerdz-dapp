import { User } from "@prisma/client";
import { useMutation } from "react-query";


export const useHandleVerifyWallet = () => {
  return useMutation(
    async ({
      address,
      signedMessage,
      memoTx,
    }: {
      address: string;
      signedMessage?: string;
      memoTx?: string
    }): Promise<User> => {
      const request = await fetch("/api/auth/verify-wallet", {
        method: "PUT",
        body: JSON.stringify({
          address,
          signedMessage,
          memoTx
        }),
      });

      const data = await request.json();
      if (!request.ok) {
        throw new Error(data.message);
      }

      const user = data.user;
      return user;
    }
  );
};
