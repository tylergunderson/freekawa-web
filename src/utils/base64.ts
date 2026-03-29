export function normalizeBase64String(s: string): string {
    if (!s) return s;
    let out = s.trim();
    const q = out.lastIndexOf("?");
    if (q !== -1) out = out.slice(q + 1);
    out = out.replace(/-/g, "+").replace(/_/g, "/");
    out = out.replace(/[^A-Za-z0-9+/=]/g, "");
    while (out.length % 4 !== 0) out += "=";
    return out;
}

export function base64ToUint8Array(b64: string): Uint8Array {
    const normalized = normalizeBase64String(b64);
    const bin = atob(normalized);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return arr;
}

export function uint8ArrayToBase64(u8: Uint8Array): string {
    let s = "";
    for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
    return btoa(s);
}
