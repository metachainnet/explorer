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
  const { blockHeight, absoluteSlot } = dashboardInfo.epochInfo;

  if (absoluteSlot !== 0) {
    setActive(false);
  }

  useEffect(() => {
    const blocks = Array(10)
      .fill(absoluteSlot)
      .map((num, idx) => num - idx);
    blocks.map((slot) => fetchBlock(slot));
    setBlockList(blocks);
  }, [absoluteSlot, fetchBlock]);

  const cacheBlocks = useBlocks(blockList);

  if (dashboardInfo.status !== ClusterStatsStatus.Ready) {
    const error = dashboardInfo.status === ClusterStatsStatus.Error;
    return <StatsNotReady error={error} />;
  }
  return (
    <section className="block-explorer-features section bg-bottom">
      <div className="container">
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
      </div>
    </section>
  );
}
