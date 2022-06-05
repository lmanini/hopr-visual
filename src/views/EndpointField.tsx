import React, { KeyboardEvent, ChangeEvent, FC, useEffect, useState } from "react";
import { useSigma } from "react-sigma-v2";
import { Attributes } from "graphology-types";
import { BsSearch } from "react-icons/bs";

import { FiltersState, VisualMode } from "../types";
import internal from "stream";

/**
 * This component is basically a fork from React-sigma-v2's SearchControl
 * component, to get some minor adjustments:
 * 1. We need to hide hidden nodes from results
 * 2. We need custom markup
 */
const EndpointField: FC<{ endpoint: string, remoteValid: boolean, error: string, setRemoteEndpoint: React.Dispatch<React.SetStateAction<string>>, setRemoteValid: React.Dispatch<React.SetStateAction<boolean>> }> = ({ endpoint, remoteValid, error, setRemoteEndpoint, setRemoteValid }) => {
  const sigma = useSigma();

  const [selected, setSelected] = useState<string | null>(null);
  const [internalValid, setInternalValid] = useState<boolean>(false);


  // Refresh values when filters are updated (but wait a frame first):
  useEffect(() => {
    const regex = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(:((6553[0-5])|(655[0-2][0-9])|(65[0-4][0-9]{2})|(6[0-4][0-9]{3})|([1-5][0-9]{4})|([0-5]{2,5})|([0-9]{2,4})))$/
    // console.log("Pattern is ", valid, " for ", endpoint)
    setInternalValid(regex.test(endpoint))
  }, [endpoint]);

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setSelected(null);
    setRemoteEndpoint(input);
    setRemoteValid(false)
  };

  const onKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && internalValid) {
      setRemoteValid(internalValid)
    }
  };

  return (
    <div className="search-wrapper">
      <input
        type="search"
        placeholder={"Insert local node endpoint"}
        list="nodes"
        value={endpoint}
        onChange={onInputChange}
        onKeyPress={onKeyPress}
      />
      <input
        type="search"
        placeholder={"Insert local node endpoint"}
        list="nodes"
        value={endpoint}
        onChange={onInputChange}
        onKeyPress={onKeyPress}
      />
      {endpoint.length != 0 ? <> {!internalValid ? <div className="endpointInfo endpointError">Endpoint is invalid </div> : remoteValid ? <div className="endpointInfo endpointSuccess">Connecting to the node...</div> : <div className="endpointInfo endpointSuccess">Press ENTER to connect to the node</div>} </> : <> <div className="endpointInfo endpointEmpty">Insert an endpoint above </div> </>}
      <BsSearch className="icon" />
    </div>
  );
};

export default EndpointField;
