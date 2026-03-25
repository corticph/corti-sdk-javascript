import { fromJson } from "../../core/json.js";
import * as serializers from "../../serialization/index.js";

/** Parses a raw WebSocket message and returns its type string, or null on failure. */
export function parseStreamResponseType(raw: string): string | null {
    const parsed = serializers.StreamSocketResponse.parse(fromJson(raw), {
        unrecognizedObjectKeys: "passthrough",
        allowUnrecognizedUnionMembers: true,
        allowUnrecognizedEnumValues: true,
        skipValidation: true,
        omitUndefined: true,
    });

    return parsed.ok ? (parsed.value.type as string) : null;
}
