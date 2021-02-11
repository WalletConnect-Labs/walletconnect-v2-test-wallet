import * as React from "react";
import styled from "styled-components";
import KeyValueStorage from "keyvaluestorage";
import Wallet from "caip-wallet";
import Client, { CLIENT_EVENTS } from "@walletconnect/client";
import {
  isJsonRpcRequest,
  JsonRpcResponse,
  formatJsonRpcError,
  JsonRpcRequest,
  formatJsonRpcRequest,
} from "@json-rpc-tools/utils";
import { getSessionMetadata } from "@walletconnect/utils";
import { SessionTypes } from "@walletconnect/types";

import Card from "./components/Card";
import DefaultDisplay from "./components/DefaultDisplay";
import RequestDisplay from "./components/RequestDisplay";
import ProposalDisplay from "./components/ProposalDisplay";
import QRCodeScanner, { QRCodeValidateResponse } from "./components/QRCodeScanner";

import {
  DEFAULT_APP_METADATA,
  DEFAULT_CHAINS,
  DEFAULT_METHODS,
  DEFAULT_RELAY_PROVIDER,
} from "./constants";
import { Cards, isProposalCard, isRequestCard, isSessionCard } from "./helpers";
import SessionDisplay from "./components/SessionDisplay";

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

export interface AppState {
  client: Client | undefined;
  storage: KeyValueStorage | undefined;
  wallet: Wallet | undefined;
  loading: boolean;
  scanner: boolean;
  chains: string[];
  accounts: string[];
  sessions: SessionTypes.Created[];
  requests: SessionTypes.PayloadEvent[];
  results: any[];
  card: Cards.All;
}

