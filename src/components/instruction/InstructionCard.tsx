import { useContext, useState } from "react";
import {
  TransactionInstruction,
  SignatureResult,
  ParsedInstruction,
} from "@solana/web3.js";
import { RawDetails } from "./RawDetails";
import { RawParsedDetails } from "./RawParsedDetails";
import { SignatureContext } from "../../pages/TransactionDetailsPage";
import {
  useFetchRawTransaction,
  useRawTransactionDetails,
} from "providers/transactions/raw";
import { Address } from "components/common/Address";
import StyledTable from "components/StyledTable";

type InstructionProps = {
  title: string;
  children?: React.ReactNode;
  result: SignatureResult;
  index: number;
  ix: TransactionInstruction | ParsedInstruction;
  defaultRaw?: boolean;
  innerCards?: JSX.Element[];
  childIndex?: number;
};

export function InstructionCard({
  title,
  children,
  result,
  index,
  ix,
  defaultRaw,
  innerCards,
  childIndex,
}: InstructionProps) {
  const [resultClass] = ixResult(result, index);
  const [showRaw, setShowRaw] = useState(defaultRaw || false);
  const signature = useContext(SignatureContext);
  const rawDetails = useRawTransactionDetails(signature);

  let raw: TransactionInstruction | undefined = undefined;
  if (rawDetails && childIndex === undefined) {
    raw = rawDetails?.data?.raw?.transaction.instructions[index];
  }

  const fetchRaw = useFetchRawTransaction();
  const fetchRawTrigger = () => fetchRaw(signature);

  const rawClickHandler = () => {
    if (!defaultRaw && !showRaw && !raw) {
      fetchRawTrigger();
    }

    return setShowRaw((r) => !r);
  };

  const cardHeader = (
    <>
      <h3 className="card-header-title mb-0 d-flex align-items-center">
        <span className={`badge bg-${resultClass}`}>
          #{index + 1}
          {childIndex !== undefined ? `.${childIndex + 1}` : ""}
        </span>
        {title}
      </h3>

      <button
        disabled={defaultRaw}
        className={`btn btn-sm d-flex ${
          showRaw ? "bg-black active" : "bg-white"
        }`}
        onClick={rawClickHandler}
      >
        <span className="fe fe-code mr-1"></span>
        Raw
      </button>
    </>
  );

  const tableBody = (
    <>
      {showRaw ? (
        <>
          <tr>
            <td>Program</td>
            <td className="text-end">
              <Address pubkey={ix.programId} alignRight link />
            </td>
          </tr>
          {"parsed" in ix ? (
            <RawParsedDetails ix={ix}>
              {raw ? <RawDetails ix={raw} /> : null}
            </RawParsedDetails>
          ) : (
            <RawDetails ix={ix} />
          )}
        </>
      ) : (
        { children }
      )}
      {innerCards && innerCards.length > 0 && (
        <tr>
          <td colSpan={2}>
            Inner Instructions
            <div className="inner-cards">{innerCards}</div>
          </td>
        </tr>
      )}
    </>
  );

  return <StyledTable cardHeader={cardHeader} tableBody={tableBody} />;
}

function ixResult(result: SignatureResult, index: number) {
  if (result.err) {
    const err = result.err as any;
    const ixError = err["InstructionError"];
    if (ixError && Array.isArray(ixError)) {
      const [errorIndex, error] = ixError;
      if (Number.isInteger(errorIndex) && errorIndex === index) {
        return ["warning", `Error: ${JSON.stringify(error)}`];
      }
    }
    return ["dark"];
  }
  return ["success"];
}
