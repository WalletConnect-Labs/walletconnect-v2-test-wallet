import * as React from "react";
import styled from "styled-components";

import { getChainMetadata } from "../chains";
import { ellipseAddress } from "../helpers";

interface AccountStyleProps {
  color: string;
}

const SAccount = styled.div<AccountStyleProps>`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border-radius: 8px;
  padding: 8px;
  margin: 5px 0;
  border: ${({ color }) => `2px solid rgb(${color})`};
`;

const SChain = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  & p {
    font-weight: 600;
  }
  & img {
    border-radius: 50%;
    width: 35px;
    height: 35px;
    margin-right: 10px;
  }
`;

interface BlockchainProps {
  chainId: string;
  address?: string;
}

const Blockchain = (props: BlockchainProps) => {
  const { chainId, address } = props;
  const chainMeta = getChainMetadata(chainId);
  return (
    <React.Fragment>
      <SAccount color={chainMeta.color}>
        <SChain>
          <img src={chainMeta.logo} alt={chainMeta.name} />
          <p>{chainMeta.name}</p>
        </SChain>
        {!!address && <p>{ellipseAddress(address)}</p>}
      </SAccount>
    </React.Fragment>
  );
};
export default Blockchain;
