import { BlockResponse, PublicKey } from "@solana/web3.js";
import { Address } from "components/common/Address";

export function BlockProgramsCard({ block }: { block: BlockResponse }) {
  const totalTransactions = block.transactions.length;
  const txSuccesses = new Map<string, number>();
  const txFrequency = new Map<string, number>();
  const ixFrequency = new Map<string, number>();

  let totalInstructions = 0;
  block.transactions.forEach((tx) => {
    const message = tx.transaction.message;
    totalInstructions += message.instructions.length;
    const programUsed = new Set<string>();
    const trackProgram = (index: number) => {
      if (index >= message.accountKeys.length) return;
      const programId = message.accountKeys[index];
      const programAddress = programId.toBase58();
      programUsed.add(programAddress);
      const frequency = ixFrequency.get(programAddress);
      ixFrequency.set(programAddress, frequency ? frequency + 1 : 1);
    };

    message.instructions.forEach((ix) => trackProgram(ix.programIdIndex));
    tx.meta?.innerInstructions?.forEach((inner) => {
      totalInstructions += inner.instructions.length;
      inner.instructions.forEach((innerIx) =>
        trackProgram(innerIx.programIdIndex)
      );
    });

    const successful = tx.meta?.err === null;
    programUsed.forEach((programId) => {
      const frequency = txFrequency.get(programId);
      txFrequency.set(programId, frequency ? frequency + 1 : 1);
      if (successful) {
        const count = txSuccesses.get(programId);
        txSuccesses.set(programId, count ? count + 1 : 1);
      }
    });
  });

  const programEntries = [];
  for (let entry of txFrequency) {
    programEntries.push(entry);
  }

  programEntries.sort((a, b) => {
    if (a[1] < b[1]) return 1;
    if (a[1] > b[1]) return -1;
    return 0;
  });

  return (
    <>
      <div className="row">
        <div className="col-lg-12">
          <div className="table-responsive">
            <table className="table table-latests caption-top">
              <caption>Block Program Stats</caption>
              <tbody>
                <tr>
                  <td className="w-100">Unique Programs Count</td>
                  <td>{programEntries.length}</td>
                </tr>
                <tr>
                  <td className="w-100">Total Instructions</td>
                  <td>{totalInstructions}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-12">
          <div className="table-responsive">
            <table className="table table-striped table-latests caption-top">
              <caption>Block Programs</caption>
              <thead>
                <tr>
                  <th className="text-muted">Program</th>
                  <th className="text-muted">Transaction Count</th>
                  <th className="text-muted">% of Total</th>
                  <th className="text-muted">Instruction Count</th>
                  <th className="text-muted">% of Total</th>
                  <th className="text-muted">Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {programEntries.map(([programId, txFreq]) => {
                  const ixFreq = ixFrequency.get(programId) as number;
                  const successes = txSuccesses.get(programId) || 0;
                  return (
                    <tr key={programId}>
                      <td>
                        <Address pubkey={new PublicKey(programId)} link />
                      </td>
                      <td>{txFreq}</td>
                      <td>
                        {((100 * txFreq) / totalTransactions).toFixed(2)}%
                      </td>
                      <td>{ixFreq}</td>
                      <td>
                        {((100 * ixFreq) / totalInstructions).toFixed(2)}%
                      </td>
                      <td>{((100 * successes) / txFreq).toFixed(0)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
