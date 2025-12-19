import * as core from "../../core/index.js";
import * as environments from "../../environments.js";

export type Environment = CortiInternalEnvironment | string;
export type CortiInternalEnvironment = core.Supplier<environments.CortiEnvironment | environments.CortiEnvironmentUrls>;

export function getEnvironment(environment: Environment = "eu"): CortiInternalEnvironment {
    return typeof environment === "string"
        ? {
              base: `https://api.${environment}.corti.app/v2`,
              wss: `wss://api.${environment}.corti.app/audio-bridge/v2`,
              login: `https://auth.${environment}.corti.app/realms`,
              agents: `https://api.${environment}.corti.app`,
          }
        : environment;
}
