import {
  ParsedMessageAccount,
  PublicKey,
  TokenAmount,
  TokenBalance,
} from "@solana/web3.js";
import { BigNumber } from "bignumber.js";
import { Address } from "components/common/Address";
import { BalanceDelta } from "components/common/BalanceDelta";
import { SignatureProps } from "pages/TransactionDetailsPage";
import { useTransactionDetails } from "providers/transactions";
import { useTokenRegistry } from "providers/mints/token-registry";
import StyledTable from "components/StyledTable";

export type TokenBalanceRow = {
  account: PublicKey;
  mint: string;
  balance: TokenAmount;
  delta: BigNumber;
  accountIndex: number;
};

export function TokenBalancesCard({ signature }: SignatureProps) {
  const details = useTransactionDetails(signature);
  const { tokenRegistry } = useTokenRegistry();

  if (!details) {
    return null;
  }

  const preTokenBalances = details.data?.transaction?.meta?.preTokenBalances;
  const postTokenBalances = details.data?.transaction?.meta?.postTokenBalances;

  const accountKeys =
    details.data?.transaction?.transaction.message.accountKeys;

  if (!preTokenBalances || !postTokenBalances || !accountKeys) {
    return null;
  }

  const rows = generateTokenBalanceRows(
    preTokenBalances,
    postTokenBalances,
    accountKeys
  );

  if (rows.length < 1) {
    return null;
  }

  const accountRows = rows.map(({ account, delta, balance, mint }) => {
    const key = account.toBase58() + mint;
    const units = tokenRegistry.get(mint)?.symbol || "tokens";

    return (
      <tr key={key}>
        <td>
          <Address pubkey={account} link />
        </td>
        <td>
          <Address pubkey={new PublicKey(mint)} link />
        </td>
        <td>
          <BalanceDelta delta={delta} />
        </td>
        <td>
          {balance.uiAmountString} {units}
        </td>
      </tr>
    );
  });

  return (
    <StyledTable
      tableCaption="Token Balances"
      tableHead={["Address", "Token", "Change", "Post Balanmce"]}
      tableBody={accountRows}
    />
  );
}

export function generateTokenBalanceRows(
  preTokenBalances: TokenBalance[],
  postTokenBalances: TokenBalance[],
  accounts: ParsedMessageAccount[]
): TokenBalanceRow[] {
  let preBalanceMap: { [index: number]: TokenBalance } = {};

  preTokenBalances.forEach(
    (balance) => (preBalanceMap[balance.accountIndex] = balance)
  );

  let rows: TokenBalanceRow[] = [];

  postTokenBalances.forEach(({ uiTokenAmount, accountIndex, mint }) => {
    const preBalance = preBalanceMap[accountIndex];
    const account = accounts[accountIndex].pubkey;

    if (!uiTokenAmount.uiAmountString) {
      // uiAmount deprecation
      return;
    }

    // case where mint changes
    if (preBalance && preBalance.mint !== mint) {
      if (!preBalance.uiTokenAmount.uiAmountString) {
        // uiAmount deprecation
        return;
      }

      rows.push({
        account: accounts[accountIndex].pubkey,
        accountIndex,
        balance: {
          decimals: preBalance.uiTokenAmount.decimals,
          amount: "0",
          uiAmount: 0,
        },
        delta: new BigNumber(-preBalance.uiTokenAmount.uiAmountString),
        mint: preBalance.mint,
      });

      rows.push({
        account: accounts[accountIndex].pubkey,
        accountIndex,
        balance: uiTokenAmount,
        delta: new BigNumber(uiTokenAmount.uiAmountString),
        mint: mint,
      });
      return;
    }

    let delta;

    if (preBalance) {
      if (!preBalance.uiTokenAmount.uiAmountString) {
        // uiAmount deprecation
        return;
      }

      delta = new BigNumber(uiTokenAmount.uiAmountString).minus(
        preBalance.uiTokenAmount.uiAmountString
      );
    } else {
      delta = new BigNumber(uiTokenAmount.uiAmountString);
    }

    rows.push({
      account,
      mint,
      balance: uiTokenAmount,
      delta,
      accountIndex,
    });
  });

  return rows.sort((a, b) => a.accountIndex - b.accountIndex);
}
