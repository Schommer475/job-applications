import {createContext} from "react";
import type {Column} from "./types.ts";

export default createContext<readonly Column<string>[] | null>(null);