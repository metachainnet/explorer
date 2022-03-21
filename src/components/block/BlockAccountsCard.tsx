import { useMemo, useState } from "react";
import { BlockResponse, PublicKey } from "@solana/web3.js";
import { Address } from "components/common/Address";

type AccountStats = {
  reads: number;
  writes: number;
};

const PAGE_SIZE = 25;

export function BlockAccountsCard({ block }: { block: BlockResponse }) {
  const [numDisplayed, setNumDisplayed] = useState(10);
  const totalTransactions = block.transactions.length;

  const accountStats = useMemo(() => {
    const statsMap = new Map<string, AccountStats>();
    block.transactions.forEach((tx) => {
      const message = tx.transaction.message;
      const txSet = new Map<string, boolean>();
      message.instructions.forEach((ix) => {
        ix.accounts.forEach((index) => {
          const address = message.accountKeys[index].toBase58();
          txSet.set(address, message.isAccountWritable(index));
        });
      });

      txSet.forEach((isWritable, address) => {
        const stats = statsMap.get(address) || { reads: 0, writes: 0 };
        if (isWritable) {
          stats.writes++;
        } else {
          stats.reads++;
        }
        statsMap.set(address, stats);
      });
    });

    const accountEntries = [];
    for (let entry of statsMap) {
      accountEntries.push(entry);
    }

    accountEntries.sort((a, b) => {
      const aCount = a[1].reads + a[1].writes;
      const bCount = b[1].reads + b[1].writes;
      if (aCount < bCount) return 1;
      if (aCount > bCount) return -1;
      return 0;
    });

    return accountEntries;
  }, [block]);

  return (
    <>
      <div className="row">
        <div className="col-lg-12">
          <div className="table-responsive">
            <table className="table table-striped table-latests caption-top">
              <caption>Block Account Usage</caption>
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>New Balance</th>
                  <th>Percent Change</th>
                </tr>
              </thead>
              <tbody>
                {accountStats
                  .slice(0, numDisplayed)
                  .map(([address, { writes, reads }]) => {
                    return (
                      <tr key={address}>
                        <td>
                          <Address pubkey={new PublicKey(address)} link />
                        </td>
                        <td>{writes}</td>
                        <td>{reads}</td>
                        <td>{writes + reads}</td>
                        <td>
                          {(
                            (100 * (writes + reads)) /
                            totalTransactions
                          ).toFixed(2)}
                          %
                        </td>
                      </tr>
                    );
                  })}

                {accountStats.length > numDisplayed && (
                  <tr>
                    <td colSpan={5}>
                      <button
                        className="btn btn-primary w-100"
                        onClick={() =>
                          setNumDisplayed((displayed) => displayed + PAGE_SIZE)
                        }
                      >
                        Load More
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