export const INITIAL_STATE: AppState = {
  client: undefined,
  storage: undefined,
  wallet: undefined,
  loading: false,
  scanner: false,
  chains: DEFAULT_CHAINS,
  accounts: [],
  sessions: [],
  requests: [],
  results: [],
  card: { type: "default", data: {} },
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
      const wallet = await Wallet.init({ chains: this.state.chains, storage });
      const client = await Client.init({
        relayProvider: DEFAULT_RELAY_PROVIDER,
        logger: "debug",
        storage,
      });
      const accounts = (
        await Promise.all<string[]>(this.state.chains.map((chainId) => wallet.getAccounts(chainId)))
      ).flat();
      this.setState({ loading: false, storage, client, wallet, accounts });
      this.subscribeToEvents();
      await this.checkPersistedState();
    } catch (e) {
      this.setState({ loading: false });
      throw e;
    }
  };

  public approveSession = async (proposal: SessionTypes.Proposal) => {
    console.log("ACTION", "approveSession");
    if (typeof this.state.client === "undefined") {
      throw new Error("WalletConnect is not initialized");
    }
    if (typeof this.state.accounts === "undefined") {
      throw new Error("Accounts is undefined");
    }
    const accounts = this.state.accounts.filter((account) => {
      const chainId = account.split("@")[1];
      return proposal.permissions.blockchain.chains.includes(chainId);
    });
    const response = {
      state: { accounts },
      metadata: getSessionMetadata() || DEFAULT_APP_METADATA,
    };
    const session = await this.state.client.approve({ proposal, response });
    this.resetCard();
    this.setState({ session });
  };

  public rejectSession = async (proposal: SessionTypes.Proposal) => {
    console.log("ACTION", "rejectSession");
    if (typeof this.state.client === "undefined") {
      throw new Error("WalletConnect is not initialized");
    }
    await this.state.client.reject({ proposal });
    this.resetCard();
  };

  public disconnect = async (topic: string) => {
    console.log("ACTION", "disconnect");
    if (typeof this.state.client === "undefined") {
      throw new Error("WalletConnect is not initialized");
    }
    await this.state.client.disconnect({
      topic,
      reason: "User disconnected session",
    });
    await this.resetCard();
  };

  public resetApp = async () => {
    const { storage, client, wallet, accounts } = this.state;
    this.setState({ ...INITIAL_STATE, storage, client, wallet, accounts });
  };

  public subscribeToEvents = () => {
    console.log("ACTION", "subscribeToEvents");

    if (typeof this.state.client === "undefined") {
      throw new Error("WalletConnect is not initialized");
    }

    this.state.client.on(CLIENT_EVENTS.session.proposal, (proposal: SessionTypes.Proposal) => {
      if (typeof this.state.client === "undefined") {
        throw new Error("WalletConnect is not initialized");
      }
      console.log("EVENT", "session_proposal");
      const unsupportedChains = [];
      proposal.permissions.blockchain.chains.forEach((chainId) => {
        if (this.state.chains.includes(chainId)) return;
        unsupportedChains.push(chainId);
      });
      if (unsupportedChains.length) {
        return this.state.client.reject({ proposal });
      }
      const unsupportedMethods = [];
      proposal.permissions.jsonrpc.methods.forEach((method) => {
        if (DEFAULT_METHODS.includes(method)) return;
        unsupportedMethods.push(method);
      });
      if (unsupportedMethods.length) {
        return this.state.client.reject({ proposal });
      }
      this.openProposal(proposal);
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
          const chainId = payloadEvent.chainId || this.state.chains[0];
          try {
            // TODO: needs improvement
            const requiresApproval = this.state.wallet.auth[chainId].assert(payloadEvent.payload);
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
      this.setState({ sessions: this.state.sessions.values });
    });

    this.state.client.on(CLIENT_EVENTS.session.deleted, () => {
      console.log("EVENT", "session_deleted");
      this.setState({ sessions: this.state.sessions.values });
    });
  };

  public checkPersistedState = async () => {
    if (typeof this.state.client === "undefined") {
      throw new Error("WalletConnect is not initialized");
    }
    const requests = this.state.client.session.history.values
      .map((record) => {
        if (typeof record.response !== "undefined") return undefined;
        const request: SessionTypes.PayloadEvent = {
          topic: record.topic,
          payload: formatJsonRpcRequest(record.request.method, record.request.params, record.id),
          chainId: record.chainId,
        };
        return request;
      })
      .filter((x) => typeof x !== "undefined");
    console.log(requests);
    const sessions = this.state.client.session.values;
    this.setState({ sessions, requests });
  };

  public openScanner = () => {
    console.log("ACTION", "openScanner");
    this.setState({ scanner: true });
  };

  public closeScanner = () => {
    console.log("ACTION", "closeScanner");
    this.setState({ scanner: false });
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
    this.closeScanner();
  };

  public onURI = async (data: any) => {
    const uri = typeof data === "string" ? data : "";
    if (!uri) return;
    if (typeof this.state.client === "undefined") {
      throw new Error("WalletConnect is not initialized");
    }
    await this.state.client.pair({ uri });
  };

  public onQRCodeError = (error: Error) => {
    throw error;
  };

  public onQRCodeClose = () => this.closeScanner();

  public openCard = (card: Cards.All) => this.setState({ card });

  public resetCard = () => this.setState({ card: INITIAL_STATE.card });

  public openProposal = (proposal: SessionTypes.Proposal) =>
    this.openCard({ type: "proposal", data: { proposal } });

  public openSession = (session: SessionTypes.Created) =>
    this.openCard({ type: "session", data: { session } });

  public openRequest = async (request: SessionTypes.PayloadEvent) => {
    if (typeof this.state.client === "undefined") {
      throw new Error("WalletConnect is not initialized");
    }
    const { peer } = await this.state.client.session.get(request.topic);
    this.openCard({ type: "request", data: { request, peer } });
  };

  public removeFromPending = async (request: SessionTypes.PayloadEvent) => {
    this.setState({
      requests: this.state.requests.filter((x) => x.payload.id !== request.payload.id),
    });
  };

  public respondRequest = async (topic: string, response: JsonRpcResponse) => {
    if (typeof this.state.client === "undefined") {
      throw new Error("WalletConnect is not initialized");
    }
    await this.state.client.respond({ topic, response });
  };

  public approveRequest = async (request: SessionTypes.PayloadEvent) => {
    if (typeof this.state.client === "undefined") {
      throw new Error("WalletConnect is not initialized");
    }
    try {
      if (typeof this.state.wallet === "undefined") {
        throw new Error("Wallet is not initialized");
      }
      const chainId = request.chainId || this.state.chains[0];
      const response = await this.state.wallet.approve(request.payload as any, chainId);
      this.state.client.respond({
        topic: request.topic,
        response,
      });
    } catch (error) {
      console.error(error);
      this.state.client.respond({
        topic: request.topic,
        response: formatJsonRpcError(request.payload.id, "Failed or Rejected Request"),
      });
    }

    await this.removeFromPending(request);
    await this.resetCard();
  };

  public rejectRequest = async (request: SessionTypes.PayloadEvent) => {
    if (typeof this.state.client === "undefined") {
      throw new Error("WalletConnect is not initialized");
    }
    this.state.client.respond({
      topic: request.topic,
      response: formatJsonRpcError(request.payload.id, "Failed or Rejected Request"),
    });
    await this.removeFromPending(request);
    await this.resetCard();
  };

  public renderCard = () => {
    const { accounts, sessions, chains, requests, card } = this.state;
    let content: JSX.Element | undefined;
    if (isProposalCard(card)) {
      const { proposal } = card.data;
      content = (
        <ProposalDisplay
          proposal={proposal}
          approveSession={this.approveSession}
          rejectSession={this.rejectSession}
        />
      );
    } else if (isRequestCard(card)) {
      const { request, peer } = card.data;
      content = (
        <RequestDisplay
          chainId={request.chainId || chains[0]}
          request={request.payload as JsonRpcRequest}
          peerMeta={peer.metadata}
          approveRequest={this.approveRequest}
          rejectRequest={this.rejectRequest}
        />
      );
    } else if (isSessionCard(card)) {
      const { session } = card.data;
      content = (
        <SessionDisplay session={session} resetCard={this.resetCard} disconnect={this.disconnect} />
      );
    } else {
      content = (
        <DefaultDisplay
          accounts={accounts}
          sessions={sessions}
          requests={requests}
          openSession={this.openSession}
          openRequest={this.openRequest}
          openScanner={this.openScanner}
          onURI={this.onURI}
        />
      );
    }
    return <Card>{content}</Card>;
  };

  public render() {
    const { loading, scanner } = this.state;
    return (
      <React.Fragment>
        <SContainer>
          <SContent>{loading ? "Loading..." : this.renderCard()}</SContent>
          {scanner && (
            <QRCodeScanner
              onValidate={this.onQRCodeValidate}
              onScan={this.onQRCodeScan}
              onError={this.onQRCodeError}
              onClose={this.onQRCodeClose}
            />
          )}
        </SContainer>
        <SVersionNumber>{`v${process.env.REACT_APP_VERSION || "2.0.0-alpha"}`}</SVersionNumber>
      </React.Fragment>
    );
  }
}

export default App;
