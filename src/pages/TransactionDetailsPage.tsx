import {
  SystemInstruction,
  SystemProgram,
  TransactionSignature,
} from "@solana/web3.js";
import { BigNumber } from "bignumber.js";
import bs58 from "bs58";
import { Address } from "components/common/Address";
import { BalanceDelta } from "components/common/BalanceDelta";
import { ErrorCard } from "components/common/ErrorCard";
import { InfoTooltip } from "components/common/InfoTooltip";
import { LoadingCard } from "components/common/LoadingCard";
import { Signature } from "components/common/Signature";
import { Slot } from "components/common/Slot";
import StyledTable from "components/StyledTable";
import { InstructionsSection } from "components/transaction/InstructionsSection";
import { ProgramLogSection } from "components/transaction/ProgramLogSection";
import { TokenBalancesCard } from "components/transaction/TokenBalancesCard";
import { FetchStatus } from "providers/cache";
import { ClusterStatus, useCluster } from "providers/cluster";
import {
  useFetchTransactionStatus,
  useTransactionDetails,
  useTransactionStatus,
} from "providers/transactions";
import { useFetchTransactionDetails } from "providers/transactions/parsed";
import { createContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SolBalance } from "utils";
import { displayTimestamp } from "utils/date";
import { intoTransactionInstruction } from "utils/tx";
import { clusterPath } from "utils/url";

const AUTO_REFRESH_INTERVAL = 2000;
const ZERO_CONFIRMATION_BAILOUT = 5;
export const INNER_INSTRUCTIONS_START_SLOT = 46915769;

export type SignatureProps = {
  signature: TransactionSignature;
};

export const SignatureContext = createContext("");

enum AutoRefresh {
  Active,
  Inactive,
  BailedOut,
}

type AutoRefreshProps = {
  autoRefresh: AutoRefresh;
};

export function TransactionDetailsPage({ signature: raw }: SignatureProps) {
  let signature: TransactionSignature | undefined;

  try {
    const decoded = bs58.decode(raw);
    if (decoded.length === 64) {
      signature = raw;
    }
  } catch (err) {}

  const status = useTransactionStatus(signature);
  const [zeroConfirmationRetries, setZeroConfirmationRetries] = useState(0);

  let autoRefresh = AutoRefresh.Inactive;

  if (zeroConfirmationRetries >= ZERO_CONFIRMATION_BAILOUT) {
    autoRefresh = AutoRefresh.BailedOut;
  } else if (status?.data?.info && status.data.info.confirmations !== "max") {
    autoRefresh = AutoRefresh.Active;
  }

  useEffect(() => {
    if (
      status?.status === FetchStatus.Fetched &&
      status.data?.info &&
      status.data.info.confirmations === 0
    ) {
      setZeroConfirmationRetries((retries) => retries + 1);
    }
  }, [status]);

  useEffect(() => {
    if (
      status?.status === FetchStatus.Fetching &&
      autoRefresh === AutoRefresh.BailedOut
    ) {
      setZeroConfirmationRetries(0);
    }
  }, [status, autoRefresh, setZeroConfirmationRetries]);

  if (signature === undefined) {
    return <ErrorCard text={`Signature "${raw}" is not valid`} />;
  }

  return (
    <section className="block-explorer-section section bg-bottom">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="center-heading">
              <h2 className="section-title">Details for Transaction</h2>
            </div>
          </div>
          <div className="offset-lg-3 col-lg-6">
            <div className="center-text">
              <p></p>
            </div>
          </div>
        </div>
        <SignatureContext.Provider value={signature}>
          <StatusCard signature={signature} autoRefresh={autoRefresh} />
          <AccountsCard signature={signature} autoRefresh={autoRefresh} />
          <TokenBalancesCard signature={signature} />
          <InstructionsSection signature={signature} />
          <ProgramLogSection signature={signature} />
        </SignatureContext.Provider>
      </div>
    </section>
  );
}

