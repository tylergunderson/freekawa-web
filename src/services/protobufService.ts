import protobuf from "protobufjs";
import {
    base64ToUint8Array,
    normalizeBase64String,
    uint8ArrayToBase64,
} from "../utils/base64";
import type { MessageType, ParseResult } from "../types/protobuf";

function bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

export function sanitizeProtobufBytes(u8: Uint8Array): Uint8Array {
    const bytes = u8;
    let i = 0;
    const out: number[] = [];
    const len = bytes.length;

    const readVarint = () => {
        let shift = 0;
        let val = 0;
        while (i < len) {
            const b = bytes[i++];
            val |= (b & 0x7f) << shift;
            if (!(b & 0x80)) break;
            shift += 7;
        }
        return val;
    };

    const writeVarint = (val: number) => {
        let v = val >>> 0;
        while (v >= 0x80) {
            out.push((v & 0x7f) | 0x80);
            v >>>= 7;
        }
        out.push(v & 0x7f);
    };

    const skipGroup = () => {
        while (i < len) {
            const key = readVarint();
            const wt = key & 7;
            if (wt === 0) {
                readVarint();
            } else if (wt === 1) {
                i += 8;
            } else if (wt === 2) {
                const l = readVarint();
                i += l;
            } else if (wt === 3) {
                skipGroup();
            } else if (wt === 4) {
                return;
            } else if (wt === 5) {
                i += 4;
            } else {
                return;
            }
        }
    };

    while (i < len) {
        const key = readVarint();
        const wt = key & 7;
        if (wt === 0) {
            const v = readVarint();
            writeVarint(key);
            writeVarint(v);
        } else if (wt === 1) {
            if (i + 8 > len) break;
            writeVarint(key);
            for (let j = 0; j < 8; j++) out.push(bytes[i++]);
        } else if (wt === 2) {
            const l = readVarint();
            if (i + l > len) break;
            writeVarint(key);
            writeVarint(l);
            for (let j = 0; j < l; j++) out.push(bytes[i++]);
        } else if (wt === 3) {
            skipGroup();
        } else if (wt === 4) {
            break;
        } else if (wt === 5) {
            if (i + 4 > len) break;
            writeVarint(key);
            for (let j = 0; j < 4; j++) out.push(bytes[i++]);
        } else {
            break;
        }
    }

    return new Uint8Array(out);
}

export function isLikelyProfileObject(obj: any): boolean {
    if (!obj || typeof obj !== "object") return false;
    const cp = obj.curve_points || obj.curvePoints;
    const ap = obj.annotations || obj.annotation;
    const mp = obj.meta_points || obj.metaPoints;
    const hasPoints =
        (Array.isArray(cp) && cp.length > 0) ||
        (Array.isArray(ap) && ap.length > 0) ||
        (Array.isArray(mp) && mp.length > 0);
    const hasName =
        Boolean(obj.profile_name) || Boolean(obj.profileName) || Boolean(obj.profile);
    return hasPoints || hasName;
}

