import * as React from "react";
import styled from "styled-components";
import { getSupportedChains } from "caip-wallet";

// import Dropdown from "./Dropdown";
import Blockie from "./Blockie";

import { responsive } from "../styles";
import { ellipseAddress, getViewportDimensions } from "../helpers";

const SSection = styled.div`
  width: 100%;
`;

const SBlockie = styled(Blockie)`
  margin-right: 5px;
  @media screen and (${responsive.xs.max}) {
    margin-right: 1vw;
  }
`;

const SAddressDropdownWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

interface AccountDetailsProps {
  accounts: string[];
  chainId: string;
  updateAddress?: any;
  updateChain?: any;
}

const AccountDetails = (props: AccountDetailsProps) => {
  const { accounts, chainId } = props;
  const windowWidth = getViewportDimensions().x;
  const maxWidth = 468;
  const maxChar = 12;
  const ellipseLength =
    windowWidth > maxWidth ? maxChar : Math.floor(windowWidth * (maxChar / maxWidth));
  // const accountsMap = accounts.map((addr: string, index: number) => ({
  //   index,
  //   display_address: ellipseAddress(addr, ellipseLength),
  // }));
  const chainName = chainId ? getSupportedChains()[chainId].name : undefined;
  const address = accounts.length ? accounts[0].split("@")[0] : undefined;
  return (
    <React.Fragment>
      <SSection>
        <h6>{"Account"}</h6>
        <SAddressDropdownWrapper>
          <SBlockie size={40} address={address} />
          <p>{ellipseAddress(address, ellipseLength)}</p>

          {/* <Dropdown
            monospace
            selected={activeIndex}
            options={accountsMap}
            displayKey={"display_address"}
            targetKey={"index"}
            onChange={updateAddress}
          /> */}
        </SAddressDropdownWrapper>
      </SSection>
      <SSection>
        <h6>{"Chain"}</h6>
        <p>{chainName}</p>
        {/* <Dropdown
          selected={chainId}
          options={chains}
          displayKey={"name"}
          targetKey={"chain_id"}
          onChange={updateChain}
        /> */}
      </SSection>
    </React.Fragment>
  );
};
export default AccountDetails;
