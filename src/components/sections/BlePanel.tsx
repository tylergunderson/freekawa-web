import BluetoothIcon from "@mui/icons-material/Bluetooth";
import BluetoothDisabledIcon from "@mui/icons-material/BluetoothDisabled";
import InfoIcon from "@mui/icons-material/Info";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import SyncIcon from "@mui/icons-material/Sync";
import CellTowerIcon from "@mui/icons-material/CellTower";
import StopIcon from "@mui/icons-material/Stop";
import EditNoteIcon from "@mui/icons-material/EditNote";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useMemo, useState, type ComponentProps, type ReactNode } from "react";
import { Line } from "react-chartjs-2";
import type { RoastTelemetrySample } from "@freekawa/ikawa-home-protocol";
import { alpha, useTheme } from "@mui/material/styles";
import { MAX_AIRFLOW_RAW } from "../../rules";
import type { Point } from "../../types/profile";

interface BlePanelProps {
    enabled: boolean;
    supported: boolean;
    connected: boolean;
    busy: boolean;
    deviceName: string;
    mtu: number | null;
    error: string | null;
    lastResponse: string;
    onConnect: () => void;
    onDisconnect: () => void;
    onGetStatus: () => void;
    onGetMachineInfo: () => void;
    onGetCurrentProfile: () => void;
    telemetryRunning: boolean;
    telemetryBusy: boolean;
    telemetryError: string | null;
    telemetrySample: RoastTelemetrySample | null;
    telemetryHistory: RoastTelemetrySample[];
    telemetryHistoryCount: number;
    profileCurvePoints: Point[];
    profileFanPoints: Point[];
    profileName: string;
    profileSourceLabel: string;
    loadedProfileName: string;
    loadedProfileOrigin: string;
    loadedProfileTempPointCount: number;
    loadedProfileFanPointCount: number;
    onStartTelemetry: () => void;
    onStopTelemetry: () => void;
    onUseLoadedProfile: () => void;
    useLoadedProfileDisabled: boolean;
}

