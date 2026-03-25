import { type FetchFunction, fetcherImpl } from "../core/fetcher/Fetcher.js";
import { getDefaultWithCredentials } from "./utils/withCredentialsConfig.js";

/** Patch: withCredentials - wrap fetcherImpl to inject global default when not passed per-request */
export const fetcher: FetchFunction = (args) =>
    fetcherImpl({ ...args, withCredentials: args.withCredentials ?? getDefaultWithCredentials() });
