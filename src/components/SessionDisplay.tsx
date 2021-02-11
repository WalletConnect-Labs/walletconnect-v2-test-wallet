import * as React from "react";
import styled from "styled-components";
import { SessionTypes } from "@walletconnect/types";
import { JsonRpcRequest } from "@json-rpc-tools/utils";

import Column from "./Column";
import Button from "./Button";

import { getChainMetadata } from "../chains";
import Peer from "./Peer";
import Blockchain from "./Blockchain";

const SActions = styled.div`
  margin: 0;
  margin-top: 20px;

  display: flex;
  justify-content: space-around;
  & > * {
    margin: 0 5px;
  }
`;

interface SessionDisplayProps {
  session: SessionTypes.Created;
  resetCard: any;
  disconnect: any;
}

const SessionDisplay = (props: SessionDisplayProps) => {
  const { session, resetCard, disconnect } = props;

  const { accounts } = session.state;
  const { methods } = session.permissions.jsonrpc;
  return (
    <Column>
      <h6>{"App"}</h6>
      <Peer peerMeta={session.peer.metadata} />
      {!!accounts.length ? (
        <React.Fragment>
          <h6>{"Accounts"}</h6>
          {accounts.map((account) => {
            const [address, chainId] = account.split("@");
            return (
              <Blockchain key={`session:account:${account}`} chainId={chainId} address={address} />
            );
          })}
        </React.Fragment>
      ) : null}
      {!!methods.length ? (
        <React.Fragment>
          <h6>{"Methods"}</h6>
          {methods.map((method) => (
            <p key={`session:method:${method}`}>{method}</p>
          ))}
        </React.Fragment>
      ) : null}
      <SActions>
        <Button onClick={resetCard}>{`Go Back`}</Button>
        <Button outline onClick={() => disconnect(session.topic)}>{`disconnect`}</Button>
      </SActions>
    </Column>
  );
};

export default SessionDisplay;
