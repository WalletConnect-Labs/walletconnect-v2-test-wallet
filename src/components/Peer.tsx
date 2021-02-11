import * as React from "react";
import styled from "styled-components";
import { SessionTypes } from "@walletconnect/types";
import { colors, fonts } from "../styles";

const SPeerCard = styled.div`
  align-items: center;
  justify-content: center;
  display: flex;
  width: 100%;
  flex-direction: column;
  border-radius: 8px;
  border: 2px solid rgb(${colors.darkGrey});
  padding: 5px;
  & > div {
    margin: 4px auto;
  }
`;

const SPeerOneLiner = styled(SPeerCard as any)`
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

const SUrl = styled(SCenter as any)`
  font-size: ${fonts.size.small};
  opacity: 0.8;
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
    <SPeerOneLiner>
      <img src={props.peerMeta.icons[0]} alt={props.peerMeta.name} />
      <div>{props.peerMeta.name}</div>
    </SPeerOneLiner>
  ) : (
    <SPeerCard>
      <SIcon src={props.peerMeta.icons[0]} alt={props.peerMeta.name} />
      <SName>{props.peerMeta.name}</SName>
      <SCenter>{props.peerMeta.description}</SCenter>
      <SUrl>{props.peerMeta.url}</SUrl>
    </SPeerCard>
  );

export default Peer;
