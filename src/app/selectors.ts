export function selectProfileDirty(
    profile: Record<string, any> | null,
    lastParsedSnapshot: string | null,
): boolean {
    if (!profile) return false;
    if (!lastParsedSnapshot) return true;
    try {
        return JSON.stringify(profile) !== lastParsedSnapshot;
    } catch {
        return true;
    }
}

export function selectTempUnitLabel(tempUnit: "C" | "F"): "\u00b0C" | "\u00b0F" {
    return tempUnit === "C" ? "\u00b0C" : "\u00b0F";
}

export function selectMenuOpen(menuAnchorEl: HTMLElement | null): boolean {
    return Boolean(menuAnchorEl);
}
