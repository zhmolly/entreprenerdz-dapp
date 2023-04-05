import { NftType, WlType } from "@/types";
import { useQuery } from "react-query";

export const useFetchStakeNfts = ({
  account,
}: {
  account: string;
}) => {
  return useQuery<{
    entreprenerdzs: NftType[];
    wlToken: WlType;
  }>(["wallet-stakes", account], async () => {
    const response = await fetch(`/api/wallet/stakes?account=${account}`);

    if (!response.ok) {
      throw new Error("Failed to fetch info");
    }

    const data = await response.json();
    return {
      entreprenerdzs: data.entreprenerdzs,
      wlToken: data.wlToken,
    };
  });
};
