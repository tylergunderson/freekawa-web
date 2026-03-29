import type { Type } from "protobufjs";

export interface ParseResult {
    obj: Record<string, unknown>;
    normalizedB64: string;
    rawCandidate: string;
}

export type MessageType = Type | null;
