import { Status, useFetchSupply, useSupply } from "providers/supply";
import { useEffect } from "react";
import { SolBalance } from "utils";
import { ErrorCard } from "./common/ErrorCard";
import { LoadingCard } from "./common/LoadingCard";
import StyledTable from "./StyledTable";

export function SupplyCard() {
  const supply = useSupply();
  const fetchSupply = useFetchSupply();

  // Fetch supply on load
  useEffect(() => {
    if (supply === Status.Idle) fetchSupply();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (supply === Status.Disconnected) {
    return <ErrorCard text="Not connected to the cluster" />;
  }

  if (supply === Status.Idle || supply === Status.Connecting)
    return <LoadingCard />;

  if (typeof supply === "string") {
    return <ErrorCard text={supply} retry={fetchSupply} />;
  }

  return (
    <StyledTable
      tableCaption="Supply Overview"
      tableBody={
        <>
          <tr>
            <td className="w-100">Total Supply (SOL)</td>
            <td className="text-end">
              <SolBalance lamports={supply.total} maximumFractionDigits={0} />
            </td>
          </tr>

          <tr>
            <td className="w-100">Circulating Supply (SOL)</td>
            <td className="text-end">
              <SolBalance
                lamports={supply.circulating}
                maximumFractionDigits={0}
              />
            </td>
          </tr>

          <tr>
            <td className="w-100">Non-Circulating Supply (SOL)</td>
            <td className="text-end">
              <SolBalance
                lamports={supply.nonCirculating}
                maximumFractionDigits={0}
              />
            </td>
          </tr>
        </>
      }
    />
  );
}
