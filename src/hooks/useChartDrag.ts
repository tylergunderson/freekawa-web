import { useCallback, useEffect, useRef } from "react";
import type { MutableRefObject } from "react";

interface UseChartDragArgs {
    chartRef: MutableRefObject<any>;
    profile: any;
    displayAirflowPoints: Array<{
        index: number;
        x: number;
        y: number;
        source: "annotation" | "meta";
    }>;
    lastAnnotationIndex: number;
    draggingIdx: number | null;
    draggingAirIdx: number | null;
    snapEnabled: boolean;
    snapTimeStepSeconds: number;
    maxRoastSeconds: number;
    maxRawY: number;
    maxAirflowRaw: number;
    setDraggingIdx: (v: number | null) => void;
    setDragInfo: (
        v: { idx: number; secs: number; rawX: number; rawY: number } | null,
    ) => void;
    setDraggingAirIdx: (v: number | null) => void;
    setAirDragInfo: (
        v:
            | { idx: number; rawX: number; rawY: number; percent: number }
            | null,
    ) => void;
    updateCurvePointXY: (idx: number, rawX: number, rawY: number) => void;
    updateAirflowPointXY: (
        idx: number,
        rawX: number,
        rawY: number,
        source?: "annotation" | "meta",
    ) => void;
    displayToTempC: (v: number) => number;
    airflowRawToPercent: (raw: number) => number;
}

