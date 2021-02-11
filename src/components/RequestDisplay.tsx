import * as React from "react";
import styled from "styled-components";
import { SessionTypes } from "@walletconnect/types";
import { JsonRpcRequest } from "@json-rpc-tools/utils";

import Column from "./Column";
import Button from "./Button";
import Blockchain from "./Blockchain";

import { getChainRequestRender } from "../chains";
import Peer from "./Peer";

const SValue = styled.div`
  font-family: monospace;
  width: 100%;
  font-size: 12px;
  background-color: #eee;
  padding: 8px;
  word-break: break-word;
  border-radius: 8px;
  margin-bottom: 10px;
`;

const SActions = styled.div`
  margin: 0;
  margin-top: 20px;

  display: flex;
  justify-content: space-around;
  & > * {
    margin: 0 5px;
  }
`;

interface RequestDisplayProps {
  chainId: string;
  request: JsonRpcRequest;
  peerMeta: SessionTypes.Metadata;
  approveRequest: any;
  rejectRequest: any;
}

const RequestDisplay = (props: RequestDisplayProps) => {
  const { chainId, request, peerMeta, approveRequest, rejectRequest } = props;

  const params = getChainRequestRender(request, chainId);
  console.log("RENDER", "method", request.method);
  console.log("RENDER", "params", request.params);
  console.log("RENDER", "formatted", params);

  return (
    <Column>
      <h6>{"App"}</h6>
      <Peer oneLiner peerMeta={peerMeta} />
      <h6>{"Chain"}</h6>
      <Blockchain key={`request:chain:${chainId}`} chainId={chainId} />
      {params.map((param) => (
        <React.Fragment key={param.label}>
          <h6>{param.label}</h6>
          <SValue>{param.value}</SValue>
        </React.Fragment>
      ))}
      <SActions>
        <Button onClick={approveRequest}>{`Approve`}</Button>
        <Button onClick={rejectRequest}>{`Reject`}</Button>
      </SActions>
    </Column>
  );
};

export default RequestDisplay;
