import { Slot } from "components/common/Slot";
import StyledTable from "components/StyledTable";
import { useBlocks, useFetchBlock } from "providers/block";
import { useCluster } from "providers/cluster";
import {
  ClusterStatsStatus,
  useDashboardInfo,
  useStatsProvider,
} from "providers/stats/solanaClusterStats";
import { useEffect, useState } from "react";
import { displayTimestampUtc } from "utils/date";
import { StatsNotReady } from "./ClusterStatsPage";

export function BlockListPage() {
  const dashboardInfo = useDashboardInfo();
  const { setActive } = useStatsProvider();
  const { cluster } = useCluster();

  useEffect(() => {
    setActive(true);
    return () => setActive(false);
  }, [setActive, cluster]);

  const fetchBlock = useFetchBlock();

  const [blockList, setBlockList] = useState<number[]>([]);
  const { absoluteSlot } = dashboardInfo.epochInfo;

  useEffect(() => {
    if (absoluteSlot !== 0) {
      setActive(false);
    }
    const blocks = Array(10)
      .fill(absoluteSlot)
      .map((num, idx) => num - idx);
    blocks.map((slot) => fetchBlock(slot));
    setBlockList(blocks);
  }, [absoluteSlot, fetchBlock, setActive]);

  const cacheBlocks = useBlocks(blockList);

  if (dashboardInfo.status !== ClusterStatsStatus.Ready) {
    const error = dashboardInfo.status === ClusterStatsStatus.Error;
    return <StatsNotReady error={error} />;
  }

  const loadMore = () => {
    const [lastIdx] = blockList.slice(-1);
    const blocks = Array(10)
      .fill(lastIdx - 1)
      .map((num, idx) => num - idx);
    blocks.forEach((slot) => fetchBlock(slot));
    setBlockList([...blockList, ...blocks]);
  };

  const refresh = () => setActive(true);

  return (
    <section className="block-explorer-features section bg-bottom">
      <div className="container">
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            className="btn btn-white btn-sm btn-outline-dark"
            onClick={() => refresh()}
          >
            <span className="fe fe-refresh-cw"></span>
            Refresh
          </button>
        </div>
        <StyledTable
          tableHead={["Block #", "Block hash", "Transactions", "Age"]}
          tableBody={
            <>
              {cacheBlocks?.map((block, idx) => (
                <tr key={idx}>
                  <td>
                    <Slot slot={blockList[idx]} />
                  </td>
                  <td>{block.data?.block?.blockhash || "Loading..."}</td>
                  <td>
                    {block.data?.block?.transactions.length || "Loading..."}
                  </td>
                  <td>
                    {block.data?.block?.blockTime
                      ? displayTimestampUtc(block.data?.block?.blockTime * 1000)
                      : "Loading..."}
                  </td>
                </tr>
              ))}
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
