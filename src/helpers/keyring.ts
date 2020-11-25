// @ts-ignore
import ed25519 from "bcrypto/lib/ed25519";
// @ts-ignore
import secp256k1 from "bcrypto/lib/secp256k1";
import bip39 from "bip39";
import { fromSeed, BIP32Interface } from "bip32";
import Store from "@pedrouid/iso-store";
import * as isoCrypto from "@pedrouid/iso-crypto";
import * as encUtils from "enc-utils";

import { KeyPair, KeyringOptions } from "./types";

export const MNEMONIC_STORE_KEY = "MNEMONIC";
export const DEFAULT_ENTROPY_LENGTH = 32;
export const DEFAULT_ELLIPTIC_CURVE = "secp256k1";

export class Keyring {
  public static generateMnemonic(length = DEFAULT_ENTROPY_LENGTH): string {
    const randomBytes = isoCrypto.randomBytes(length);
    if (randomBytes.length !== length) {
      throw Error(`Entropy has incorrect length`);
    }
    return bip39.entropyToMnemonic(encUtils.arrayToHex(randomBytes));
  }

  public static async deriveMasterKey(mnemonic: string): Promise<BIP32Interface> {
    if (!bip39.validateMnemonic(mnemonic)) {
      throw new Error("Invalid mnemonic provided!");
    }
    const seed = await bip39.mnemonicToSeed(mnemonic);
    return fromSeed(seed);
  }

  public static async init(opts: KeyringOptions): Promise<Keyring> {
    let mnemonic: string;
    if (typeof opts.mnemonic !== "undefined") {
      mnemonic = opts.mnemonic;
    } else {
      mnemonic =
        opts.mnemonic || (await opts.store.get(MNEMONIC_STORE_KEY)) || this.generateMnemonic();
    }
    await opts.store.set(MNEMONIC_STORE_KEY, mnemonic);
    const masterKey = await this.deriveMasterKey(mnemonic);
    return new Keyring(opts.store, masterKey);
  }

  constructor(public store: Store, public masterKey: BIP32Interface) {
    this.store = store;
    this.masterKey = masterKey;
  }

  public getPrivateKey(derivationPath: string): string {
    return this.derivePrivateKey(this.masterKey, derivationPath);
  }

  public getPublicKey(derivationPath: string, ellipticCurve = DEFAULT_ELLIPTIC_CURVE): string {
    const privateKey = this.derivePrivateKey(this.masterKey, derivationPath);
    return this.derivePublicKey(privateKey, ellipticCurve);
  }

  public getKeyPair(derivationPath: string, ellipticCurve = DEFAULT_ELLIPTIC_CURVE): KeyPair {
    const privateKey = this.derivePrivateKey(this.masterKey, derivationPath);
    const publicKey = this.derivePublicKey(privateKey, derivationPath);
    return { privateKey, publicKey };
  }

  // ---------- Private ----------------------------------------------- //

  private derivePrivateKey(masterKey: BIP32Interface, derivationPath: string): string {
    const hdnode = masterKey.derivePath(derivationPath);
    return encUtils.bufferToHex(hdnode.privateKey || Buffer.from([]));
  }
  private derivePublicKey(privateKey: string, ellipticCurve = DEFAULT_ELLIPTIC_CURVE): string {
    let publicKey: Buffer;
    switch (ellipticCurve) {
      case "ed25519":
        publicKey = ed25519.publicKeyCreate(encUtils.hexToBuffer(privateKey), true);
        break;
      case "secp256k1":
        publicKey = secp256k1.publicKeyCreate(encUtils.hexToBuffer(privateKey), true);
        break;
      default:
        throw new Error(`Elliptic curve not supported: ${ellipticCurve}`);
    }
    return encUtils.bufferToHex(publicKey);
  }
}
