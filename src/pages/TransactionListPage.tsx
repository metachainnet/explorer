import { BlockHistoryCard } from "components/block/BlockHistoryCard";
import { ErrorCard } from "components/common/ErrorCard";
import { LoadingCard } from "components/common/LoadingCard";
import { FetchStatus, useBlock, useFetchBlock } from "providers/block";
import { ClusterStatus, useCluster } from "providers/cluster";
import {
  useDashboardInfo,
  useStatsProvider,
} from "providers/stats/solanaClusterStats";
import { useEffect } from "react";

export function TransactionListPage() {
  const { status } = useCluster();
  const {
    epochInfo: { absoluteSlot },
  } = useDashboardInfo();
  const { setActive } = useStatsProvider();
  const confirmedBlock = useBlock(absoluteSlot);
  const fetchBlock = useFetchBlock();
  const refresh = () => fetchBlock(absoluteSlot);

  // 일단 한 번만 로딩하기
  useEffect(() => {
    setActive(true);

    if (absoluteSlot !== 0) {
      setActive(false);
    }
  }, [setActive, absoluteSlot]);

  // Fetch block on load
  useEffect(() => {
    if (!confirmedBlock && status === ClusterStatus.Connected) refresh();
  }, [absoluteSlot, status]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!confirmedBlock || confirmedBlock.status === FetchStatus.Fetching) {
    return <LoadingCard message="Loading block" />;
  } else if (
    confirmedBlock.data === undefined ||
    confirmedBlock.status === FetchStatus.FetchFailed
  ) {
    return <ErrorCard retry={refresh} text="Failed to fetch block" />;
  } else if (confirmedBlock.data.block === undefined) {
    return (
      <ErrorCard retry={refresh} text={`Block ${absoluteSlot} was not found`} />
    );
  }

  const block = confirmedBlock.data.block;

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

        <BlockHistoryCard block={block} customTitle={"Transactions"} />
      </div>
    </section>
  );
}
