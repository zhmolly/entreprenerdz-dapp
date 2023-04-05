import { NftType, WlType } from "@/types";
import { useQuery } from "react-query";

export const useFetchWalletNfts = ({
  address,
}: {
  address: string | undefined;
}) => {
  return useQuery<{
    entreprenerdzs: NftType[];
    wlTokens: WlType[];
  }>(["wallet-nfts", address], async () => {
    if (!address) {
      throw new Error("Invalid address");
    }

    const response = await fetch(`/api/wallet/nfts?address=${address}`);

    if (!response.ok) {
      throw new Error("Failed to fetch all nfts");
    }

    const data = await response.json();
    return {
      entreprenerdzs: data.entreprenerdzs,
      wlTokens: data.wlTokens,
    };
  }, {
    enabled: (address ?? "").length > 0
  });
};