export function BlePanel({
    enabled,
    supported,
    connected,
    busy,
    deviceName,
    error,
    lastResponse,
    onConnect,
    onDisconnect,
    onGetStatus,
    onGetMachineInfo,
    onGetCurrentProfile,
    telemetryRunning,
    telemetryError,
    telemetrySample,
    telemetryHistory,
    telemetryHistoryCount,
    profileCurvePoints,
    profileFanPoints,
    profileName,
    profileSourceLabel,
    loadedProfileName,
    loadedProfileOrigin,
    loadedProfileTempPointCount,
    loadedProfileFanPointCount,
    onStartTelemetry,
    onStopTelemetry,
    onUseLoadedProfile,
    useLoadedProfileDisabled,
}: BlePanelProps) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const panelBg = isDark
        ? "linear-gradient(180deg, rgba(23,29,36,0.96) 0%, rgba(16,22,29,0.96) 100%)"
        : "linear-gradient(180deg, rgba(248,249,251,0.96) 0%, rgba(242,245,247,0.96) 100%)";
    const cardBg = alpha(theme.palette.background.paper, isDark ? 0.78 : 0.72);
    const cardBorder = `1px solid ${alpha(theme.palette.divider, isDark ? 0.5 : 0.7)}`;

    const [showAirflowOverlay, setShowAirflowOverlay] = useState(false);
    const recipePointsC = useMemo(
        () =>
            profileCurvePoints.map((point) => ({
                timeSeconds: point.x / 10,
                tempC: point.y / 10,
            })),
        [profileCurvePoints],
    );
    const recipeFanPointsPct = useMemo(
        () =>
            profileFanPoints.map((point) => ({
                timeSeconds: point.x / 10,
                percent: rawAirflowToPercent(point.y),
            })),
        [profileFanPoints],
    );

    const currentRecipeTargetC = useMemo(() => {
        if (!telemetrySample || recipePointsC.length < 2) return null;
        return interpolateRecipeTempC(
            recipePointsC,
            telemetrySample.roastTimeSeconds,
        );
    }, [recipePointsC, telemetrySample]);

    const currentRecipeDeltaC =
        telemetrySample && currentRecipeTargetC !== null
            ? telemetrySample.beanTempC - currentRecipeTargetC
            : null;
    const currentSetpointDeltaC = telemetrySample
        ? telemetrySample.beanTempC - telemetrySample.setpointC
        : null;

    const recipeTrackingChartData = useMemo(() => {
        const recipePoints = profileCurvePoints.map((point) => ({
            x: point.x / 10,
            y: point.y / 10,
        }));
        const livePoints = telemetryHistory.map((sample) => ({
            x: sample.roastTimeSeconds,
            y: sample.beanTempC,
        }));
        const liveSetpointPoints = telemetryHistory.map((sample) => ({
            x: sample.roastTimeSeconds,
            y: sample.setpointC,
        }));
        const recipeFanPoints = recipeFanPointsPct.map((point) => ({
            x: point.timeSeconds,
            y: point.percent,
        }));
        const liveFanTargetPoints = telemetryHistory.map((sample) => ({
            x: sample.roastTimeSeconds,
            y: rawAirflowToPercent(sample.fanRaw),
        }));
        const liveFanMeasuredPoints = telemetryHistory.map((sample) => ({
            x: sample.roastTimeSeconds,
            y: estimateMeasuredFanPercent(sample),
        }));
        const currentTime = telemetrySample?.roastTimeSeconds ?? 0;
        const maxRecipeTemp = recipePoints.reduce(
            (max, point) => Math.max(max, point.y),
            0,
        );
        const maxLiveTemp = livePoints.reduce(
            (max, point) => Math.max(max, point.y),
            0,
        );
        const maxTemp = Math.max(maxRecipeTemp, maxLiveTemp, 200);

        return {
            datasets: [
                {
                    label: profileName
                        ? `Recipe: ${profileName}`
                        : "Recipe Target",
                    data: recipePoints,
                    showLine: true,
                    fill: false,
                    borderColor: "rgba(70, 70, 70, 0.9)",
                    backgroundColor: "rgba(70, 70, 70, 0.12)",
                    borderWidth: 2,
                    borderDash: [8, 4],
                    pointRadius: 0,
                    tension: 0.2,
                    yAxisID: "temp",
                },
                {
                    label: "Actual Bean Temp",
                    data: livePoints,
                    showLine: true,
                    fill: false,
                    borderColor: "rgba(196, 63, 34, 1)",
                    backgroundColor: "rgba(196, 63, 34, 0.15)",
                    borderWidth: 2.5,
                    pointRadius: 0,
                    tension: 0.25,
                    yAxisID: "temp",
                },
                {
                    label: "Machine Setpoint",
                    data: liveSetpointPoints,
                    showLine: true,
                    fill: false,
                    borderColor: "rgba(217, 147, 29, 1)",
                    backgroundColor: "rgba(217, 147, 29, 0.1)",
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.2,
                    yAxisID: "temp",
                },
                {
                    label: "Recipe Airflow",
                    data: recipeFanPoints,
                    hidden: !showAirflowOverlay,
                    showLine: true,
                    fill: false,
                    borderColor: "rgba(60, 138, 91, 0.72)",
                    backgroundColor: "rgba(60, 138, 91, 0.08)",
                    borderWidth: 1.75,
                    borderDash: [4, 4],
                    pointRadius: 0,
                    tension: 0.2,
                    yAxisID: "fan",
                },
                {
                    label: "Airflow Actual",
                    data: liveFanMeasuredPoints,
                    hidden: !showAirflowOverlay,
                    showLine: true,
                    fill: false,
                    borderColor: "rgba(43, 112, 212, 0.72)",
                    backgroundColor: "rgba(43, 112, 212, 0.1)",
                    borderWidth: 1.75,
                    pointRadius: 0,
                    tension: 0.2,
                    yAxisID: "fan",
                },
                {
                    label: "Airflow Target",
                    data: liveFanTargetPoints,
                    hidden: !showAirflowOverlay,
                    showLine: true,
                    fill: false,
                    borderColor: "rgba(87, 157, 232, 0.72)",
                    backgroundColor: "rgba(87, 157, 232, 0.08)",
                    borderWidth: 1.75,
                    borderDash: [6, 4],
                    pointRadius: 0,
                    tension: 0.2,
                    yAxisID: "fan",
                },
                {
                    label: "Current Roast Time",
                    data: [
                        { x: currentTime, y: 0 },
                        { x: currentTime, y: maxTemp + 10 },
                    ],
                    showLine: true,
                    fill: false,
                    borderColor: "rgba(44, 123, 229, 0.85)",
                    borderDash: [6, 6],
                    borderWidth: 2,
                    pointRadius: 0,
                    yAxisID: "temp",
                },
            ],
        };
    }, [profileCurvePoints, profileFanPoints, profileName, recipeFanPointsPct, showAirflowOverlay, telemetryHistory, telemetrySample]);

    const recipeTrackingChartOptions = useMemo(() => {
        const recipeEndSeconds =
            profileCurvePoints[profileCurvePoints.length - 1]?.x / 10 || 0;
        const liveEndSeconds = telemetrySample?.roastTimeSeconds || 0;
        const xMax = Math.max(recipeEndSeconds, liveEndSeconds, 60);

        return {
            responsive: true,
            maintainAspectRatio: false,
            animation: false as const,
            layout: {
                padding: {
                    bottom: 36,
                },
            },
            interaction: {
                mode: "nearest" as const,
                intersect: false,
            },
            plugins: {
                legend: {
                    display: false,
                },
            },
            scales: {
                x: {
                    type: "linear" as const,
                    min: 0,
                    max: xMax,
                    title: {
                        display: true,
                        text: "Recipe Time (s)",
                    },
                    ticks: {
                        callback: (value: string | number) => {
                            const s = Number(value);
                            const m = Math.floor(s / 60);
                            const sec = Math.round(s % 60)
                                .toString()
                                .padStart(2, "0");
                            return `${m}:${sec}`;
                        },
                    },
                },
                temp: {
                    type: "linear" as const,
                    position: "left" as const,
                    title: {
                        display: true,
                        text: "Temperature (C)",
                    },
                },
                fan: {
                    type: "linear" as const,
                    position: "right" as const,
                    display: showAirflowOverlay,
                    min: 0,
                    max: 100,
                    title: {
                        display: true,
                        text: "Airflow (%)",
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                },
            },
        };
    }, [profileCurvePoints, showAirflowOverlay, telemetrySample]);

    return (
        <Paper
            variant="outlined"
            sx={{
                p: 2,
                mb: 3,
                borderRadius: 2,
                background: panelBg,
            }}
        >
            <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", md: "center" }}
                sx={{ mb: 2 }}
            >
                <Box>
                    <Typography variant="h6">Direct Bluetooth</Typography>
                </Box>
                <Stack
                    direction="row"
                    spacing={1}
                    useFlexGap
                    flexWrap="wrap"
                    sx={{ alignItems: "center" }}
                >
                    <ActionButton
                        title={
                            connected
                                ? "Disconnect from roaster"
                                : "Connect to roaster"
                        }
                        label={connected ? "Disconnect" : "Connect"}
                        icon={
                            connected ? (
                                <BluetoothDisabledIcon fontSize="small" />
                            ) : (
                                <BluetoothIcon fontSize="small" />
                            )
                        }
                        iconOnly
                        variant={connected ? "outlined" : "contained"}
                        onClick={connected ? onDisconnect : onConnect}
                        disabled={
                            connected
                                ? busy
                                : !enabled || !supported || busy
                        }
                    />
                    <ActionButton
                        title="Get machine info"
                        label="Info"
                        icon={<InfoIcon fontSize="small" />}
                        iconOnly
                        variant="outlined"
                        onClick={onGetMachineInfo}
                        disabled={!connected || busy}
                    />
                    <ActionButton
                        title="Get current profile from roaster"
                        label="Profile"
                        icon={<MenuBookIcon fontSize="small" />}
                        iconOnly
                        variant="outlined"
                        onClick={onGetCurrentProfile}
                        disabled={!connected || busy}
                    />
                    <ActionButton
                        title="Get current machine status"
                        label="Status"
                        icon={<SyncIcon fontSize="small" />}
                        iconOnly
                        variant="outlined"
                        onClick={onGetStatus}
                        disabled={!connected || busy}
                    />
                    <ActionButton
                        title={
                            telemetryRunning
                                ? "Stop live status polling"
                                : "Start live status polling"
                        }
                        label={telemetryRunning ? "Stop" : "Live"}
                        icon={
                            telemetryRunning ? (
                                <StopIcon fontSize="small" />
                            ) : (
                                <CellTowerIcon fontSize="small" />
                            )
                        }
                        iconOnly
                        variant={telemetryRunning ? "outlined" : "outlined"}
                        onClick={
                            telemetryRunning
                                ? onStopTelemetry
                                : onStartTelemetry
                        }
                        disabled={
                            telemetryRunning
                                ? false
                                : !connected || busy
                        }
                    />
                </Stack>
            </Stack>

            <Stack spacing={1}>
                {!enabled && (
                    <Alert severity="info">
                        BLE direct-send is disabled by feature flag.
                    </Alert>
                )}
                {!supported && (
                    <Alert severity="warning">
                        Web Bluetooth is not available in this browser.
                    </Alert>
                )}
                {error && <Alert severity="error">{error}</Alert>}
                {telemetryError && <Alert severity="warning">{telemetryError}</Alert>}

                <Box
                    sx={{
                        borderRadius: 1.5,
                        p: 1.5,
                        backgroundColor: cardBg,
                        border: cardBorder,
                    }}
                >
                    <Stack
                        spacing={0.5}
                    >
                        <Typography variant="body2">
                            Status: {connected ? "Connected" : "Disconnected"}
                            {deviceName ? ` to ${deviceName}` : ""}
                            {busy ? ", working..." : ""}
                        </Typography>
                        {(telemetryRunning || profileSourceLabel !== "None") && (
                            <Typography variant="body2" color="text.secondary">
                                {telemetryRunning ? "Telemetry active" : "Telemetry idle"}
                                {profileSourceLabel !== "None"
                                    ? ` · Reference curve: ${profileSourceLabel}`
                                    : ""}
                            </Typography>
                        )}
                    </Stack>
                </Box>

                {loadedProfileName && (
                    <Box
                        sx={{
                            borderRadius: 1.5,
                            p: 1.5,
                            backgroundColor: cardBg,
                            border: cardBorder,
                        }}
                    >
                        <Stack
                            direction={{ xs: "column", md: "row" }}
                            spacing={1.5}
                            justifyContent="space-between"
                            alignItems={{ xs: "flex-start", md: "center" }}
                        >
                            <Box>
                                <Typography variant="subtitle2">
                                    Roaster Loaded Profile
                                </Typography>
                                <Typography variant="body2">
                                    {loadedProfileName}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    {loadedProfileOrigin || "Unknown coffee"} ·{" "}
                                    {loadedProfileTempPointCount} temp points ·{" "}
                                    {loadedProfileFanPointCount} fan points
                                </Typography>
                            </Box>
                            <ActionButton
                                title="Load roaster profile into editor"
                                label="Use In Editor"
                                icon={<EditNoteIcon fontSize="small" />}
                                variant="outlined"
                                size="small"
                                onClick={onUseLoadedProfile}
                                disabled={useLoadedProfileDisabled}
                                sx={{
                                    minHeight: 56,
                                    px: 2.5,
                                }}
                            />
                        </Stack>
                    </Box>
                )}

                {telemetrySample && (
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "repeat(2, minmax(0, 1fr))",
                                md: "repeat(4, minmax(0, 1fr))",
                            },
                            gap: 1,
                        }}
                    >
                        <MetricCard
                            label="Roast Time"
                            value={`${telemetrySample.roastTimeSeconds.toFixed(1)}s`}
                        />
                        <MetricCard
                            label="Bean Temp"
                            value={`${telemetrySample.beanTempC.toFixed(1)}C`}
                        />
                        <MetricCard
                            label="Setpoint"
                            value={`${telemetrySample.setpointC.toFixed(1)}C`}
                        />
                        <MetricCard
                            label="Delta vs Recipe"
                            value={
                                currentRecipeDeltaC === null
                                    ? "..."
                                    : formatSignedCelsius(currentRecipeDeltaC)
                            }
                        />
                        <MetricCard
                            label="Delta vs Setpoint"
                            value={
                                currentSetpointDeltaC === null
                                    ? "..."
                                    : formatSignedCelsius(currentSetpointDeltaC)
                            }
                        />
                        <MetricCard
                            label="Airflow Actual"
                            value={`${estimateMeasuredFanPercent(telemetrySample).toFixed(0)}%`}
                        />
                        <MetricCard
                            label="Airflow Target"
                            value={`${rawAirflowToPercent(telemetrySample.fanRaw).toFixed(0)}%`}
                        />
                        <MetricCard
                            label="Heater"
                            value={String(telemetrySample.heaterRaw)}
                        />
                    </Box>
                )}

                {profileCurvePoints.length > 1 && telemetryHistoryCount > 0 && (
                    <Box
                        sx={{
                            mb: 1.5,
                            borderRadius: 1.5,
                            p: 1.5,
                            backgroundColor: cardBg,
                            border: cardBorder,
                        }}
                    >
                        <Stack
                            direction={{ xs: "column", md: "row" }}
                            justifyContent="space-between"
                            alignItems={{ xs: "flex-start", md: "center" }}
                            sx={{ mb: 1 }}
                            spacing={1.5}
                        >
                            <Stack spacing={0.75} sx={{ width: "100%" }}>
                                <Typography variant="subtitle2">
                                    Recipe Tracking Overlay
                                </Typography>
                                {profileName && (
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Tracking: {profileName}
                                    </Typography>
                                )}
                                <Stack
                                    direction="row"
                                    spacing={0.75}
                                    useFlexGap
                                    flexWrap="wrap"
                                >
                                    <LegendChip
                                        label="Recipe"
                                        color="rgba(70, 70, 70, 0.9)"
                                        dashed
                                    />
                                    <LegendChip
                                        label="Bean Temp"
                                        color="rgba(196, 63, 34, 1)"
                                    />
                                    <LegendChip
                                        label="Setpoint"
                                        color="rgba(217, 147, 29, 1)"
                                    />
                                    <LegendChip
                                        label="Now"
                                        color="rgba(44, 123, 229, 0.85)"
                                        dashed
                                    />
                                    {showAirflowOverlay && (
                                        <>
                                            <LegendChip
                                                label="Recipe Airflow"
                                                color="rgba(60, 138, 91, 0.72)"
                                                dashed
                                            />
                                            <LegendChip
                                                label="Airflow Actual"
                                                color="rgba(43, 112, 212, 0.72)"
                                            />
                                            <LegendChip
                                                label="Airflow Target"
                                                color="rgba(87, 157, 232, 0.72)"
                                                dashed
                                            />
                                        </>
                                    )}
                                </Stack>
                            </Stack>
                            <Button
                                size="small"
                                variant={showAirflowOverlay ? "contained" : "outlined"}
                                onClick={() =>
                                    setShowAirflowOverlay((current) => !current)
                                }
                                sx={{
                                    textTransform: "none",
                                    minHeight: 48,
                                    px: 2.5,
                                    alignSelf: { xs: "stretch", md: "center" },
                                    flexShrink: 0,
                                }}
                            >
                                {showAirflowOverlay ? "Hide Airflow" : "Show Airflow"}
                            </Button>
                        </Stack>
                        <Box
                            sx={{
                                height: { xs: 340, md: 360 },
                                pt: 0.5,
                            }}
                        >
                            <Line
                                data={recipeTrackingChartData}
                                options={recipeTrackingChartOptions}
                            />
                        </Box>
                    </Box>
                )}

                <Accordion
                    sx={{ mt: 1 }}
                    defaultExpanded={false}
                    TransitionProps={{ unmountOnExit: true }}
                >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="body2">
                            Roaster response (debug)
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Box
                            component="pre"
                            sx={{
                                m: 0,
                                maxHeight: 200,
                                overflow: "auto",
                                p: 1,
                                borderRadius: 1,
                                backgroundColor: (theme) =>
                                    theme.palette.mode === "dark"
                                        ? "rgba(9, 13, 17, 0.94)"
                                        : "rgba(18, 24, 28, 0.06)",
                                color: (theme) =>
                                    theme.palette.mode === "dark"
                                        ? "rgb(208, 239, 227)"
                                        : theme.palette.text.primary,
                                fontFamily:
                                    '"SFMono-Regular", "Menlo", "Consolas", monospace',
                                fontSize: 12,
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word",
                            }}
                        >
                            {lastResponse || "No BLE response yet."}
                        </Box>
                    </AccordionDetails>
                </Accordion>
            </Stack>
        </Paper>
    );
}

