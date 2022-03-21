import { ReactNode, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Location } from "history";
import {
  BlockResponse,
  ConfirmedTransactionMeta,
  TransactionSignature,
  PublicKey,
} from "@solana/web3.js";
import { ErrorCard } from "components/common/ErrorCard";
import { Signature } from "components/common/Signature";
import { Address } from "components/common/Address";
import { useQuery } from "utils/url";
import { useCluster } from "providers/cluster";
import { displayAddress } from "utils/tx";

const PAGE_SIZE = 25;

const useQueryFilter = (): string => {
  const query = useQuery();
  const filter = query.get("filter");
  return filter || "";
};

type TransactionWithInvocations = {
  index: number;
  signature?: TransactionSignature;
  meta: ConfirmedTransactionMeta | null;
  invocations: Map<string, number>;
};

export function BlockHistoryCard({ block }: { block: BlockResponse }) {
  const [numDisplayed, setNumDisplayed] = useState(PAGE_SIZE);
  const [showDropdown, setDropdown] = useState(false);
  const filter = useQueryFilter();

  const { transactions, invokedPrograms } = useMemo(() => {
    const invokedPrograms = new Map<string, number>();

    const transactions: TransactionWithInvocations[] = block.transactions.map(
      (tx, index) => {
        let signature: TransactionSignature | undefined;
        if (tx.transaction.signatures.length > 0) {
          signature = tx.transaction.signatures[0];
        }

        let programIndexes = tx.transaction.message.instructions.map(
          (ix) => ix.programIdIndex
        );
        programIndexes.concat(
          tx.meta?.innerInstructions?.flatMap((ix) => {
            return ix.instructions.map((ix) => ix.programIdIndex);
          }) || []
        );

        const indexMap = new Map<number, number>();
        programIndexes.forEach((programIndex) => {
          const count = indexMap.get(programIndex) || 0;
          indexMap.set(programIndex, count + 1);
        });

        const invocations = new Map<string, number>();
        for (const [i, count] of indexMap.entries()) {
          const programId = tx.transaction.message.accountKeys[i].toBase58();
          invocations.set(programId, count);
          const programTransactionCount = invokedPrograms.get(programId) || 0;
          invokedPrograms.set(programId, programTransactionCount + 1);
        }

        return {
          index,
          signature,
          meta: tx.meta,
          invocations,
        };
      }
    );
    return { transactions, invokedPrograms };
  }, [block]);

  const filteredTransactions = useMemo(() => {
    // console.log("Filter: ", filter);
    // console.log("invocations", transactions);
    return transactions.filter(({ invocations }) => {
      if (filter === ALL_TRANSACTIONS) {
        return true;
      }
      return invocations.has(filter);
    });
  }, [transactions, filter]);

  if (filteredTransactions.length === 0) {
    const errorMessage =
      filter === ALL_TRANSACTIONS
        ? "This block has no transactions"
        : "No transactions found with this filter";
    return <ErrorCard text={errorMessage} />;
  }

  let title: string;
  if (filteredTransactions.length === transactions.length) {
    title = `Block Transactions (${filteredTransactions.length})`;
  } else {
    title = `Block Transactions`;
  }

  return (
    <>
      <div className="row">
        <div className="col-lg-12">
          <div className="card-header align-items-center">
            <caption>{title}</caption>
            <FilterDropdown
              filter={filter}
              toggle={() => setDropdown((show) => !show)}
              show={showDropdown}
              invokedPrograms={invokedPrograms}
              totalTransactionCount={transactions.length}
            />
          </div>
          <div className="table-responsive">
            <table className="table table-striped table-latests">
              <thead>
                <tr>
                  <th className="text-muted">#</th>
                  <th className="text-muted">Result</th>
                  <th className="text-muted">Transaction Signature</th>
                  <th className="text-muted">Invoked Programs</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.slice(0, numDisplayed).map((tx, i) => {
                  let statusText;
                  let statusClass;
                  let signature: ReactNode;
                  if (tx.meta?.err || !tx.signature) {
                    statusClass = "warning";
                    statusText = "Failed";
                  } else {
                    statusClass = "success";
                    statusText = "Success";
                  }

                  if (tx.signature) {
                    signature = (
                      <Signature
                        signature={tx.signature}
                        link
                        truncateChars={48}
                      />
                    );
                  }

                  const entries = [...tx.invocations.entries()];
                  entries.sort();

                  return (
                    <tr key={i}>
                      <td>{tx.index + 1}</td>
                      <td>
                        <span className={`badge bg-${statusClass}`}>
                          {statusText}
                        </span>
                      </td>

                      <td>{signature}</td>
                      <td>
                        {tx.invocations.size === 0
                          ? "NA"
                          : entries.map(([programId, count], i) => {
                              return (
                                <div
                                  key={i}
                                  className="d-flex align-items-center"
                                >
                                  <Address
                                    pubkey={new PublicKey(programId)}
                                    link
                                  />
                                  <span className="ml-2 text-muted">{`(${count})`}</span>
                                </div>
                              );
                            })}
                      </td>
                    </tr>
                  );
                })}

                {block.transactions.length > numDisplayed && (
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

type FilterProps = {
  filter: string;
  toggle: () => void;
  show: boolean;
  invokedPrograms: Map<string, number>;
  totalTransactionCount: number;
};

const ALL_TRANSACTIONS = "";

type FilterOption = {
  name: string;
  programId: string;
  transactionCount: number;
};

const FilterDropdown = ({
  filter,
  toggle,
  show,
  invokedPrograms,
  totalTransactionCount,
}: FilterProps) => {
  const { cluster } = useCluster();
  const buildLocation = (location: Location, filter: string) => {
    const params = new URLSearchParams(location.search);
    if (filter === ALL_TRANSACTIONS) {
      params.delete("filter");
    } else {
      params.set("filter", filter);
    }
    return {
      ...location,
      search: params.toString(),
    };
  };

  let currentFilterOption = {
    name: "All Transactions",
    programId: ALL_TRANSACTIONS,
    transactionCount: totalTransactionCount,
  };
  const filterOptions: FilterOption[] = [currentFilterOption];
  const placeholderRegistry = new Map();

  [...invokedPrograms.entries()].forEach(([programId, transactionCount]) => {
    const name = displayAddress(programId, cluster, placeholderRegistry);
    if (filter === programId) {
      currentFilterOption = {
        programId,
        name: `${name} Transactions (${transactionCount})`,
        transactionCount,
      };
    }
    filterOptions.push({ name, programId, transactionCount });
  });

  filterOptions.sort();

  return (
    <div className="dropdown mr-2">
      <button
        className="btn btn-white btn-sm dropdown-toggle"
        type="button"
        onClick={toggle}
      >
        {currentFilterOption.name}
      </button>
      <div
        className={`token-filter dropdown-menu-right dropdown-menu${
          show ? " show" : ""
        }`}
      >
        {filterOptions.map(({ name, programId, transactionCount }) => {
          return (
            <Link
              key={programId}
              to={(location: Location) => buildLocation(location, programId)}
              className={`dropdown-item${
                programId === filter ? " active" : ""
              }`}
              onClick={toggle}
            >
              {`${name} (${transactionCount})`}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
