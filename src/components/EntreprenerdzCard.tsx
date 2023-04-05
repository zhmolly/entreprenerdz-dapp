import { NftType } from "@/types";
import { useMemo, useState } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

export default function EntreprenerdzCard({
  nft,
  onSelect,
}: {
  nft: NftType;
  onSelect?: (nft: string, isAdd: boolean) => void;
}) {
  const [checked, setChecked] = useState<boolean>(false);

  const selectNft = () => {
    if (onSelect) {
      const _checked = !checked;
      setChecked(_checked);

      onSelect(nft.mint, _checked);
    }
  };

  return (
    <div
      className={`w-full rounded-lg border ${
        checked ? "border-white" : "border-gray-600"
      } cursor-pointer hover:border-gray-200 relative`}
      onClick={selectNft}
    >
      {checked && (
        <CheckCircleIcon
          className="absolute top-2 left-2 w-6"
          color="#00BFFF"
        />
      )}

      <img src={nft.image} alt={nft.name} className=" rounded-lg" />
      <div className="px-4 py-2">
        <p className="text-white text-md font-semibold">{nft.name}</p>
        <p className="text-gray-200 text-sm">Profession: {nft.profession}</p>
      </div>
    </div>
  );
}