export function tryDecodeProtobufBytes(
    messageType: NonNullable<MessageType>,
    u8: Uint8Array,
): any {
    try {
        const msg = messageType.decode(u8);
        const obj = messageType.toObject(msg, {
            longs: String,
            enums: String,
            bytes: String,
        });
        if (isLikelyProfileObject(obj)) return obj;
    } catch (err) {
        const emsg = String(err || "");
        if (emsg.includes("wire type 4") || emsg.includes("wire type 3")) {
            try {
                const sanitized = sanitizeProtobufBytes(u8);
                const msg = messageType.decode(sanitized);
                const obj = messageType.toObject(msg, {
                    longs: String,
                    enums: String,
                    bytes: String,
                });
                if (isLikelyProfileObject(obj)) return obj;
            } catch {
                // continue with other fallbacks
            }
        }

        const Reader = protobuf.Reader;
        const reader = Reader.create(u8);
        while (reader.pos < reader.len) {
            const tag = reader.uint32();
            const wireType = tag & 7;
            if (wireType === 2) {
                const l = reader.uint32();
                const start = reader.pos;
                const chunk = u8.slice(start, start + l);
                try {
                    const inner = messageType.decode(chunk);
                    const obj = messageType.toObject(inner, {
                        longs: String,
                        enums: String,
                        bytes: String,
                    });
                    if (isLikelyProfileObject(obj)) return obj;
                } catch {
                    // continue searching
                }
                reader.pos += l;
            } else if (wireType === 0) {
                reader.uint32();
            } else if (wireType === 1) {
                reader.skip(8);
            } else if (wireType === 5) {
                reader.skip(4);
            } else {
                break;
            }
        }

        try {
            const maxTruncate = Math.min(64, u8.length - 8);
            for (let t = 0; t <= maxTruncate; t++) {
                const slice = u8.slice(0, u8.length - t);
                try {
                    const msg2 = messageType.decode(slice);
                    const obj = messageType.toObject(msg2, {
                        longs: String,
                        enums: String,
                        bytes: String,
                    });
                    if (isLikelyProfileObject(obj)) return obj;
                } catch {
                    // ignore and continue
                }
            }
        } catch {
            // ignore truncation errors
        }

        try {
            const maxStart = Math.min(32, Math.max(0, u8.length - 8));
            for (let start = 0; start <= maxStart; start++) {
                const maxLen = Math.min(1024, u8.length - start);
                for (let len = 8; len <= maxLen; len++) {
                    const slice = u8.slice(start, start + len);
                    try {
                        const msg3 = messageType.decode(slice);
                        const obj = messageType.toObject(msg3, {
                            longs: String,
                            enums: String,
                            bytes: String,
                        });
                        if (isLikelyProfileObject(obj)) return obj;
                    } catch {
                        // continue
                    }
                }
            }
        } catch {
            // ignore
        }

        throw err;
    }

    throw new Error("Decoded message is not a likely profile object");
}

export function extractBase64Candidates(s: string): string[] {
    if (!s) return [];
    const out = s.trim();
    const candidates = new Set<string>();
    try {
        const u = new URL(out);
        if (u.search && u.search.length > 1) {
            candidates.add(u.search.slice(1));
            try {
                candidates.add(decodeURIComponent(u.search.slice(1)));
            } catch {
                // ignore decode errors
            }
        }
        const pathSeg = u.pathname.split("/").pop();
        if (pathSeg) candidates.add(pathSeg);
    } catch {
        // not a URL
    }

    const re = /[A-Za-z0-9_\-\+/=]{16,}/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(out))) {
        candidates.add(m[0]);
    }

    if (candidates.size === 0) {
        candidates.add(out);
        try {
            candidates.add(decodeURIComponent(out));
        } catch {
            // ignore
        }
    }

    return Array.from(candidates).sort((a, b) => b.length - a.length);
}

export function tryParseInputToObject(
    s: string,
    messageType: NonNullable<MessageType>,
    extractRoastMarkersFromGuessed: (obj: Record<string, unknown>) => any[],
): ParseResult {
    const candidates = extractBase64Candidates(s);
    let lastErr: unknown = null;
    for (const token of candidates) {
        const trials = new Set<string>();
        const t = token.trim();
        trials.add(t);
        trials.add(t.replace(/\s+/g, ""));
        trials.add(t.replace(/-/g, "+").replace(/_/g, "/"));
        trials.add(t.replace(/-/g, "+").replace(/_/g, "/").replace(/\s+/g, ""));
        trials.add(t.replace(/[^A-Za-z0-9+/=]/g, ""));
        trials.add(
            t
                .replace(/-/g, "+")
                .replace(/_/g, "/")
                .replace(/[^A-Za-z0-9+/=]/g, ""),
        );

        for (let trim = 0; trim <= 12; trim++) {
            let tt = t.slice(0, Math.max(0, t.length - trim));
            tt = tt.replace(/\s+/g, "");
            trials.add(tt);
            trials.add(tt + "=");
            trials.add(tt + "==");
            try {
                const dec = decodeURIComponent(tt);
                trials.add(dec);
                trials.add(dec.replace(/\s+/g, ""));
            } catch {
                // ignore
            }
        }

        for (const cand of Array.from(trials)) {
            if (!cand || cand.length < 8) continue;
            try {
                const normalized = normalizeBase64String(cand);
                const u8 = base64ToUint8Array(normalized);
                const obj = tryDecodeProtobufBytes(messageType, u8);
                const roastMarkers = extractRoastMarkersFromGuessed(obj);
                if (roastMarkers && roastMarkers.length) {
                    (obj as any).roast_markers = roastMarkers;
                }
                return {
                    obj,
                    normalizedB64: normalized,
                    rawCandidate: token,
                };
            } catch (err) {
                lastErr = err;
            }
        }
    }

    throw lastErr || new Error("Unable to parse input as Ikawa profile");
}