function StatusCard({
  signature,
  autoRefresh,
}: SignatureProps & AutoRefreshProps) {
  const fetchStatus = useFetchTransactionStatus();
  const status = useTransactionStatus(signature);
  const details = useTransactionDetails(signature);
  const { firstAvailableBlock, status: clusterStatus } = useCluster();

  // Fetch transaction on load
  useEffect(() => {
    if (!status && clusterStatus === ClusterStatus.Connected) {
      fetchStatus(signature);
    }
  }, [signature, clusterStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  // Effect to set and clear interval for auto-refresh
  useEffect(() => {
    if (autoRefresh === AutoRefresh.Active) {
      let intervalHandle: NodeJS.Timeout = setInterval(
        () => fetchStatus(signature),
        AUTO_REFRESH_INTERVAL
      );

      return () => {
        clearInterval(intervalHandle);
      };
    }
  }, [autoRefresh, fetchStatus, signature]);

  if (
    !status ||
    (status.status === FetchStatus.Fetching &&
      autoRefresh === AutoRefresh.Inactive)
  ) {
    return <LoadingCard />;
  } else if (status.status === FetchStatus.FetchFailed) {
    return (
      <ErrorCard retry={() => fetchStatus(signature)} text="Fetch Failed" />
    );
  } else if (!status.data?.info) {
    if (firstAvailableBlock !== undefined && firstAvailableBlock > 1) {
      return (
        <ErrorCard
          retry={() => fetchStatus(signature)}
          text="Not Found"
          subtext={`Note: Transactions processed before block ${firstAvailableBlock} are not available at this time`}
        />
      );
    }
    return <ErrorCard retry={() => fetchStatus(signature)} text="Not Found" />;
  }

  const { info } = status.data;

  const renderResult = () => {
    let statusClass = "success";
    let statusText = "Success";
    if (info.result.err) {
      statusClass = "warning";
      statusText = "Error";
    }

    return (
      <h3 className="mb-0">
        <span className={`badge bg-${statusClass}`}>{statusText}</span>
      </h3>
    );
  };

  const fee = details?.data?.transaction?.meta?.fee;
  const transaction = details?.data?.transaction?.transaction;
  const blockhash = transaction?.message.recentBlockhash;
  const isNonce = (() => {
    if (!transaction || transaction.message.instructions.length < 1) {
      return false;
    }

    const ix = intoTransactionInstruction(
      transaction,
      transaction.message.instructions[0]
    );
    return (
      ix &&
      SystemProgram.programId.equals(ix.programId) &&
      SystemInstruction.decodeInstructionType(ix) === "AdvanceNonceAccount"
    );
  })();

  const cardHeader = (
    <>
      <h3 className="card-header-title">Overview</h3>
      <Link
        to={clusterPath(`/tx/${signature}/inspect`)}
        className="btn btn-white btn-sm btn-outline-dark"
      >
        <span className="fe fe-settings"></span>
        Inspect
      </Link>
      {autoRefresh === AutoRefresh.Active ? (
        <span className="spinner-grow spinner-grow-sm"></span>
      ) : (
        <button
          className="btn btn-white btn-sm btn-outline-dark"
          onClick={() => fetchStatus(signature)}
        >
          <span className="fe fe-refresh-cw"></span>
          Refresh
        </button>
      )}
    </>
  );

  const tableBody = (
    <>
      <tr>
        <td>Signature</td>
        <td className="text-end">
          <Signature signature={signature} alignRight />
        </td>
      </tr>

      <tr>
        <td>Result</td>
        <td className="text-end">{renderResult()}</td>
      </tr>

      <tr>
        <td>Timestamp</td>
        <td className="text-end">
          {info.timestamp !== "unavailable" ? (
            <span className="text-monospace">
              {displayTimestamp(info.timestamp * 1000)}
            </span>
          ) : (
            <InfoTooltip
              bottom
              right
              text="Timestamps are only available for confirmed blocks"
            >
              Unavailable
            </InfoTooltip>
          )}
        </td>
      </tr>

      <tr>
        <td>Confirmation Status</td>
        <td className="text-end text-uppercase">
          {info.confirmationStatus || "Unknown"}
        </td>
      </tr>

      <tr>
        <td>Confirmations</td>
        <td className="text-end text-uppercase">{info.confirmations}</td>
      </tr>

      <tr>
        <td>Block</td>
        <td className="text-end">
          <Slot slot={info.slot} link />
        </td>
      </tr>

      {blockhash && (
        <tr>
          <td>
            {isNonce ? (
              "Nonce"
            ) : (
              <InfoTooltip text="Transactions use a previously confirmed blockhash as a nonce to prevent double spends">
                Recent Blockhash
              </InfoTooltip>
            )}
          </td>
          <td className="text-end">{blockhash}</td>
        </tr>
      )}

      {fee && (
        <tr>
          <td>Fee (SOL)</td>
          <td className="text-end">
            <SolBalance lamports={fee} />
          </td>
        </tr>
      )}
    </>
  );

  return <StyledTable cardHeader={cardHeader} tableBody={tableBody} />;
}

function AccountsCard({
  signature,
  autoRefresh,
}: SignatureProps & AutoRefreshProps) {
  const details = useTransactionDetails(signature);
  const fetchDetails = useFetchTransactionDetails();
  const fetchStatus = useFetchTransactionStatus();
  const refreshDetails = () => fetchDetails(signature);
  const refreshStatus = () => fetchStatus(signature);
  const transaction = details?.data?.transaction?.transaction;
  const message = transaction?.message;
  const status = useTransactionStatus(signature);

  // Fetch details on load
  useEffect(() => {
    if (status?.data?.info?.confirmations === "max" && !details) {
      fetchDetails(signature);
    }
  }, [signature, details, status, fetchDetails]);

  if (!status?.data?.info) {
    return null;
  } else if (autoRefresh === AutoRefresh.BailedOut) {
    return (
      <ErrorCard
        text="Details are not available until the transaction reaches MAX confirmations"
        retry={refreshStatus}
      />
    );
  } else if (autoRefresh === AutoRefresh.Active) {
    return (
      <ErrorCard text="Details are not available until the transaction reaches MAX confirmations" />
    );
  } else if (!details || details.status === FetchStatus.Fetching) {
    return <LoadingCard />;
  } else if (details.status === FetchStatus.FetchFailed) {
    return <ErrorCard retry={refreshDetails} text="Failed to fetch details" />;
  } else if (!details.data?.transaction || !message) {
    return <ErrorCard text="Details are not available" />;
  }

  const { meta } = details.data.transaction;
  if (!meta) {
    return <ErrorCard text="Transaction metadata is missing" />;
  }

  const accountRows = message.accountKeys.map((account, index) => {
    const pre = meta.preBalances[index];
    const post = meta.postBalances[index];
    const pubkey = account.pubkey;
    const key = account.pubkey.toBase58();
    const delta = new BigNumber(post).minus(new BigNumber(pre));

    return (
      <tr key={key}>
        <td>{index + 1}</td>
        <td>
          <Address pubkey={pubkey} link />
        </td>
        <td>
          <BalanceDelta delta={delta} isSol />
        </td>
        <td>
          <SolBalance lamports={post} />
        </td>
        <td>
          {index === 0 && <span className="badge bg-info">Fee Payer</span>}
          {account.writable && <span className="badge bg-info">Writable</span>}
          {account.signer && <span className="badge bg-info">Signer</span>}
          {message.instructions.find((ix) => ix.programId.equals(pubkey)) && (
            <span className="badge bg-info">Program</span>
          )}
        </td>
      </tr>
    );
  });

  return (
    <StyledTable
      tableCaption="Accont Input(s)"
      tableHead={[
        "#",
        "Address",
        "Change (SOL)",
        "Post Balance (SOL)",
        "Details",
      ]}
      tableBody={accountRows}
    />
  );
}
