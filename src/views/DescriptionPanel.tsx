import React, { FC } from "react";
import { BsInfoCircle } from "react-icons/bs";
import { VisualMode } from "../types";

import Panel from "./Panel";


const DescriptionPanel: FC<{ mode: VisualMode }> = ({ mode }) => {
  return (
    <Panel
      initiallyDeployed
      title={
        <>
          <BsInfoCircle className="text-muted" /> Description
        </>
      }
    >
      <p>
        Placeholder
      </p>
    </Panel>
  );
};

export default DescriptionPanel;
