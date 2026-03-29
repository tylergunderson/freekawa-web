import type { Point } from "../types/profile";

export function rdp(points: Point[], epsilon: number): Point[] {
    if (!Array.isArray(points) || points.length <= 2) return points || [];
    const first = points[0];
    const last = points[points.length - 1];
    let index = -1;
    let distMax = 0;
    const x1 = first.x;
    const y1 = first.y;
    const x2 = last.x;
    const y2 = last.y;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const denom = dx * dx + dy * dy || 1;
    for (let i = 1; i < points.length - 1; i++) {
        const p = points[i];
        const t = ((p.x - x1) * dx + (p.y - y1) * dy) / denom;
        const projX = x1 + t * dx;
        const projY = y1 + t * dy;
        const dist = Math.hypot(p.x - projX, p.y - projY);
        if (dist > distMax) {
            distMax = dist;
            index = i;
        }
    }
    if (distMax > epsilon && index !== -1) {
        const left = rdp(points.slice(0, index + 1), epsilon);
        const right = rdp(points.slice(index), epsilon);
        return left.slice(0, -1).concat(right);
    }
    return [first, last];
}

export function downsampleCurvePoints(points: Point[], maxPoints: number): Point[] {
    if (!Array.isArray(points)) return [];
    if (points.length <= maxPoints) return points;
    let low = 0;
    let high = 5000;
    let best = points;
    for (let i = 0; i < 16; i++) {
        const mid = (low + high) / 2;
        const res = rdp(points, mid);
        if (res.length <= maxPoints) {
            best = res;
            high = mid;
        } else {
            low = mid;
        }
    }
    let out = best.length <= maxPoints ? best : best.slice(0, maxPoints);
    if (out.length < maxPoints) {
        const used = new Set(out.map((p) => `${p.x}:${p.y}`));
        const scored: { p: Point; dist: number }[] = [];
        for (let i = 1; i < points.length - 1; i++) {
            const p = points[i];
            const key = `${p.x}:${p.y}`;
            if (used.has(key)) continue;
            const a = points[i - 1];
            const b = points[i + 1];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const denom = dx * dx + dy * dy || 1;
            const t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / denom;
            const projX = a.x + t * dx;
            const projY = a.y + t * dy;
            const dist = Math.hypot(p.x - projX, p.y - projY);
            scored.push({ p, dist });
        }
        scored.sort((a, b) => b.dist - a.dist);
        for (const s of scored) {
            if (out.length >= maxPoints) break;
            out = out.concat([s.p]);
            used.add(`${s.p.x}:${s.p.y}`);
        }
        out = out.sort((a, b) => a.x - b.x);
    }
    return out;
}

export function downsampleAirflow(points: Point[], maxPoints: number): Point[] {
    if (!Array.isArray(points) || points.length <= maxPoints) return points || [];
    const first = points[0];
    const last = points[points.length - 1];
    if (maxPoints <= 2) return [first, last];
    let best: Point | null = null;
    let bestDist = -1;
    const dx = last.x - first.x;
    const dy = last.y - first.y;
    const denom = dx * dx + dy * dy || 1;
    for (let i = 1; i < points.length - 1; i++) {
        const p = points[i];
        const t = ((p.x - first.x) * dx + (p.y - first.y) * dy) / denom;
        const projX = first.x + t * dx;
        const projY = first.y + t * dy;
        const dist = Math.hypot(p.x - projX, p.y - projY);
        if (dist > bestDist) {
            bestDist = dist;
            best = p;
        }
    }
    if (!best) return [first, last];
    return [first, best, last].sort((a, b) => a.x - b.x);
}
