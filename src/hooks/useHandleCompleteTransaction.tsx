import { useMutation, useQueryClient } from "react-query";

export const useHandleCompleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ txSignature }: { txSignature: string }): Promise<string> => {
      const request = await fetch(`/api/transaction/complete`, {
        method: "POST",
        body: JSON.stringify({
          txSignature,
        }),
      });

      const data = await request.json();
      if (!request.ok) {
        throw new Error(data.message);
      }

      return data.serializedTx;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries("complete-transaction");
      },
    }
  );
};
