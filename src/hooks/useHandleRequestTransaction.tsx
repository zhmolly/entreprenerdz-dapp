import { useMutation, useQueryClient } from "react-query";

type RequestTransactionResponse = {
  serializedTx: string;
  stakeAccount: string;
};

export const useHandleRequestTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({
      wallet,
      nftMints,
      wlMint,
    }: {
      wallet: string;
      nftMints: string[];
      wlMint: string;
    }): Promise<RequestTransactionResponse> => {
      const request = await fetch(`/api/transaction/request`, {
        method: "POST",
        body: JSON.stringify({
          wallet,
          nftMints,
          wlMint,
        }),
      });

      const data = await request.json();
      if (!request.ok) {
        throw new Error(data.message);
      }

      return {
        serializedTx: data.serializedTx,
        stakeAccount: data.stakeAccount,
      };
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries("request-transaction");
      },
    }
  );
};
