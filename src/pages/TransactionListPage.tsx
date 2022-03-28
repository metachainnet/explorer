import { PublicKey, TransactionSignature } from "@solana/web3.js";
import { TransactionWithInvocations } from "components/block/BlockHistoryCard";
import { Address } from "components/common/Address";
import { Signature } from "components/common/Signature";
import StyledTable from "components/StyledTable";
import { useBlocks, useFetchBlock } from "providers/block";
import { useCluster } from "providers/cluster";
import {
  ClusterStatsStatus,
  useDashboardInfo,
  useStatsProvider,
} from "providers/stats/solanaClusterStats";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { StatsNotReady } from "./ClusterStatsPage";

export function TransactionListPage() {
  const dashboardInfo = useDashboardInfo();
  const { setActive } = useStatsProvider();
  const { cluster } = useCluster();

  const {
    epochInfo: { absoluteSlot },
  } = dashboardInfo;
  const [blockList, setBlockList] = useState<number[]>([]);
  const cacheBlocks = useBlocks(blockList);
  const fetchBlock = useFetchBlock();

  useEffect(() => {
    setActive(true);
    return () => setActive(false);
  }, [setActive, cluster]);

  useEffect(() => {
    if (absoluteSlot !== 0) {
      setActive(false);
    }
    const blocks = Array(10)
      .fill(absoluteSlot)
      .map((num, idx) => num - idx);

    blocks.forEach((slot) => fetchBlock(slot));
    setBlockList(blocks);
  }, [absoluteSlot, fetchBlock, setActive]);

  const loadMore = () => {
    const [lastIdx] = blockList.slice(-1);
    const blocks = Array(10)
      .fill(lastIdx - 1)
      .map((num, idx) => num - idx);
    blocks.forEach((slot) => fetchBlock(slot));
    setBlockList([...blockList, ...blocks]);
  };

  const refresh = () => setActive(true);

  const { transactions, invokedPrograms } = useMemo(() => {
    if (!cacheBlocks) {
      return { transactions: null, invokedPrograms: null };
    }

    const invokedPrograms = new Map<string, number>();

    const transactions: TransactionWithInvocations[] = cacheBlocks
      .filter((block) => block)
      .filter((block) => block.data?.block?.transactions.length)
      .flatMap((block) => block?.data?.block?.transactions)
      .map((tx, index) => {
        const assertTx = tx!;
        let signature: TransactionSignature | undefined;

        if (assertTx.transaction.signatures.length > 0) {
          signature = assertTx.transaction.signatures[0];
        }

        let programIndexes = assertTx.transaction.message.instructions.map(
          (ix) => ix.programIdIndex
        );
        programIndexes.concat(
          assertTx.meta?.innerInstructions?.flatMap((ix) => {
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
          const programId =
            assertTx.transaction.message.accountKeys[i].toBase58();
          invocations.set(programId, count);
          const programTransactionCount = invokedPrograms.get(programId) || 0;
          invokedPrograms.set(programId, programTransactionCount + 1);
        }

        return {
          index,
          signature,
          meta: assertTx.meta,
          invocations,
        };
      });
    return { transactions, invokedPrograms };
  }, [cacheBlocks]);

  if (dashboardInfo.status !== ClusterStatsStatus.Ready) {
    const error = dashboardInfo.status === ClusterStatsStatus.Error;
    return <StatsNotReady error={error} />;
  }

  return (
    <section className="block-explorer-features section bg-bottom">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="center-heading">
              <h2 className="section-title">Transactions</h2>
            </div>
          </div>
          <div className="offset-lg-3 col-lg-6">
            <div className="center-text">
              <p></p>
            </div>
          </div>
        </div>

        <StyledTable
          cardHeader={
            <>
              <div>Recent Transactions</div>
              <button
                className="btn btn-white btn-sm btn-outline-dark"
                onClick={() => refresh()}
              >
                <span className="fe fe-refresh-cw"></span>
                Refresh
              </button>
            </>
          }
          tableHead={[
            "#",
            "Result",
            "Transaction Signature",
            "Invoked Programs",
          ]}
          tableBody={
            <>
              {transactions
                ? transactions.map((tx, i) => {
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
                  })
                : null}
            </>
          }
        />
        <button
          className="btn btn-primary w-100"
          onClick={() => loadMore()}
          disabled={absoluteSlot === 0}
        >
          Load More
        </button>
      </div>
    </section>
  );
}
