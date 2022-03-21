import { BlockResponse } from "@solana/web3.js";
import { ErrorCard } from "components/common/ErrorCard";
import { LoadingCard } from "components/common/LoadingCard";
import { Slot } from "components/common/Slot";
import { FetchStatus, useBlock, useFetchBlock } from "providers/block";
import { ClusterStatus, useCluster } from "providers/cluster";
import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { clusterPath } from "utils/url";
import { BlockAccountsCard } from "./BlockAccountsCard";
import { BlockHistoryCard } from "./BlockHistoryCard";
import { BlockProgramsCard } from "./BlockProgramsCard";
import { BlockRewardsCard } from "./BlockRewardsCard";

export function BlockOverviewCard({
  slot,
  tab,
}: {
  slot: number;
  tab?: string;
}) {
  const confirmedBlock = useBlock(slot);
  const fetchBlock = useFetchBlock();
  const { status } = useCluster();
  const refresh = () => fetchBlock(slot);

  // Fetch block on load
  useEffect(() => {
    if (!confirmedBlock && status === ClusterStatus.Connected) refresh();
  }, [slot, status]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!confirmedBlock || confirmedBlock.status === FetchStatus.Fetching) {
    return <LoadingCard message="Loading block" />;
  } else if (
    confirmedBlock.data === undefined ||
    confirmedBlock.status === FetchStatus.FetchFailed
  ) {
    return <ErrorCard retry={refresh} text="Failed to fetch block" />;
  } else if (confirmedBlock.data.block === undefined) {
    return <ErrorCard retry={refresh} text={`Block ${slot} was not found`} />;
  }

  const block = confirmedBlock.data.block;
  const committedTxs = block.transactions.filter((tx) => tx.meta?.err === null);

  return (
    <>
      <div className="row m-bottom-70">
        <div className="col-lg-12 col-md-12 col-sm-12">
          <div className="table-responsive">
            <table className="table table-striped table-latests table-detail">
              <tbody>
                <tr>
                  <td>
                    <strong>Slot</strong>
                  </td>
                  <td>
                    <Slot slot={slot} link />
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Blockhash</strong>
                  </td>
                  <td>{block.blockhash}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Parent Slot</strong>
                  </td>
                  <td>
                    <Slot slot={block.parentSlot} link />
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Parent Blockhash</strong>
                  </td>
                  <td>{block.previousBlockhash}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Processed Transactions</strong>
                  </td>
                  <td>{block.transactions.length}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Successful Transactions</strong>
                  </td>
                  <td>{committedTxs.length}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <MoreSection block={block} slot={slot} tab={tab} />
    </>
  );
}

const TABS: Tab[] = [
  {
    slug: "history",
    title: "Transactions",
    path: "",
  },
  {
    slug: "rewards",
    title: "Rewards",
    path: "/rewards",
  },
  {
    slug: "programs",
    title: "Programs",
    path: "/programs",
  },
  {
    slug: "accounts",
    title: "Accounts",
    path: "/accounts",
  },
];

type MoreTabs = "history" | "rewards" | "programs" | "accounts";

type Tab = {
  slug: MoreTabs;
  title: string;
  path: string;
};

function MoreSection({
  slot,
  block,
  tab,
}: {
  slot: number;
  block: BlockResponse;
  tab?: string;
}) {
  return (
    <>
      <div className="row">
        <div className="col-lg-12">
          <div className="center-heading">
            <h2 className="section-title">
              {(tab ?? "Transactions").substring(0, 1).toUpperCase() +
                (tab ?? "Transactions").substring(1).toLowerCase()}
            </h2>
          </div>
        </div>
        <div className="offset-lg-3 col-lg-6">
          <div className="center-text">
            <p></p>
            <ul className="nav nav-tabs nav-overflow header-tabs">
              {TABS.map(({ title, slug, path }) => (
                <li key={slug} className="nav-item">
                  <NavLink
                    className="nav-link"
                    to={clusterPath(`/block/${slot}${path}`)}
                    exact
                  >
                    {title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      {tab === undefined && <BlockHistoryCard block={block} />}
      {tab === "rewards" && <BlockRewardsCard block={block} />}
      {tab === "accounts" && <BlockAccountsCard block={block} />}
      {tab === "programs" && <BlockProgramsCard block={block} />}
    </>
  );
}
