export * as Corti from "./api/index.js";
/**
 * Patch: added new exports to provide schema validation errors.
 */
export { JsonError } from "./core/schemas/builders/schema-utils/JsonError.js";
export { ParseError } from "./core/schemas/builders/schema-utils/ParseError.js";
/**
 * Patch: added new export to provide Authorization code flow support.
 */
export { Auth as CortiAuth } from "./custom/CortiAuth.js";
/**
 * Patch: use custom CortiClient instead of the generated one.
 */
export { CortiClient } from "./custom/CortiClient.js";
export { CortiEnvironment, type CortiEnvironmentUrls } from "./environments.js";
export { CortiError, CortiTimeoutError } from "./errors/index.js";
export * as serialization from "./serialization/index.js";
