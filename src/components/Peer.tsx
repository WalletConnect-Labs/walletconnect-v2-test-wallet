import * as React from "react";
import styled from "styled-components";
import { SessionTypes } from "@walletconnect/types";

const SPeer = styled.div`
  display: flex;
  align-items: center;
  & img {
    width: 40px;
    height: 40px;
  }
  & > div {
    margin-left: 10px;
  }
`;

const SIcon = styled.img`
  width: 100px;
  margin: 0 auto;
`;

const SCenter = styled.div`
  text-align: center;
`;

const SName = styled(SCenter as any)`
  font-weight: bold;
`;

interface PeerProps {
  oneLiner?: boolean;
  peerMeta: SessionTypes.Metadata;
}

const Peer = (props: PeerProps) =>
  props.oneLiner ? (
    <SPeer>
      <img src={props.peerMeta.icons[0]} alt={props.peerMeta.name} />
      <div>{props.peerMeta.name}</div>
    </SPeer>
  ) : (
    <>
      <SIcon src={props.peerMeta.icons[0]} alt={props.peerMeta.name} />
      <SName>{props.peerMeta.name}</SName>
      <SCenter>{props.peerMeta.description}</SCenter>
      <SCenter>{props.peerMeta.url}</SCenter>
    </>
  );

export default Peer;
