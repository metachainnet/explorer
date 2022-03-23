import { useEffect, useMemo } from "react";
import { Signature } from "components/common/Signature";
import { Slot } from "components/common/Slot";
import Moment from "react-moment";
import { PublicKey } from "@solana/web3.js";
import {
  useAccountHistory,
  useFetchAccountHistory,
} from "providers/accounts/history";
import {
  getTransactionRows,
  HistoryCardFooter,
  HistoryCardHeader,
} from "../HistoryCardComponents";
import { FetchStatus } from "providers/cache";
import { LoadingCard } from "components/common/LoadingCard";
import { ErrorCard } from "components/common/ErrorCard";
import StyledTable from "components/StyledTable";

export function TransactionHistoryCard({ pubkey }: { pubkey: PublicKey }) {
  const address = pubkey.toBase58();
  const history = useAccountHistory(address);
  const fetchAccountHistory = useFetchAccountHistory();
  const refresh = () => fetchAccountHistory(pubkey, false, true);
  const loadMore = () => fetchAccountHistory(pubkey, false);

  const transactionRows = useMemo(() => {
    if (history?.data?.fetched) {
      return getTransactionRows(history.data.fetched);
    }
    return [];
  }, [history]);

  useEffect(() => {
    if (!history) {
      refresh();
    }
  }, [address]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!history) {
    return null;
  }

  if (history?.data === undefined) {
    if (history.status === FetchStatus.Fetching) {
      return <LoadingCard message="Loading history" />;
    }

    return (
      <ErrorCard retry={refresh} text="Failed to fetch transaction history" />
    );
  }

  const hasTimestamps = transactionRows.some((element) => element.blockTime);
  const detailsList: React.ReactNode[] = transactionRows.map(
    ({ slot, signature, blockTime, statusClass, statusText }) => {
      return (
        <tr key={signature}>
          <td>
            <Signature signature={signature} link truncate />
          </td>

          <td className="w-1">
            <Slot slot={slot} link />
          </td>

          {hasTimestamps && (
            <td className="text-muted">
              {blockTime ? <Moment date={blockTime * 1000} fromNow /> : "---"}
            </td>
          )}

          <td>
            <span className={`badge bg-${statusClass}`}>{statusText}</span>
          </td>
        </tr>
      );
    }
  );

  const fetching = history.status === FetchStatus.Fetching;
  return (
    <StyledTable
      cardHeader={
        <HistoryCardHeader
          fetching={fetching}
          refresh={() => refresh()}
          title="Transaction History"
        />
      }
      tableHead={["Transaction Signature", "Slot", "Age", "Result"]}
      tableBody={
        <>
          {detailsList}
          <HistoryCardFooter
            fetching={fetching}
            foundOldest={history.data.foundOldest}
            loadMore={() => loadMore()}
          />
        </>
      }
    />
  );
}
