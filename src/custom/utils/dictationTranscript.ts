import type { TranscribeTranscriptData } from "../../api/types/TranscribeTranscriptData.js";

export interface DictationTranscriptSnapshot {
    /** Finalized text. Use this for copy, clear, and JSON export. */
    committedText: string;
    /**
     * Active interim preview. Empty string when none.
     * Includes its leading boundary space so the UI can render it verbatim
     * immediately after committedText.
     */
    interimText: string;
    /** @internal */
    _finalizedStarts: ReadonlySet<number>;
    /** @internal */
    _latestFinalEnd: number;
}

const NO_SPACE_AFTER = new Set(["(", "[", "{", '"', "'", "\u2018", "\u201c"]);
const LEFT_ATTACH = new Set([",", ".", ":", ";", "!", "?", ")", "]", "}", "%"]);

/**
 * Returns the segment text prefixed with at most one space, applying
 * punctuation-aware boundary rules so callers never produce double-spaces
 * or spaces before attachment characters.
 */
function buildInsertion(committed: string, segment: string): string {
    if (!segment) return segment;

    const prevChar = committed.length > 0 ? committed[committed.length - 1] : "";
    const nextChar = segment[0] ?? "";

    const needsSpace =
        committed.length > 0 && !/\s/.test(prevChar) && !NO_SPACE_AFTER.has(prevChar) && !LEFT_ATTACH.has(nextChar);

    return needsSpace ? ` ${segment}` : segment;
}

/**
 * Pure function that applies a single transcript message to the previous
 * snapshot and returns a new snapshot with updated committed/interim text.
 *
 * - Handles the two-layer committed + interim model (DXG-844).
 * - Ignores late interims that overlap an already-finalized timeline (DXG-1093).
 *
 * @param previous - The last snapshot, or `undefined` on first call.
 * @param message  - The incoming transcript packet (subset of TranscribeTranscriptData).
 */
export function applyDictationTranscript(
    previous: DictationTranscriptSnapshot | undefined,
    message: Pick<TranscribeTranscriptData, "text" | "start" | "end" | "isFinal">,
): DictationTranscriptSnapshot {
    const committedText = previous?.committedText ?? "";
    const finalizedStarts = previous?._finalizedStarts ?? new Set<number>();
    const latestFinalEnd = previous?._latestFinalEnd ?? -Infinity;

    if (message.isFinal) {
        if (finalizedStarts.has(message.start)) {
            return {
                committedText,
                interimText: "",
                _finalizedStarts: finalizedStarts,
                _latestFinalEnd: latestFinalEnd,
            };
        }

        const nextFinalizedStarts = new Set(finalizedStarts);
        nextFinalizedStarts.add(message.start);

        const newCommitted = committedText + buildInsertion(committedText, message.text);

        return {
            committedText: newCommitted,
            interimText: "",
            _finalizedStarts: nextFinalizedStarts,
            _latestFinalEnd: Math.max(latestFinalEnd, message.end),
        };
    }

    // Interim path.
    if (finalizedStarts.has(message.start)) {
        return (
            previous ?? {
                committedText: "",
                interimText: "",
                _finalizedStarts: finalizedStarts,
                _latestFinalEnd: latestFinalEnd,
            }
        );
    }

    if (message.start < latestFinalEnd) {
        return (
            previous ?? {
                committedText: "",
                interimText: "",
                _finalizedStarts: finalizedStarts,
                _latestFinalEnd: latestFinalEnd,
            }
        );
    }

    return {
        committedText,
        interimText: buildInsertion(committedText, message.text),
        _finalizedStarts: finalizedStarts,
        _latestFinalEnd: latestFinalEnd,
    };
}
