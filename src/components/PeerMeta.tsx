import * as React from "react";
import styled from "styled-components";
import { SessionTypes } from "@walletconnect/types";

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

interface PeerMetaProps {
  peerMeta: SessionTypes.Metadata;
}

const PeerMeta = (props: PeerMetaProps) => (
  <>
    <SIcon src={props.peerMeta.icons[0]} alt={props.peerMeta.name} />
    <SName>{props.peerMeta.name}</SName>
    <SCenter>{props.peerMeta.description}</SCenter>
    <SCenter>{props.peerMeta.url}</SCenter>
  </>
);

export default PeerMeta;