export function wireDecodeMessage(bytes: Uint8Array, depth = 0): Record<string, any> {
    const out: Record<string, any[]> = {};
    const len = bytes.length;
    let i = 0;

    const readVarint = () => {
        let shift = 0;
        let val = 0;
        while (i < len) {
            const b = bytes[i++];
            val |= (b & 0x7f) << shift;
            if (!(b & 0x80)) break;
            shift += 7;
        }
        return val;
    };

    while (i < len) {
        const key = readVarint();
        const field = key >> 3;
        const wt = key & 7;
        if (wt === 0) {
            const v = readVarint();
            out[field] = out[field] || [];
            out[field].push(v);
        } else if (wt === 1) {
            const v = bytes.slice(i, i + 8);
            i += 8;
            out[field] = out[field] || [];
            out[field].push({ _64bit: bytesToHex(v) });
        } else if (wt === 2) {
            const ln = readVarint();
            const chunk = bytes.slice(i, i + ln);
            i += ln;
            try {
                const s = new TextDecoder("utf-8").decode(chunk);
                out[field] = out[field] || [];
                out[field].push(s);
                if (chunk.length > 0 && [0, 1, 2, 5].includes(chunk[0] & 0x07)) {
                    try {
                        const nested = wireDecodeMessage(chunk, depth + 1);
                        out[`${field}_msg`] = out[`${field}_msg`] || [];
                        out[`${field}_msg`].push(nested);
                    } catch {
                        // ignore
                    }
                }
            } catch {
                out[field] = out[field] || [];
                out[field].push({ _bytes_b64: uint8ArrayToBase64(chunk) });
                if (chunk.length > 0 && [0, 1, 2, 5].includes(chunk[0] & 0x07)) {
                    try {
                        const nested = wireDecodeMessage(chunk, depth + 1);
                        out[`${field}_msg`] = out[`${field}_msg`] || [];
                        out[`${field}_msg`].push(nested);
                    } catch {
                        // ignore
                    }
                }
            }
        } else if (wt === 5) {
            const v = bytes.slice(i, i + 4);
            i += 4;
            out[field] = out[field] || [];
            out[field].push({ _32bit: bytesToHex(v) });
        } else if (wt === 4) {
            continue;
        } else {
            break;
        }
    }

    return out;
}

export function transformGuess(decoded: Record<string, any>): Record<string, any> {
    const FIELD_NAME_GUESSES: Record<number, string> = {
        1: "version",
        2: "device_token",
        3: "profile_name",
        4: "curve_points",
        5: "annotations",
        6: "flag",
        7: "meta_points",
        8: "metadata",
    };

    const g: Record<string, any> = {};
    for (const k0 of Object.keys(decoded)) {
        const k = k0.toString();
        if (k.endsWith("_msg")) {
            const base = Number(k.slice(0, -4));
            const name = (FIELD_NAME_GUESSES[base] || `field_${base}`) + "_nested";
            g[name] = decoded[k];
            continue;
        }
        const base = Number(k);
        const name = FIELD_NAME_GUESSES[base] || `field_${base}`;
        if ((base === 4 || base === 7) && decoded[`${base}_msg`]) {
            const nested = decoded[`${base}_msg`];
            const pts: Record<string, any>[] = [];
            for (const n of nested) {
                const pt: Record<string, any> = {};
                for (const nk of Object.keys(n)) {
                    const nv = n[nk];
                    pt[String(nk)] = Array.isArray(nv) ? nv[0] : nv;
                }
                pts.push(pt);
            }
            g[name + "_nested"] = pts;
            g[name] = pts.map((p) => ({ 1: p["1"], 2: p["2"] }));
            continue;
        }
        const v = decoded[k];
        if (Array.isArray(v) && v.length === 1) g[name] = v[0];
        else g[name] = v;
    }

    return g;
}
