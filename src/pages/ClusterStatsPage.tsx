import { Slot } from "components/common/Slot";
import LiveClusterStatItem from "components/LiveClusterStatItem";
import { TpsCard } from "components/TpsCard";
import { useCluster } from "providers/cluster";
import {
  ClusterStatsStatus,
  useDashboardInfo,
  usePerformanceInfo,
  useStatsProvider,
} from "providers/stats/solanaClusterStats";
import { useEffect } from "react";
import { slotsToHumanString } from "utils";
import { displayTimestampUtc } from "utils/date";

const CLUSTER_STATS_TIMEOUT = 5000;

export function ClusterStatsPage() {
  return (
    <section className="block-explorer-features section bg-bottom">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="center-heading">
              <h2 className="section-title">Live Cluster Stats</h2>
            </div>
          </div>
          <div className="offset-lg-3 col-lg-6">
            <div className="center-text">
              <p>Metachain Explorer</p>
            </div>
          </div>
        </div>
        <StatsCardBody />
        <TpsCard />
      </div>
    </section>
  );
}

function StatsCardBody() {
  const dashboardInfo = useDashboardInfo();
  const performanceInfo = usePerformanceInfo();
  const { setActive } = useStatsProvider();
  const { cluster } = useCluster();

  useEffect(() => {
    setActive(true);
    return () => setActive(false);
  }, [setActive, cluster]);

  if (
    performanceInfo.status !== ClusterStatsStatus.Ready ||
    dashboardInfo.status !== ClusterStatsStatus.Ready
  ) {
    const error =
      performanceInfo.status === ClusterStatsStatus.Error ||
      dashboardInfo.status === ClusterStatsStatus.Error;
    return <StatsNotReady error={error} />;
  }

  const { avgSlotTime_1h, avgSlotTime_1min, epochInfo, blockTime } =
    dashboardInfo;
  const hourlySlotTime = Math.round(1000 * avgSlotTime_1h);
  const averageSlotTime = Math.round(1000 * avgSlotTime_1min);
  const { slotIndex, slotsInEpoch } = epochInfo;
  const currentEpoch = epochInfo.epoch.toString();
  const epochProgress = ((100 * slotIndex) / slotsInEpoch).toFixed(1) + "%";
  const epochTimeRemaining = slotsToHumanString(
    slotsInEpoch - slotIndex,
    hourlySlotTime
  );
  const { blockHeight, absoluteSlot } = epochInfo;

  return (
    <>
      <div className="row">
        <LiveClusterStatItem title={"Slot"}>
          <Slot slot={absoluteSlot} link />
        </LiveClusterStatItem>
        {blockHeight !== undefined && (
          <LiveClusterStatItem title={"Block height"}>
            <Slot slot={blockHeight} />
          </LiveClusterStatItem>
        )}
        {blockTime && (
          <LiveClusterStatItem title={"Cluster time"}>
            {displayTimestampUtc(blockTime)}
          </LiveClusterStatItem>
        )}
        <LiveClusterStatItem title={"Slot time (1min average)"}>
          {averageSlotTime}ms
        </LiveClusterStatItem>
      </div>

      <div className="row">
        <LiveClusterStatItem title={"Slot time (1hr average)"}>
          {hourlySlotTime}ms
        </LiveClusterStatItem>

        <LiveClusterStatItem title={"Epoch"}>
          {currentEpoch}
        </LiveClusterStatItem>

        <LiveClusterStatItem title={"Epoch progress"}>
          {epochProgress}
        </LiveClusterStatItem>

        <LiveClusterStatItem title={"Epoch time remaining (approx.)"}>
          ~{epochTimeRemaining}ms
        </LiveClusterStatItem>
      </div>
    </>
  );
}

export function StatsNotReady({ error }: { error: boolean }) {
  const { setTimedOut, retry, active } = useStatsProvider();
  const { cluster } = useCluster();

  useEffect(() => {
    let timedOut = 0;
    if (!error) {
      timedOut = setTimeout(setTimedOut, CLUSTER_STATS_TIMEOUT);
    }
    return () => {
      if (timedOut) {
        clearTimeout(timedOut);
      }
    };
  }, [setTimedOut, cluster, error]);

  if (error || !active) {
    return (
      <div className="card-body text-center">
        There was a problem loading cluster stats.{" "}
        <button
          className="btn btn-white btn-sm"
          onClick={() => {
            retry();
          }}
        >
          <span className="fe fe-refresh-cw mr-2"></span>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="card-body text-center">
      <span className="spinner-grow spinner-grow-sm mr-2"></span>
      Loading
    </div>
  );
}
