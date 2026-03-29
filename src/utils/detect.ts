import { normalizePoints } from "./points";

export function isProLikeProfile(p: any): boolean {
    if (!p) return false;
    const curve = normalizePoints(p.curve_points || p.curvePoints || []);
    const ann = normalizePoints(p.annotations || p.annotation || []);
    const first = curve[0];
    if (!first) return false;
    if (curve.length > 7) return true;
    if (ann.length > 3) return true;
    if (Number(first.x) !== 0) return true;
    if (Number(first.y) !== 500) return true;
    return false;
}
