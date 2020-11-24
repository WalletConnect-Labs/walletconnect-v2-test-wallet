import Store from "@pedrouid/iso-store";

import { WalletController, getWalletController } from "./wallet";

interface IAppControllers {
  store: Store;
  wallet: WalletController;
}

let controllers: IAppControllers | undefined;

export function setupAppControllers(): IAppControllers {
  const wallet = getWalletController();
  const store = new Store();
  controllers = { store, wallet };
  return controllers;
}

export function getAppControllers(): IAppControllers {
  let _controllers = controllers;
  if (!_controllers) {
    _controllers = setupAppControllers();
  }
  return _controllers;
}
