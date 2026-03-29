import { useEffect } from "react";
import { base64ToUint8Array, normalizeBase64String } from "../utils/base64";
import {
    transformGuess,
    tryDecodeProtobufBytes,
    wireDecodeMessage,
} from "../services/protobufService";
import type { MessageType } from "../types/protobuf";

interface UseProfileParserArgs {
    base64In: string;
    messageType: MessageType;
    setBase64Valid: (v: boolean) => void;
    setDecodeError: (v: string | null) => void;
    setWireFallbackAvailable: (v: boolean) => void;
    setWireFallbackGuess: (
        v: { guessed: Record<string, unknown>; normalized: string } | null,
    ) => void;
}

export function useProfileParser({
    base64In,
    messageType,
    setBase64Valid,
    setDecodeError,
    setWireFallbackAvailable,
    setWireFallbackGuess,
}: UseProfileParserArgs): void {
    useEffect(() => {
        const s = base64In || "";
        if (!s.trim()) {
            setBase64Valid(false);
            setDecodeError(null);
            return;
        }
        try {
            const u8 = base64ToUint8Array(s);
            if (!u8 || u8.length === 0) {
                setBase64Valid(false);
                setDecodeError("No bytes found after normalizing input");
                return;
            }
            if (!messageType) {
                setBase64Valid(true);
                setDecodeError("Schema not loaded yet — ready when schema loads");
                return;
            }

            try {
                tryDecodeProtobufBytes(messageType, u8);
                setBase64Valid(true);
                setDecodeError(null);
            } catch (e) {
                setBase64Valid(false);
                setDecodeError(String(e));
                try {
                    const normalized = normalizeBase64String(s);
                    const bytes = base64ToUint8Array(normalized);
                    const decoded = wireDecodeMessage(bytes);
                    const guessed = transformGuess(decoded);
                    setWireFallbackAvailable(true);
                    setWireFallbackGuess({ guessed, normalized });
                } catch {
                    setWireFallbackAvailable(false);
                    setWireFallbackGuess(null);
                }
            }
        } catch (e) {
            setBase64Valid(false);
            setDecodeError(String(e));
        }
    }, [
        base64In,
        messageType,
        setBase64Valid,
        setDecodeError,
        setWireFallbackAvailable,
        setWireFallbackGuess,
    ]);
}
