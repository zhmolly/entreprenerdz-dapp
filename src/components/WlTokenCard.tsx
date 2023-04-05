import { WlType } from "@/types";
import { useMemo, useState } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

export default function WlTokenCard({
  wlToken,
  selectedWL,
  onSelect,
}: {
  wlToken: WlType;
  selectedWL?: string | undefined;
  onSelect?: (mint: string) => void;
}) {
  const checked = useMemo(() => {
    if (wlToken.mint == selectedWL) {
      return true;
    }

    return false;
  }, [selectedWL, wlToken]);

  const selectToken = () => {
    if (onSelect) {
      onSelect(wlToken.mint);
    }
  };

  return (
    <div
      className={`w-full rounded-lg border ${
        checked ? "border-white" : "border-gray-600"
      } cursor-pointer hover:border-gray-200 relative`}
      onClick={selectToken}
    >
      {checked && (
        <CheckCircleIcon
          className="absolute top-2 left-2 w-6"
          color="#FFFFFF"
        />
      )}

      <img src={wlToken.image} alt={wlToken.name} className="rounded-lg" />
      <div className="px-4 py-2">
        <p className="text-white text-md font-semibold">{wlToken.name}</p>
      </div>
    </div>
  );
}
