/**
 * Custom Agentic client (src/api/resources/agentic/client/Client.ts).
 *
 * Extends the auto-generated AgenticClient so nested agents uses CustomAgenticAgents.
 */

import { AgenticClient } from "../../api/resources/agentic/client/Client.js";
import { CustomAgenticAgents } from "./CustomAgenticAgents.js";

export class CustomAgentic extends AgenticClient {
    protected override _agents: CustomAgenticAgents | undefined;

    public override get agents(): CustomAgenticAgents {
        return (this._agents ??= new CustomAgenticAgents(this._options));
    }
}
