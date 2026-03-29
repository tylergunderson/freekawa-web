export function generateDeviceToken(): string {
    const bytes = new Uint8Array(16);
    if (window.crypto && window.crypto.getRandomValues) {
        window.crypto.getRandomValues(bytes);
    } else {
        for (let i = 0; i < bytes.length; i++) {
            bytes[i] = Math.floor(Math.random() * 256);
        }
    }
    let s = "";
    for (let i = 0; i < bytes.length; i++) {
        s += String.fromCharCode(bytes[i]);
    }
    return btoa(s);
}
