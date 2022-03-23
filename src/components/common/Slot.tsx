import React from "react";
import { Link } from "react-router-dom";
import { clusterPath } from "utils/url";
import { Copyable } from "./Copyable";

type Props = {
  slot: number;
  link?: boolean;
};
export function Slot({ slot, link }: Props) {
  return link ? (
    <Copyable text={slot.toString()}>
      <span>
        <Link to={clusterPath(`/block/${slot}`)}>
          {slot.toLocaleString("en-US")}
        </Link>
      </span>
    </Copyable>
  ) : (
    <span>{slot.toLocaleString("en-US")}</span>
  );
}
