export * as Corti from "./api/index.js";
export type { BaseClientOptions, BaseRequestOptions } from "./BaseClient.js";
/** Patch: Export custom client (auth object, auth getter returns CortiAuth). */
export { CortiClient } from "./custom/CortiClient.js";
/** Patch: Export custom auth client (real token endpoint, optional ctor auth). */
export { CortiAuth } from "./custom/CortiAuth.js";
export { CortiEnvironment, type CortiEnvironmentUrls } from "./environments.js";
/** Patch: Export environment utilities. */
export { getEnvironment, type Environment, type CortiInternalEnvironment } from "./custom/utils/environment.js";
/** Patch: Export token decode utility. */
export { decodeToken } from "./custom/utils/decodeToken.js";
/** Patch: Export PKCE helpers for browser-side code verifier/challenge generation. */
export { generateCodeVerifier, generateCodeChallenge } from "./custom/utils/pkceHelpers.js";
export { CortiError, CortiTimeoutError } from "./errors/index.js";
export * from "./exports.js";
export * as serialization from "./serialization/index.js";
