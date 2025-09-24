import * as core from "../../core/index.js";
import * as environments from "../../environments.js";

type Environment = core.Supplier<environments.CortiEnvironment | environments.CortiEnvironmentUrls> | string;
type CortiEnvironment = core.Supplier<environments.CortiEnvironment | environments.CortiEnvironmentUrls>;

export function getEnvironment(environment: Environment): CortiEnvironment {
    return typeof environment === "string"
        ? {
            base: `https://api.${environment}.corti.app/v2`,
            wss: `wss://api.${environment}.corti.app`,
            login: `https://auth.${environment}.corti.app/realms`,
            agents: `https://agents.${environment}.corti.app/agents`,
        }
        : environment;
}
