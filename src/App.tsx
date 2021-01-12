import * as React from "react";
import styled from "styled-components";
import KeyValueStorage from "keyvaluestorage";
import Wallet from "caip-wallet";
import Client, { CLIENT_EVENTS } from "@walletconnect/client";
import { isJsonRpcRequest, JsonRpcResponse, formatJsonRpcError } from "@json-rpc-tools/utils";
import { getSessionMetadata } from "@walletconnect/utils";
import { SessionTypes } from "@walletconnect/types";

import Button from "./components/Button";
import Card from "./components/Card";
import Input from "./components/Input";
import Header from "./components/Header";
import Column from "./components/Column";
import PeerMeta from "./components/PeerMeta";
import RequestDisplay from "./components/RequestDisplay";
import RequestButton from "./components/RequestButton";
import AccountDetails from "./components/AccountDetails";
import QRCodeScanner, { QRCodeValidateResponse } from "./components/QRCodeScanner";

import logo from "./assets/walletconnect-logo.png";
import { DEFAULT_CHAINS, DEFAULT_CHAIN_ID, DEFAULT_RELAY_PROVIDER } from "./constants";

const EMPTY_METADATA = {
  name: "",
  description: "",
  url: "",
  icons: [],
};

const SContainer = styled.div`
  display: flex;
  flex-direction: column;

  width: 100%;
  min-height: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 0;
`;

const SVersionNumber = styled.div`
  position: absolute;
  font-size: 12px;
  bottom: 6%;
  right: 0;
  opacity: 0.3;
  transform: rotate(-90deg);
`;

const SContent = styled.div`
  width: 100%;
  flex: 1;
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const SLogo = styled.div`
  padding: 10px 0;
  display: flex;
  max-height: 100px;
  & img {
    width: 100%;
  }
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

const SActionsColumn = styled(SActions as any)`
  flex-direction: row;
  align-items: center;

  margin: 24px 0 6px;

  & > p {
    font-weight: 600;
  }
`;

const SButton = styled(Button)`
  width: 50%;
  height: 40px;
`;

const SInput = styled(Input)`
  width: 50%;
  margin: 10px;
  font-size: 14px;
  height: 40px;
`;

const SConnectedPeer = styled.div`
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

const SRequestButton = styled(RequestButton)`
  margin-bottom: 10px;
