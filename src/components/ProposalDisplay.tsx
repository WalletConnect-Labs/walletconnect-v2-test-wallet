import * as React from "react";
import styled from "styled-components";
import { SessionTypes } from "@walletconnect/types";

import Column from "./Column";
import Button from "./Button";
import Peer from "./Peer";
import Blockchain from "./Blockchain";
import Method from "./Method";

const SActions = styled.div`
  margin: 0;
  margin-top: 20px;

  display: flex;
  justify-content: space-around;
  & > * {
    margin: 0 5px;
  }
`;

interface ProposalDisplayProps {
  proposal: SessionTypes.Proposal;
  approveSession: (proposal: SessionTypes.Proposal) => Promise<void>;
  rejectSession: (proposal: SessionTypes.Proposal) => Promise<void>;
}

const ProposalDisplay = (props: ProposalDisplayProps) => {
  const { proposal, approveSession, rejectSession } = props;
  const { chains } = proposal.permissions.blockchain;
  const { methods } = proposal.permissions.jsonrpc;
  return (
    <Column>
      <Peer peerMeta={proposal.proposer.metadata} />
      {!!chains.length ? (
        <React.Fragment>
          <h6>{"Chains"}</h6>
          {chains.map((chainId) => {
            return <Blockchain key={`proposal:chainId:${chainId}`} chainId={chainId} />;
          })}
        </React.Fragment>
      ) : null}
      {!!methods.length ? (
        <React.Fragment>
          <h6>{"Methods"}</h6>
          {methods.map((method) => (
            <Method key={`proposal:method:${method}`}>
              <div>{method}</div>
            </Method>
          ))}
        </React.Fragment>
      ) : null}
      <SActions>
        <Button onClick={() => approveSession(proposal)}>{`Approve`}</Button>
        <Button onClick={() => rejectSession(proposal)}>{`Reject`}</Button>
      </SActions>
    </Column>
  );
};

export default ProposalDisplay;
