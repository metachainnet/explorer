import { ConfirmedSignatureInfo, TransactionError } from "@solana/web3.js";

export type TransactionRow = {
  slot: number;
  signature: string;
  err: TransactionError | null;
  blockTime: number | null | undefined;
  statusClass: string;
  statusText: string;
  signatureInfo: ConfirmedSignatureInfo;
};

export function HistoryCardHeader({
  title,
  refresh,
  fetching,
}: {
  title: string;
  refresh: Function;
  fetching: boolean;
}) {
  return (
    <>
      <h3>{title}</h3>
      <button
        className="btn btn-outline-dark btn-sm"
        disabled={fetching}
        onClick={() => refresh()}
      >
        {fetching ? (
          <>
            <span className="spinner-grow spinner-grow-sm mr-2"></span>
            Loading
          </>
        ) : (
          <>
            <span className="fe fe-refresh-cw mr-2"></span>
            Refresh
          </>
        )}
      </button>
    </>
  );
}

export function HistoryCardFooter({
  fetching,
  foundOldest,
  loadMore,
}: {
  fetching: boolean;
  foundOldest: boolean;
  loadMore: Function;
}) {
  return (
    <tr>
      <td colSpan={4}>
        {foundOldest ? (
          <div className="text-muted text-center">Fetched full history</div>
        ) : (
          <button
            className="btn btn-primary w-100"
            onClick={() => loadMore()}
            disabled={fetching}
          >
            {fetching ? (
              <>
                <span className="spinner-grow spinner-grow-sm mr-2"></span>
                Loading
              </>
            ) : (
              "Load More"
            )}
          </button>
        )}
      </td>
    </tr>
  );
}

export function getTransactionRows(
  transactions: ConfirmedSignatureInfo[]
): TransactionRow[] {
  const transactionRows: TransactionRow[] = [];
  for (var i = 0; i < transactions.length; i++) {
    const slot = transactions[i].slot;
    const slotTransactions = [transactions[i]];
    while (i + 1 < transactions.length) {
      const nextSlot = transactions[i + 1].slot;
      if (nextSlot !== slot) break;
      slotTransactions.push(transactions[++i]);
    }

    for (let slotTransaction of slotTransactions) {
      let statusText;
      let statusClass;
      if (slotTransaction.err) {
        statusClass = "warning";
        statusText = "Failed";
      } else {
        statusClass = "success";
        statusText = "Success";
      }
      transactionRows.push({
        slot,
        signature: slotTransaction.signature,
        err: slotTransaction.err,
        blockTime: slotTransaction.blockTime,
        statusClass,
        statusText,
        signatureInfo: slotTransaction,
      });
    }
  }

  return transactionRows;
}
