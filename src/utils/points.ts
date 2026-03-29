import type { Point } from "../types/profile";

export function normalizePoints(points: unknown): Point[] {
    if (!Array.isArray(points) || points.length === 0) return [];
    return points.map((pt: any) => {
        if (pt?.x !== undefined && pt?.y !== undefined) {
            return { x: Number(pt.x), y: Number(pt.y) };
        }
        if (pt?.["1"] !== undefined || pt?.["2"] !== undefined) {
            return {
                x: Number(pt["1"] ?? 0),
                y: Number(pt["2"] ?? 0),
            };
        }
        if (Array.isArray(pt?.["1"]) || Array.isArray(pt?.["2"])) {
            return {
                x: Number(pt["1"]?.[0] ?? 0),
                y: Number(pt["2"]?.[0] ?? 0),
            };
        }
        return { x: 0, y: 0 };
    });
}

export function calculateMetaPoints(curvePoints: Point[]): Point[] {
    if (!curvePoints || curvePoints.length === 0) return [];
    const lastPoint = curvePoints[curvePoints.length - 1];
    const lastTime = Number(lastPoint.x || 0);
    const META_POINT_RATIO = 1.22;
    const META_POINT_Y_VALUE = 200;
    return [
        {
            x: Math.round(lastTime * META_POINT_RATIO),
            y: META_POINT_Y_VALUE,
        },
    ];
}

export function clampMetaPoints(
    metaPoints: Point[],
    maxRawX: number,
    lastCurveX: number,
    minCooldownRaw: number,
    enforceMin: boolean,
    minMetaY: number,
    maxMetaY: number,
    maxCooldownRaw: number,
): Point[] {
    if (!Array.isArray(metaPoints)) return [];
    const minX =
        enforceMin &&
        Number.isFinite(lastCurveX) &&
        Number.isFinite(minCooldownRaw)
            ? Math.max(0, lastCurveX + minCooldownRaw)
            : 0;
    const maxX =
        Number.isFinite(lastCurveX) &&
        Number.isFinite(maxRawX) &&
        Number.isFinite(maxCooldownRaw)
            ? Math.min(maxRawX, lastCurveX + maxCooldownRaw)
            : maxRawX;
    const clampMetaY =
        enforceMin &&
        Number.isFinite(minMetaY) &&
        Number.isFinite(maxMetaY);
    return metaPoints.map((pt) => ({
        ...pt,
        x: Math.max(minX, Math.min(Number(pt.x || 0), maxX)),
        y: clampMetaY
            ? Math.max(
                  minMetaY,
                  Math.min(Number(pt.y ?? 0), maxMetaY),
              )
            : Number(pt.y ?? 0),
    }));
}

export function alignLastAirflowPoint(
    annotations: Point[] | undefined,
    curvePoints: Point[] | undefined,
): Point[] | undefined {
    if (!annotations || annotations.length === 0) return annotations;
    if (!curvePoints || curvePoints.length === 0) return annotations;
    const lastCurveTime = Number(curvePoints[curvePoints.length - 1].x || 0);
    const lastAirflowIdx = annotations.length - 1;
    if (Number(annotations[lastAirflowIdx].x) !== lastCurveTime) {
        return annotations.map((pt, i) =>
            i === lastAirflowIdx ? { ...pt, x: lastCurveTime } : pt,
        );
    }
    return annotations;
}

export function derivePointsFromWire(decoded: Record<string, unknown>) {
    if (!decoded || typeof decoded !== "object") return null;
    const candidates: { key: string; pts: Point[] }[] = [];
    for (const k of Object.keys(decoded)) {
        if (!k.endsWith("_msg")) continue;
        const arr: any[] = (decoded as any)[k];
        if (!Array.isArray(arr) || arr.length === 0) continue;
        const pts: Point[] = [];
        for (const n of arr) {
            if (!n || typeof n !== "object") continue;
            const x = (n as any)["1"];
            const y = (n as any)["2"];
            if (x === undefined || y === undefined) continue;
            pts.push({ x: Number(x), y: Number(y) });
        }
        if (pts.length > 0) candidates.push({ key: k, pts });
    }
    if (candidates.length === 0) return null;
    candidates.sort((a, b) => b.pts.length - a.pts.length);
    const curve = candidates[0]?.pts || [];
    const annotations = candidates[1]?.pts || [];
    const meta = candidates[2]?.pts || [];
    return { curve_points: curve, annotations, meta_points: meta };
}
