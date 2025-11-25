export * as Corti from "./api/index.js";
export { CortiError, CortiTimeoutError } from "./errors/index.js";
export * as serialization from "./serialization/index.js";
/**
 * Patch: use custom CortiClient instead of the generated one.
 */
export { CortiClient } from "./custom/CortiClient.js";
export { CortiEnvironment, CortiEnvironmentUrls } from "./environments.js";

/**
 * Patch: added new export to provide Authorization code flow support.
 */
export { Auth as CortiAuth } from "./custom/CortiAuth.js";
/**
 * Patch: added new exports to provide schema validation errors.
 */
export { JsonError } from "./core/schemas/builders/schema-utils/JsonError.js";
export { ParseError } from "./core/schemas/builders/schema-utils/ParseError.js";
/**
 * Patch: added new export to provide SDK-level error handling.
 */
export { CortiSDKError } from "./custom/CortiSDKError.js";