`;

export interface AppState {
  client: Client | undefined;
  storage: KeyValueStorage | undefined;
  wallet: Wallet | undefined;
  proposal: SessionTypes.Proposal | undefined;
  session: SessionTypes.Created | undefined;
  loading: boolean;
  scanner: boolean;
  connected: boolean;
  chainId: string;
  accounts: string[];
  requests: SessionTypes.PayloadEvent[];
  results: any[];
  payload: SessionTypes.PayloadEvent | undefined;
}

export const INITIAL_STATE: AppState = {
  client: undefined,
  storage: undefined,
  wallet: undefined,
  proposal: undefined,
  session: undefined,
  loading: false,
  scanner: false,
  connected: false,
  chainId: DEFAULT_CHAIN_ID,
  accounts: [],
  requests: [],
  results: [],
  payload: undefined,
};

class App extends React.Component<{}> {
  public state: AppState;

  constructor(props: any) {
    super(props);
    this.state = {
      ...INITIAL_STATE,
    };
  }
  public componentDidMount() {
    this.init();
  }

  public init = async () => {
    this.setState({ loading: true });
    try {
      const storage = new KeyValueStorage();
      const wallet = await Wallet.init({ chainIds: DEFAULT_CHAINS, storage });
      const client = await Client.init({
        relayProvider: DEFAULT_RELAY_PROVIDER,
        logger: "debug",
        storage,
      });
      const accounts = await wallet.getAccountIds(this.state.chainId);
      this.setState({ loading: false, storage, client, wallet, accounts });
      this.subscribeToEvents();
    } catch (e) {
      this.setState({ loading: false });
      throw e;
    }
  };

  public approveSession = async () => {
    console.log("ACTION", "approveSession");
    if (typeof this.state.client === "undefined") {
      throw new Error("WalletConnect is not initialized");
    }
    if (typeof this.state.proposal === "undefined") {
      throw new Error("Proposal is undefined");
    }
    if (typeof this.state.accounts === "undefined") {
      throw new Error("Accounts is undefined");
    }
    const metadata = getSessionMetadata() || EMPTY_METADATA;
    const response = {
      state: { accountIds: this.state.accounts },
      metadata: { ...metadata, description: "Test Wallet for WalletConnect" },
    };
    const session = await this.state.client.approve({ proposal: this.state.proposal, response });
    this.setState({ proposal: undefined, session });
  };

  public rejectSession = async () => {
    console.log("ACTION", "rejectSession");
    if (typeof this.state.client === "undefined") {
      throw new Error("WalletConnect is not initialized");
    }
    if (typeof this.state.proposal === "undefined") {
      throw new Error("Proposal is undefined");
    }
    await this.state.client.reject({ proposal: this.state.proposal });
  };

  public disconnect = () => {
    console.log("ACTION", "disconnect");
    if (typeof this.state.client === "undefined") {
      throw new Error("WalletConnect is not initialized");
    }
    if (typeof this.state.session === "undefined") {
      throw new Error("Session is not created");
    }
    this.state.client.disconnect({
      topic: this.state.session.topic,
      reason: "User disconnected session",
    });
    this.resetApp();
  };

  public resetApp = async () => {
    await this.setState({ ...INITIAL_STATE });
    this.init();
  };

  public subscribeToEvents = () => {
    console.log("ACTION", "subscribeToEvents");

    if (typeof this.state.client === "undefined") {
      throw new Error("WalletConnect is not initialized");
    }

    this.state.client.on(CLIENT_EVENTS.session.proposal, (proposal: SessionTypes.Proposal) => {
      console.log("EVENT", "session_proposal");
      this.setState({ proposal });
    });

    this.state.client.on(
      CLIENT_EVENTS.session.payload,
      async (payloadEvent: SessionTypes.PayloadEvent) => {
        if (isJsonRpcRequest(payloadEvent.payload)) {
          if (typeof this.state.wallet === "undefined") {
            throw new Error("Wallet is not initialized");
          }
          // tslint:disable-next-line
          console.log("EVENT", "session_payload", payloadEvent.payload);
          const chainId = payloadEvent.chainId || this.state.chainId;
          try {
            // TODO: needs improvement
            const requiresApproval = this.state.wallet.chains[chainId].assert(payloadEvent.payload);
            if (requiresApproval) {
              this.setState({ requests: [...this.state.requests, payloadEvent] });
            } else {
              const response = await this.state.wallet.resolve(payloadEvent.payload, chainId);
              await this.respondRequest(payloadEvent.topic, response);
            }
          } catch (e) {
            const response = formatJsonRpcError(payloadEvent.payload.id, e.message);
            await this.respondRequest(payloadEvent.topic, response);
          }
        }
      },
    );

    this.state.client.on(CLIENT_EVENTS.session.created, () => {
      console.log("EVENT", "session_created");
      this.setState({ connected: true });
    });

    this.state.client.on(CLIENT_EVENTS.session.deleted, () => {
      console.log("EVENT", "session_deleted");
      this.resetApp();
    });
  };

  public toggleScanner = () => {
    console.log("ACTION", "toggleScanner");
    this.setState({ scanner: !this.state.scanner });
  };

  public onQRCodeValidate = (data: string) => {
    const res: QRCodeValidateResponse = { error: null, result: null };
    try {
      res.result = data;
    } catch (error) {
      res.error = error;
    }

    return res;
  };

  public onQRCodeScan = async (data: any) => {
    this.onURI(data);
    this.toggleScanner();
  };

  public onURIPaste = async (e: any) => {
    const data = e.target.value;
    this.onURI(data);
  };

  public onURI = async (data: any) => {
    const uri = typeof data === "string" ? data : "";
    if (!uri) {
      return;
    }
    if (typeof this.state.client === "undefined") {
      throw new Error("WalletConnect is not initialized");
    }
    await this.state.client.pair({ uri });
  };

  public onQRCodeError = (error: Error) => {
    throw error;
  };

  public onQRCodeClose = () => this.toggleScanner();

  public openRequest = (request: SessionTypes.PayloadEvent) => this.setState({ payload: request });

  public closeRequest = async () => {
    if (typeof this.state.payload === "undefined") {
      throw new Error("Payload is undefined");
    }
    const filteredRequests = this.state.requests.filter(
      request => request.payload.id !== this.state.payload?.payload.id,
    );
    await this.setState({ requests: filteredRequests, payload: undefined });
  };

  public respondRequest = async (topic: string, response: JsonRpcResponse) => {
    if (typeof this.state.client === "undefined") {
      throw new Error("WalletConnect is not initialized");
    }
    await this.state.client.respond({ topic, response });
  };

  public approveRequest = async () => {
    if (typeof this.state.client === "undefined") {
      throw new Error("WalletConnect is not initialized");
    }
    try {
      if (typeof this.state.payload === "undefined") {
        throw new Error("Payload is undefined");
      }
      if (typeof this.state.wallet === "undefined") {
        throw new Error("Wallet is not initialized");
      }
      const chainId = this.state.payload.chainId || this.state.chainId;
      const response = await this.state.wallet.approve(this.state.payload.payload as any, chainId);
      this.state.client.respond({
        topic: this.state.payload.topic,
        response,
      });
    } catch (error) {
      console.error(error);
      if (typeof this.state.payload === "undefined") {
        throw new Error("Payload is undefined");
      }
      this.state.client.respond({
        topic: this.state.payload.topic,
        response: formatJsonRpcError(this.state.payload.payload.id, "Failed or Rejected Request"),
      });
    }

    this.closeRequest();
  };

  public rejectRequest = async () => {
    if (typeof this.state.client === "undefined") {
      throw new Error("WalletConnect is not initialized");
    }
    if (typeof this.state.payload === "undefined") {
      throw new Error("Payload is undefined");
    }
    this.state.client.respond({
      topic: this.state.payload.topic,
      response: formatJsonRpcError(this.state.payload.payload.id, "Failed or Rejected Request"),
    });
    await this.closeRequest();
  };

  public render() {
    const {
      scanner,
      connected,
      accounts,
      session,
      proposal,
      chainId,
      requests,
      payload,
    } = this.state;
    return (
      <React.Fragment>
        <SContainer>
          <Header
            disconnect={this.disconnect}
            connected={connected}
            chainId={chainId}
            accounts={accounts}
          />
          <SContent>
            <Card maxWidth={400}>
              <SLogo>
                <img src={logo} alt={"WalletConnect"} />
              </SLogo>
              {!connected ? (
                proposal ? (
                  <Column>
                    <PeerMeta peerMeta={proposal.proposer.metadata} />
                    <SActions>
                      <Button onClick={this.approveSession}>{`Approve`}</Button>
                      <Button onClick={this.rejectSession}>{`Reject`}</Button>
                    </SActions>
                  </Column>
                ) : (
                  <Column>
                    <AccountDetails chainId={chainId} accounts={accounts} />
                    <SActionsColumn>
                      <SButton onClick={this.toggleScanner}>{`Scan`}</SButton>
                      <p>{"OR"}</p>
                      <SInput onChange={this.onURIPaste} placeholder={"Paste wc: uri"} />
                    </SActionsColumn>
                  </Column>
                )
              ) : !payload ? (
                <Column>
                  <AccountDetails chainId={chainId} accounts={accounts} />
                  {session && session.peer ? (
                    <>
                      <h6>{"Connected to"}</h6>
                      <SConnectedPeer>
                        <img
                          src={session.peer.metadata.icons[0]}
                          alt={session.peer.metadata.name}
                        />
                        <div>{session.peer.metadata.name}</div>
                      </SConnectedPeer>
                    </>
                  ) : null}
                  <h6>{"Pending Call Requests"}</h6>
                  {requests.length ? (
                    requests.map(request => (
                      <SRequestButton
                        key={request.payload.id}
                        onClick={() => this.openRequest(request)}
                      >
                        <div>
                          {isJsonRpcRequest(request.payload) ? request.payload.method : "unknown"}
                        </div>
                      </SRequestButton>
                    ))
                  ) : (
                    <div>
                      <div>{"No pending requests"}</div>
                    </div>
                  )}
                </Column>
              ) : (
                <RequestDisplay
                  chainId={payload.chainId || this.state.chainId}
                  request={payload.payload}
                  peerMeta={session?.peer.metadata || EMPTY_METADATA}
                  approveRequest={this.approveRequest}
                  rejectRequest={this.rejectRequest}
                />
              )}
            </Card>
          </SContent>
          {scanner && (
            <QRCodeScanner
              onValidate={this.onQRCodeValidate}
              onScan={this.onQRCodeScan}
              onError={this.onQRCodeError}
              onClose={this.onQRCodeClose}
            />
          )}
        </SContainer>
        <SVersionNumber>{`v${process.env.REACT_APP_VERSION || "2.0.0-alpha"}`} </SVersionNumber>
      </React.Fragment>
    );
  }
}

export default App;
