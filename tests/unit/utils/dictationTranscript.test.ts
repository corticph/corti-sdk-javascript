import {
    applyDictationTranscript,
    type DictationTranscriptSnapshot,
} from "../../../src/custom/utils/dictationTranscript";

type Msg = Parameters<typeof applyDictationTranscript>[1];

function msg(overrides: Partial<Msg> & { text: string }): Msg {
    return { start: 0, end: 1, isFinal: false, ...overrides };
}

function apply(
    prev: DictationTranscriptSnapshot | undefined,
    overrides: Partial<Msg> & { text: string },
): DictationTranscriptSnapshot {
    return applyDictationTranscript(prev, msg(overrides));
}

// ---------------------------------------------------------------------------
// buildInsertion / spacing
// ---------------------------------------------------------------------------

describe("buildInsertion — punctuation-aware spacing", () => {
    interface SpacingCase {
        description: string;
        committedText: string;
        segmentText: string;
        wantInterimText: string;
    }

    const cases: SpacingCase[] = [
        {
            description: "no space when committed is empty",
            committedText: "",
            segmentText: "hello",
            wantInterimText: "hello",
        },
        {
            description: "space added between two normal words",
            committedText: "hello",
            segmentText: "world",
            wantInterimText: " world",
        },
        {
            description: "no space when previous char is a space",
            committedText: "hello ",
            segmentText: "world",
            wantInterimText: "world",
        },
        {
            description: "no space after open paren",
            committedText: "see (",
            segmentText: "fig",
            wantInterimText: "fig",
        },
        {
            description: "no space after open bracket",
            committedText: "items [",
            segmentText: "one",
            wantInterimText: "one",
        },
        {
            description: "no space after open brace",
            committedText: "map {",
            segmentText: "key",
            wantInterimText: "key",
        },
        {
            description: "no space after straight double quote",
            committedText: 'say "',
            segmentText: "hello",
            wantInterimText: "hello",
        },
        {
            description: "no space after curly open quote",
            committedText: "say \u201c",
            segmentText: "hello",
            wantInterimText: "hello",
        },
        {
            description: "no space before comma",
            committedText: "hello",
            segmentText: ",",
            wantInterimText: ",",
        },
        {
            description: "no space before period",
            committedText: "hello",
            segmentText: ".",
            wantInterimText: ".",
        },
        {
            description: "no space before colon",
            committedText: "hello",
            segmentText: ":",
            wantInterimText: ":",
        },
        {
            description: "no space before semicolon",
            committedText: "hello",
            segmentText: ";",
            wantInterimText: ";",
        },
        {
            description: "no space before exclamation mark",
            committedText: "hello",
            segmentText: "!",
            wantInterimText: "!",
        },
        {
            description: "no space before question mark",
            committedText: "hello",
            segmentText: "?",
            wantInterimText: "?",
        },
        {
            description: "no space before close paren",
            committedText: "hello",
            segmentText: ")",
            wantInterimText: ")",
        },
        {
            description: "no space before percent",
            committedText: "50",
            segmentText: "%",
            wantInterimText: "%",
        },
        {
            description: "space added after colon before normal word",
            committedText: "note:",
            segmentText: "important",
            wantInterimText: " important",
        },
    ];

    test.each(cases)("$description", ({ committedText, segmentText, wantInterimText }) => {
        const snap = apply(
            committedText
                ? ({
                      committedText,
                      interimText: "",
                      _finalizedStarts: new Set(),
                      _latestFinalEnd: -Infinity,
                  } as DictationTranscriptSnapshot)
                : undefined,
            { text: segmentText, start: 100, end: 101, isFinal: false },
        );
        expect(snap.interimText).toBe(wantInterimText);
    });
});

// ---------------------------------------------------------------------------
// Interim → Final lifecycle
// ---------------------------------------------------------------------------

describe("interim → final lifecycle", () => {
    it("interim sets interimText, does not change committedText", () => {
        const snap = apply(undefined, { text: "hello", start: 0, end: 1, isFinal: false });
        expect(snap.committedText).toBe("");
        expect(snap.interimText).toBe("hello");
    });

    it("final appends to committedText and clears interimText", () => {
        const s1 = apply(undefined, { text: "hello", start: 0, end: 1, isFinal: false });
        const s2 = apply(s1, { text: "hello", start: 0, end: 1, isFinal: true });
        expect(s2.committedText).toBe("hello");
        expect(s2.interimText).toBe("");
    });

    it("subsequent final appends with correct spacing", () => {
        const s1 = apply(undefined, { text: "hello", start: 0, end: 1, isFinal: true });
        const s2 = apply(s1, { text: "world", start: 1, end: 2, isFinal: true });
        expect(s2.committedText).toBe("hello world");
        expect(s2.interimText).toBe("");
    });

    it("new interim after a final includes leading space", () => {
        const s1 = apply(undefined, { text: "hello", start: 0, end: 1, isFinal: true });
        const s2 = apply(s1, { text: "world", start: 1, end: 2, isFinal: false });
        expect(s2.interimText).toBe(" world");
        expect(s2.committedText).toBe("hello");
    });

    it("two interims — only latest survives", () => {
        const s1 = apply(undefined, { text: "firs", start: 0, end: 1, isFinal: false });
        const s2 = apply(s1, { text: "first", start: 0, end: 1, isFinal: false });
        expect(s2.interimText).toBe("first");
    });
});

// ---------------------------------------------------------------------------
// Race condition guards
// ---------------------------------------------------------------------------

describe("race condition guards", () => {
    it("R2: interim for already-finalized start → snapshot unchanged", () => {
        const s1 = apply(undefined, { text: "hello", start: 0, end: 1, isFinal: true });
        const s2 = apply(s1, { text: "GHOST", start: 0, end: 1, isFinal: false });
        expect(s2).toBe(s1); // exact same reference
    });

    it("R-cross: late interim with start < latestFinalEnd → snapshot unchanged", () => {
        // Segment [0,5] finalized; then an interim arrives with start=3 (overlaps)
        const s1 = apply(undefined, { text: "hello world", start: 0, end: 5, isFinal: true });
        const s2 = apply(s1, { text: "GHOST", start: 3, end: 4, isFinal: false });
        expect(s2).toBe(s1);
    });

    it("R5: duplicate final same start → no double-append, interimText cleared", () => {
        const s1 = apply(undefined, { text: "hello", start: 0, end: 1, isFinal: true });
        // A second interim slips in
        const s2 = apply(s1, { text: "hell", start: 0, end: 1, isFinal: false });
        // Then the duplicate final arrives
        const s3 = apply(s2, { text: "hello", start: 0, end: 1, isFinal: true });
        expect(s3.committedText).toBe("hello"); // not "hello hello"
        expect(s3.interimText).toBe("");
    });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

describe("edge cases", () => {
    it("first call with undefined previous and a final packet", () => {
        const snap = apply(undefined, { text: "hi", start: 0, end: 1, isFinal: true });
        expect(snap.committedText).toBe("hi");
        expect(snap.interimText).toBe("");
    });

    it("empty text segment produces empty interimText", () => {
        const snap = apply(undefined, { text: "", start: 0, end: 1, isFinal: false });
        expect(snap.interimText).toBe("");
    });

    it("non-overlapping interim after separate finalized span is allowed", () => {
        const s1 = apply(undefined, { text: "hello", start: 0, end: 2, isFinal: true });
        // start=3 is NOT < latestFinalEnd=2, and not in finalizedStarts → allowed
        const s2 = apply(s1, { text: "world", start: 3, end: 4, isFinal: false });
        expect(s2.interimText).toBe(" world");
    });
});
