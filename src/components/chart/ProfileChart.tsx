import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import { Line } from "react-chartjs-2";
import type { MutableRefObject } from "react";

interface DragInfo {
    idx: number;
    secs: number;
    rawX: number;
    rawY: number;
}

interface ProfileChartProps {
    chartRef: MutableRefObject<any>;
    chartData: any;
    chartOptions: any;
    dragInfo: DragInfo | null;
    handlePointerDown: (e: any) => void;
    handlePointerMove: (e: any) => void;
    handleAirPointerMove: (e: any) => void;
    handlePointerUp: () => void;
}

export function ProfileChart({
    chartRef,
    chartData,
    chartOptions,
    dragInfo,
    handlePointerDown,
    handlePointerMove,
    handleAirPointerMove,
    handlePointerUp,
}: ProfileChartProps) {
    return (
        <Paper
            sx={{
                height: { xs: 260, sm: 300, lg: 360 },
                p: 2,
                mb: 2,
                position: "relative",
                touchAction: "none",
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={(e) => {
                handlePointerMove(e);
                handleAirPointerMove(e);
            }}
            onPointerUp={handlePointerUp}
        >
            <Line ref={chartRef} data={chartData} options={chartOptions} />
            {dragInfo && (
                <Box
                    sx={{
                        position: "absolute",
                        right: 8,
                        top: 8,
                        background: "rgba(0,0,0,0.7)",
                        color: "white",
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: 12,
                    }}
                >
                    <div>Idx: {dragInfo.idx}</div>
                    <div>
                        Time: {typeof dragInfo.secs === "number" ? Math.round(dragInfo.secs) + "s" : "-"}
                    </div>
                    <div>RawX: {dragInfo.rawX ?? "-"}</div>
                    <div>RawY: {dragInfo.rawY ?? "-"}</div>
                </Box>
            )}
        </Paper>
    );
}
