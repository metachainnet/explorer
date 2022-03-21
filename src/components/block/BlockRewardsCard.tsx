import { BlockResponse, PublicKey } from "@solana/web3.js";
import { Address } from "components/common/Address";
import { useState } from "react";
import { SolBalance } from "utils";

const PAGE_SIZE = 10;

export function BlockRewardsCard({ block }: { block: BlockResponse }) {
  const [rewardsDisplayed, setRewardsDisplayed] = useState(PAGE_SIZE);

  if (!block.rewards || block.rewards.length < 1) {
    return null;
  }

  return (
    <>
      <div className="row">
        <div className="col-lg-12">
          <div className="table-responsive">
            <table className="table table-striped table-latests caption-top">
              <caption>Block Rewards</caption>
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>New Balance</th>
                  <th>Percent Change</th>
                </tr>
              </thead>
              <tbody>
                {block.rewards.map((reward, index) => {
                  if (index >= rewardsDisplayed - 1) {
                    return null;
                  }

                  let percentChange;
                  if (reward.postBalance !== null && reward.postBalance !== 0) {
                    percentChange = (
                      (Math.abs(reward.lamports) /
                        (reward.postBalance - reward.lamports)) *
                      100
                    ).toFixed(9);
                  }
                  return (
                    <tr key={reward.pubkey + reward.rewardType}>
                      <td>
                        <Address pubkey={new PublicKey(reward.pubkey)} link />
                      </td>
                      <td>{reward.rewardType}</td>
                      <td>
                        <SolBalance lamports={reward.lamports} />
                      </td>
                      <td>
                        {reward.postBalance ? (
                          <SolBalance lamports={reward.postBalance} />
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>{percentChange ? percentChange + "%" : "-"}</td>
                    </tr>
                  );
                })}

                {block.rewards.length > rewardsDisplayed && (
                  <tr>
                    <td colSpan={5}>
                      <button
                        className="btn btn-primary w-100"
                        onClick={() =>
                          setRewardsDisplayed(
                            (displayed) => displayed + PAGE_SIZE
                          )
                        }
                      >
                        Load More
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