export function useChartDrag({
    chartRef,
    profile,
    displayAirflowPoints,
    lastAnnotationIndex,
    draggingIdx,
    draggingAirIdx,
    snapEnabled,
    snapTimeStepSeconds,
    maxRoastSeconds,
    maxRawY,
    maxAirflowRaw,
    setDraggingIdx,
    setDragInfo,
    setDraggingAirIdx,
    setAirDragInfo,
    updateCurvePointXY,
    updateAirflowPointXY,
    displayToTempC,
    airflowRawToPercent,
}: UseChartDragArgs) {
    const tempRafRef = useRef<number | null>(null);
    const airRafRef = useRef<number | null>(null);
    const pendingTempRef = useRef<{
        idx: number;
        rawX: number;
        rawY: number;
        secs: number;
    } | null>(null);
    const pendingAirRef = useRef<{
        idx: number;
        rawX: number;
        rawY: number;
        secs: number;
    } | null>(null);

    useEffect(() => {
        return () => {
            if (tempRafRef.current !== null) {
                cancelAnimationFrame(tempRafRef.current);
            }
            if (airRafRef.current !== null) {
                cancelAnimationFrame(airRafRef.current);
            }
        };
    }, []);

    const flushTempUpdate = useCallback(() => {
        const pending = pendingTempRef.current;
        pendingTempRef.current = null;
        tempRafRef.current = null;
        if (!pending) return;
        updateCurvePointXY(pending.idx, pending.rawX, pending.rawY);
        setDragInfo({
            idx: pending.idx,
            secs: pending.secs,
            rawX: pending.rawX,
            rawY: pending.rawY,
        });
    }, [updateCurvePointXY, setDragInfo]);

    const flushAirUpdate = useCallback(() => {
        const pending = pendingAirRef.current;
        pendingAirRef.current = null;
        airRafRef.current = null;
        if (!pending) return;
        const pt = displayAirflowPoints[pending.idx];
        if (pt?.source === "annotation") {
            let nextX = pending.rawX;
            if (pt.index === lastAnnotationIndex) {
                nextX =
                    profile?.curve_points?.[profile.curve_points.length - 1]?.x ??
                    nextX;
            }
            updateAirflowPointXY(pt.index, nextX, pending.rawY, "annotation");
            setAirDragInfo({
                idx: pending.idx,
                rawX: nextX,
                rawY: pending.rawY,
                percent: airflowRawToPercent(pending.rawY),
            });
            return;
        }
        if (pt?.source === "meta") {
            updateAirflowPointXY(0, pending.rawX, pending.rawY, "meta");
            setAirDragInfo({
                idx: pending.idx,
                rawX: pending.rawX,
                rawY: pending.rawY,
                percent: airflowRawToPercent(pending.rawY),
            });
        }
    }, [
        displayAirflowPoints,
        lastAnnotationIndex,
        profile,
        updateAirflowPointXY,
        setAirDragInfo,
        airflowRawToPercent,
    ]);

    const handlePointerDown = useCallback(
        (e: any) => {
            if (!chartRef.current) return;
            const chart = chartRef.current;
            try {
                const elems = chart.getElementsAtEventForMode(
                    e.nativeEvent,
                    "nearest",
                    { intersect: false },
                    false,
                );
                if (elems && elems.length > 0) {
                    const el = elems[0];
                    if (el.datasetIndex === 0 && el.index !== 0) {
                        setDraggingIdx(el.index);
                        const curPt = profile?.curve_points?.[el.index] || {
                            x: 0,
                            y: 0,
                        };
                        setDragInfo({
                            idx: el.index,
                            secs: curPt.x / 10,
                            rawX: curPt.x,
                            rawY: curPt.y,
                        });
                    } else if (el.datasetIndex === 1) {
                        const pt = displayAirflowPoints[el.index];
                        if (!pt) return;
                        if (
                            (pt.source === "annotation" && pt.index === 0) ||
                            (pt.source === "annotation" &&
                                pt.index === lastAnnotationIndex) ||
                            pt.source === "meta"
                        ) {
                            return;
                        }
                        setDraggingAirIdx(el.index);
                        setAirDragInfo({
                            idx: el.index,
                            rawX: Number(pt.x || 0),
                            rawY: Number(pt.y || 0),
                            percent: airflowRawToPercent(pt.y),
                        });
                    }
                }
            } catch {
                // ignore
            }
        },
        [
            chartRef,
            profile,
            displayAirflowPoints,
            lastAnnotationIndex,
            setDraggingIdx,
            setDragInfo,
            setDraggingAirIdx,
            setAirDragInfo,
            airflowRawToPercent,
        ],
    );

    const handlePointerMove = useCallback(
        (e: any) => {
            if (draggingIdx === null) return;
            if (!chartRef.current) return;
            const chart = chartRef.current;
            try {
                const rect = chart.canvas.getBoundingClientRect();
                const px = e.nativeEvent.clientX - rect.left;
                const py = e.nativeEvent.clientY - rect.top;
                const xVal = chart.scales.x.getValueForPixel(px);
                const yVal = chart.scales.y.getValueForPixel(py);
                let secs = Math.max(0, Math.min(xVal, maxRoastSeconds));
                let rawX = Math.round(secs * 10);
                let tempDisplay = Number(yVal);
                if (snapEnabled) tempDisplay = Math.round(tempDisplay);
                const tempC = displayToTempC(tempDisplay);
                const rawY = Math.max(
                    0,
                    Math.min(Math.round(tempC * 10), maxRawY),
                );
                if (snapEnabled) {
                    const timeStepRaw = snapTimeStepSeconds * 10;
                    rawX = Math.round(rawX / timeStepRaw) * timeStepRaw;
                    secs = rawX / 10;
                }
                pendingTempRef.current = {
                    idx: draggingIdx,
                    rawX,
                    rawY,
                    secs,
                };
                if (tempRafRef.current === null) {
                    tempRafRef.current = requestAnimationFrame(flushTempUpdate);
                }
            } catch {
                // ignore
            }
        },
        [
            draggingIdx,
            chartRef,
            maxRoastSeconds,
            snapEnabled,
            displayToTempC,
            maxRawY,
            snapTimeStepSeconds,
            flushTempUpdate,
        ],
    );

    const handleAirPointerMove = useCallback(
        (e: any) => {
            if (draggingAirIdx === null) return;
            if (!chartRef.current) return;
            const chart = chartRef.current;
            try {
                const rect = chart.canvas.getBoundingClientRect();
                const px = e.nativeEvent.clientX - rect.left;
                const py = e.nativeEvent.clientY - rect.top;
                const xVal = chart.scales.x.getValueForPixel(px);
                const yVal = chart.scales.air.getValueForPixel(py);
                let secs = Math.max(0, Math.min(xVal, maxRoastSeconds));
                let rawX = Math.round(secs * 10);
                const rawY = Math.max(
                    0,
                    Math.min(Math.round(yVal * 10), maxAirflowRaw),
                );
                if (snapEnabled) {
                    const timeStepRaw = snapTimeStepSeconds * 10;
                    rawX = Math.round(rawX / timeStepRaw) * timeStepRaw;
                    secs = rawX / 10;
                }
                pendingAirRef.current = {
                    idx: draggingAirIdx,
                    rawX,
                    rawY,
                    secs,
                };
                if (airRafRef.current === null) {
                    airRafRef.current = requestAnimationFrame(flushAirUpdate);
                }
            } catch {
                // ignore
            }
        },
        [
            draggingAirIdx,
            chartRef,
            maxRoastSeconds,
            maxAirflowRaw,
            snapEnabled,
            snapTimeStepSeconds,
            flushAirUpdate,
        ],
    );

    const handlePointerUp = useCallback(() => {
        if (tempRafRef.current !== null) {
            cancelAnimationFrame(tempRafRef.current);
            tempRafRef.current = null;
            pendingTempRef.current = null;
        }
        if (airRafRef.current !== null) {
            cancelAnimationFrame(airRafRef.current);
            airRafRef.current = null;
            pendingAirRef.current = null;
        }
        setDraggingIdx(null);
        setDragInfo(null);
        setDraggingAirIdx(null);
        setAirDragInfo(null);
    }, [setDraggingIdx, setDragInfo, setDraggingAirIdx, setAirDragInfo]);

    return {
        handlePointerDown,
        handlePointerMove,
        handleAirPointerMove,
        handlePointerUp,
    };
}
