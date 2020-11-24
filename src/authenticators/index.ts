import { IRpcAuthenticator } from "../helpers/types";
import { IAppState } from "../App";
import ethereum from "./ethereum";

export class MultiRpcAuthenticator implements IRpcAuthenticator {
  public authenticators: IRpcAuthenticator[];
  constructor(authenticators: IRpcAuthenticator[]) {
    this.authenticators = authenticators;
  }

  public filter(payload: any) {
    const authenticator = this.getAuthenticator(payload);
    return authenticator.filter(payload);
  }

  public router(payload: any, state: IAppState, setState: any) {
    const authenticator = this.getAuthenticator(payload);
    return authenticator.router(payload, state, setState);
  }

  public render(payload: any) {
    const authenticator = this.getAuthenticator(payload);
    return authenticator.render(payload);
  }

  public signer(payload: any, state: IAppState, setState: any) {
    const authenticator = this.getAuthenticator(payload);
    return authenticator.signer(payload, state, setState);
  }

  private getAuthenticator(payload: any) {
    const match = this.authenticators.filter(authenticator => authenticator.filter(payload));
    if (!match || !match.length) {
      throw new Error(`No RPC Authenticator found to handle payload with method ${payload.method}`);
    }
    return match[0];
  }
}

export function getRpcAuthenticators() {
  return [ethereum];
}
