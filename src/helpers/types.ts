import { EventEmitter } from "events";

import { AppState } from "../App";

export interface RequestRenderParams {
  label: string;
  value: string;
}

export interface AppEvents {
  init: (state: AppState, setState: any) => Promise<void>;
  update: (state: AppState, setState: any) => Promise<void>;
}

export interface LogFn {
  /* tslint:disable:no-unnecessary-generics */
  <T extends object>(obj: T, msg?: string, ...args: any[]): void;
  (msg: string, ...args: any[]): void;
}

export type LogLevelDefault = "fatal" | "error" | "warn" | "info" | "debug" | "trace" | "silent";

export interface LogBindings {
  level?: LogLevel;
  [key: string]: any;
}

export type LogLevel = LogLevelDefault | string;

export interface LevelMapping {
  /**
   * Returns the mappings of level names to their respective internal number representation.
   */
  values: { [level: string]: number };
  /**
   * Returns the mappings of level internal level numbers to their string representations.
   */
  labels: { [level: number]: string };
}

export interface BaseLogger extends EventEmitter {
  logBindings: LogBindings;
  level: LogLevel;
  levels: LevelMapping;
  levelVal: number;

  bindings(): LogBindings;
  child(bindings: LogBindings): BaseLogger;

  fatal: LogFn;
  error: LogFn;
  warn: LogFn;
  info: LogFn;
  debug: LogFn;
  trace: LogFn;
  silent: LogFn;
}
