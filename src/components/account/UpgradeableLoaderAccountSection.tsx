import { UnknownAccountCard } from "components/account/UnknownAccountCard";
import { Address } from "components/common/Address";
import { ErrorCard } from "components/common/ErrorCard";
import { Slot } from "components/common/Slot";
import StyledTable from "components/StyledTable";
import { Account, useFetchAccountInfo } from "providers/accounts";
import { useCluster } from "providers/cluster";
import { SolBalance } from "utils";
import { addressLabel } from "utils/tx";
import {
  ProgramAccountInfo,
  ProgramBufferAccountInfo,
  ProgramDataAccountInfo,
  UpgradeableLoaderAccount,
} from "validators/accounts/upgradeable-program";

export function UpgradeableLoaderAccountSection({
  account,
  parsedData,
  programData,
}: {
  account: Account;
  parsedData: UpgradeableLoaderAccount;
  programData: ProgramDataAccountInfo | undefined;
}) {
  switch (parsedData.type) {
    case "program": {
      if (programData === undefined) {
        return <ErrorCard text="Invalid Upgradeable Program account" />;
      }
      return (
        <UpgradeableProgramSection
          account={account}
          programAccount={parsedData.info}
          programData={programData}
        />
      );
    }
    case "programData": {
      return (
        <UpgradeableProgramDataSection
          account={account}
          programData={parsedData.info}
        />
      );
    }
    case "buffer": {
      return (
        <UpgradeableProgramBufferSection
          account={account}
          programBuffer={parsedData.info}
        />
      );
    }
    case "uninitialized": {
      return <UnknownAccountCard account={account} />;
    }
  }
}

export function UpgradeableProgramSection({
  account,
  programAccount,
  programData,
}: {
  account: Account;
  programAccount: ProgramAccountInfo;
  programData: ProgramDataAccountInfo;
}) {
  const refresh = useFetchAccountInfo();
  const { cluster } = useCluster();
  const label = addressLabel(account.pubkey.toBase58(), cluster);
  return (
    <StyledTable
      cardHeader={
        <>
          <div>Program Account</div>
          <button
            className="btn btn-outline-dark btn-sm"
            onClick={() => refresh(account.pubkey)}
          >
            <span className="fe fe-refresh-cw mr-2"></span>
            Refresh
          </button>
        </>
      }
      tableBody={
        <>
          <tr>
            <td>Address</td>
            <td className="text-end">
              <Address pubkey={account.pubkey} alignRight raw />
            </td>
          </tr>
          {label && (
            <tr>
              <td>Address Label</td>
              <td className="text-end">{label}</td>
            </tr>
          )}
          <tr>
            <td>Balance (MTK)</td>
            <td className="text-end text-uppercase">
              <SolBalance lamports={account.lamports || 0} />
            </td>
          </tr>
          <tr>
            <td>Executable</td>
            <td className="text-end">Yes</td>
          </tr>
          <tr>
            <td>Executable Data</td>
            <td className="text-end">
              <Address pubkey={programAccount.programData} alignRight link />
            </td>
          </tr>
          <tr>
            <td>Upgradeable</td>
            <td className="text-end">
              {programData.authority !== null ? "Yes" : "No"}
            </td>
          </tr>
          <tr>
            <td>Last Deployed Slot</td>
            <td className="text-end">
              <Slot slot={programData.slot} link />
            </td>
          </tr>
          {programData.authority !== null && (
            <tr>
              <td>Upgrade Authority</td>
              <td className="text-end">
                <Address pubkey={programData.authority} alignRight link />
              </td>
            </tr>
          )}
        </>
      }
    />
  );
}

export function UpgradeableProgramDataSection({
  account,
  programData,
}: {
  account: Account;
  programData: ProgramDataAccountInfo;
}) {
  const refresh = useFetchAccountInfo();
  return (
    <StyledTable
      cardHeader={
        <>
          <div>Program Executable Data Account</div>
          <button
            className="btn btn-outline-dark btn-sm"
            onClick={() => refresh(account.pubkey)}
          >
            <span className="fe fe-refresh-cw mr-2"></span>
            Refresh
          </button>
        </>
      }
      tableBody={
        <>
          <tr>
            <td>Address</td>
            <td className="text-end">
              <Address pubkey={account.pubkey} alignRight raw />
            </td>
          </tr>
          <tr>
            <td>Balance (MTK)</td>
            <td className="text-end text-uppercase">
              <SolBalance lamports={account.lamports || 0} />
            </td>
          </tr>
          {account.details?.space !== undefined && (
            <tr>
              <td>Data (Bytes)</td>
              <td className="text-end">{account.details.space}</td>
            </tr>
          )}
          <tr>
            <td>Upgradeable</td>
            <td className="text-end">
              {programData.authority !== null ? "Yes" : "No"}
            </td>
          </tr>
          <tr>
            <td>Last Deployed Slot</td>
            <td className="text-end">
              <Slot slot={programData.slot} link />
            </td>
          </tr>
          {programData.authority !== null && (
            <tr>
              <td>Upgrade Authority</td>
              <td className="text-end">
                <Address pubkey={programData.authority} alignRight link />
              </td>
            </tr>
          )}
        </>
      }
    />
  );
}

export function UpgradeableProgramBufferSection({
  account,
  programBuffer,
}: {
  account: Account;
  programBuffer: ProgramBufferAccountInfo;
}) {
  const refresh = useFetchAccountInfo();
  return (
    <StyledTable
      cardHeader={
        <>
          <div>Program Deploy Buffer Account</div>
          <button
            className="btn btn-outline-dark btn-sm"
            onClick={() => refresh(account.pubkey)}
          >
            <span className="fe fe-refresh-cw mr-2"></span>
            Refresh
          </button>
        </>
      }
      tableBody={
        <>
          <tr>
            <td>Address</td>
            <td className="text-end">
              <Address pubkey={account.pubkey} alignRight raw />
            </td>
          </tr>
          <tr>
            <td>Balance (MTK)</td>
            <td className="text-end text-uppercase">
              <SolBalance lamports={account.lamports || 0} />
            </td>
          </tr>
          {account.details?.space !== undefined && (
            <tr>
              <td>Data (Bytes)</td>
              <td className="text-end">{account.details.space}</td>
            </tr>
          )}
          {programBuffer.authority !== null && (
            <tr>
              <td>Deploy Authority</td>
              <td className="text-end">
                <Address pubkey={programBuffer.authority} alignRight link />
              </td>
            </tr>
          )}
          {account.details && (
            <tr>
              <td>Owner</td>
              <td className="text-end">
                <Address pubkey={account.details.owner} alignRight link />
              </td>
            </tr>
          )}
        </>
      }
    />
  );
}