function MetricCard({ label, value }: { label: string; value: string }) {
    return (
        <Box
            sx={{
                borderRadius: 1.5,
                p: 1.25,
                backgroundColor: (theme) =>
                    alpha(
                        theme.palette.background.paper,
                        theme.palette.mode === "dark" ? 0.78 : 0.72,
                    ),
                border: (theme) =>
                    `1px solid ${alpha(
                        theme.palette.divider,
                        theme.palette.mode === "dark" ? 0.5 : 0.7,
                    )}`,
            }}
        >
            <Typography variant="caption" color="text.secondary">
                {label}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {value}
            </Typography>
        </Box>
    );
}

function LegendChip({
    label,
    color,
    dashed = false,
}: {
    label: string;
    color: string;
    dashed?: boolean;
}) {
    return (
        <Box
            sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.75,
                px: 1,
                py: 0.5,
                borderRadius: 999,
                backgroundColor: (theme) =>
                    alpha(
                        theme.palette.background.paper,
                        theme.palette.mode === "dark" ? 0.78 : 0.72,
                    ),
                border: (theme) =>
                    `1px solid ${alpha(
                        theme.palette.divider,
                        theme.palette.mode === "dark" ? 0.5 : 0.7,
                    )}`,
            }}
        >
            <Box
                sx={{
                    width: 16,
                    height: 0,
                    borderTop: `2px ${dashed ? "dashed" : "solid"} ${color}`,
                    flexShrink: 0,
                }}
            />
            <Typography variant="caption" sx={{ lineHeight: 1.2 }}>
                {label}
            </Typography>
        </Box>
    );
}

