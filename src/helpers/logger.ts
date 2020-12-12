import { EventEmitter } from "events";

import { LevelMapping, BaseLogger, LogBindings } from "./types";

const levels: LevelMapping = {
  values: {
    fatal: 600,
    error: 500,
    warn: 400,
    info: 300,
    debug: 200,
    trace: 100,
    silent: 0,
  },
  labels: {
    [600]: "fatal",
    [500]: "error",
    [400]: "warn",
    [300]: "info",
    [200]: "debug",
    [100]: "trace",
    [0]: "silent",
  },
};

const defaultLogBindings = { level: "debug" };

export class Logger extends EventEmitter implements BaseLogger {
  public logBindings: LogBindings;
  public levels = levels;
  constructor(bindings?: LogBindings) {
    super();
    this.logBindings =
      typeof bindings === "undefined"
        ? defaultLogBindings
        : { ...bindings, level: bindings.level || defaultLogBindings.level };
  }

  get level(): string {
    return this.logBindings.level || "info";
  }

  get levelVal(): number {
    return this.getLevelVal(this.level);
  }
  public bindings(): LogBindings {
    return this.logBindings;
  }
  public child(bindings: LogBindings): Logger {
    return new Logger({ ...this.bindings(), ...bindings });
  }

  public fatal(data: string | object, ...args: any[]): void {
    this.log("fatal", data);
  }

  public error(data: string | object, ...args: any[]): void {
    this.log("error", data);
  }
  public warn(data: string | object, ...args: any[]): void {
    this.log("warn", data);
  }
  public info(data: string | object, ...args: any[]): void {
    this.log("info", data);
  }
  public debug(data: string | object, ...args: any[]): void {
    this.log("debug", data);
  }
  public trace(data: string | object, ...args: any[]): void {
    this.log("trace", data);
  }
  public silent(data: string | object, ...args: any[]): void {
    this.log("silent", data);
  }

  // ---------- Private ----------------------------------------------- //

  private getLevelVal(level: string): number {
    return this.levels.values[level];
  }

  private log(level: string, data: string | object) {
    if (this.getLevelVal(level) >= this.levelVal) {
      console.log(
        `[${level.toUpperCase()}]`,
        typeof data === "string" ? data : JSON.stringify(data, null, 2),
      );
    }
  }
}
