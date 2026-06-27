import {createContext} from "react";
import type {Snapshot} from "./types.ts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default createContext<Snapshot<any> | null>(null);