function formatSignedCelsius(value: number): string {
    const sign = value > 0 ? "+" : "";
    return `${sign}${value.toFixed(1)} C`;
}

function interpolateRecipeTempC(
    points: Array<{ timeSeconds: number; tempC: number }>,
    timeSeconds: number,
): number | null {
    if (!points.length) return null;
    if (timeSeconds <= points[0].timeSeconds) return points[0].tempC;

    for (let index = 1; index < points.length; index += 1) {
        const previous = points[index - 1];
        const current = points[index];
        if (timeSeconds > current.timeSeconds) continue;
        const span = current.timeSeconds - previous.timeSeconds;
        if (span <= 0) return current.tempC;
        const progress = (timeSeconds - previous.timeSeconds) / span;
        return previous.tempC + (current.tempC - previous.tempC) * progress;
    }

    return points[points.length - 1].tempC;
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

function rawAirflowToPercent(raw: number): number {
    return clamp((raw / MAX_AIRFLOW_RAW) * 100, 0, 100);
}

function estimateMeasuredFanPercent(sample: RoastTelemetrySample): number {
    const targetPercent = rawAirflowToPercent(sample.fanRaw);
    if (sample.fanRpmSetpoint <= 0 || targetPercent <= 0) {
        return 0;
    }

    const ratio = sample.fanRpmMeasured / sample.fanRpmSetpoint;
    return clamp(targetPercent * ratio, 0, 100);
}

function ActionButton({
    title,
    label,
    icon,
    iconOnly = false,
    ...buttonProps
}: {
    title: string;
    label: string;
    icon: ReactNode;
    iconOnly?: boolean;
} & ComponentProps<typeof Button>) {
    const button = (
        <Button
            startIcon={iconOnly ? undefined : icon}
            aria-label={label}
            sx={{
                textTransform: "none",
                minHeight: iconOnly ? 64 : 48,
                minWidth: iconOnly ? 64 : undefined,
                width: iconOnly ? 64 : undefined,
                px: iconOnly ? 0 : 2.5,
                "& .MuiSvgIcon-root": {
                    fontSize: iconOnly ? 26 : 20,
                },
            }}
            {...buttonProps}
        >
            {iconOnly ? icon : label}
        </Button>
    );

    if (buttonProps.disabled) {
        return (
            <Tooltip title={title}>
                <span>{button}</span>
            </Tooltip>
        );
    }

    return <Tooltip title={title}>{button}</Tooltip>;
}
