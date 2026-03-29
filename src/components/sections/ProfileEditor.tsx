import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Alert from "@mui/material/Alert";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ProfileChart } from "../chart/ProfileChart";
import { TemperaturePointsTable } from "../tables/TemperaturePointsTable";
import { AirflowPointsTable } from "../tables/AirflowPointsTable";

interface ProfileEditorProps {
    profile: any;
    lastParsedWasPro: boolean;
    isDownsampledForHome: boolean;
    setProfile: (updater: any) => void;
    chartRef: React.MutableRefObject<any>;
    chartData: any;
    chartOptions: any;
    dragInfo: { idx: number; secs: number; rawX: number; rawY: number } | null;
    handlePointerDown: (e: any) => void;
    handlePointerMove: (e: any) => void;
    handleAirPointerMove: (e: any) => void;
    handlePointerUp: () => void;
    tempUnit: "C" | "F";
    setTempUnit: (v: "C" | "F") => void;
    snapEnabled: boolean;
    setSnapEnabled: (v: boolean) => void;
    tempUnitLabel: string;
    points: Array<{ index: number; x: number; y: number }>;
    displayAirflowPoints: Array<{
        index: number;
        x: number;
        y: number;
        source: "annotation" | "meta";
    }>;
    maxRoastSeconds: number;
    maxTempDisplay: number;
    addPoint: () => void;
    addAirflowPoint: () => void;
    setPointTimeSeconds: (idx: number, value: string) => void;
    setPointTempDegrees: (idx: number, value: string) => void;
    removePoint: (idx: number) => void;
    tempToDisplay: (celsius: number) => number;
    lastAnnotationIndex: number;
    setAirflowTimeSeconds: (
        idx: number,
        value: string,
        source?: "annotation" | "meta",
    ) => void;
    airflowRawToPercent: (raw: number) => number;
    airflowPercentToRaw: (pct: number) => number;
    updateAirflowPoint: (
        idx: number,
        field: "x" | "y",
        val: number,
        source?: "annotation" | "meta",
    ) => void;
    removeAirflowPoint: (idx: number) => void;
    isValid: boolean;
    validationErrors: string[];
    canDirectBleSend: boolean;
    canOpenInHome: boolean;
    homeExportReason: string;
}

export function ProfileEditor({
    profile,
    lastParsedWasPro,
    isDownsampledForHome,
    setProfile,
    chartRef,
    chartData,
    chartOptions,
    dragInfo,
    handlePointerDown,
    handlePointerMove,
    handleAirPointerMove,
    handlePointerUp,
    tempUnit,
    setTempUnit,
    snapEnabled,
    setSnapEnabled,
    tempUnitLabel,
    points,
    displayAirflowPoints,
    maxRoastSeconds,
    maxTempDisplay,
    addPoint,
    addAirflowPoint,
    setPointTimeSeconds,
    setPointTempDegrees,
    removePoint,
    tempToDisplay,
    lastAnnotationIndex,
    setAirflowTimeSeconds,
    airflowRawToPercent,
    airflowPercentToRaw,
    updateAirflowPoint,
    removeAirflowPoint,
    isValid,
    validationErrors,
    canDirectBleSend,
    canOpenInHome,
    homeExportReason,
}: ProfileEditorProps) {
    return (
        <>
            <div className="controls" style={{ alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                    <Box sx={{ mb: 2 }} />
                    {lastParsedWasPro && profile && !isDownsampledForHome && (
                        <Alert severity="info" sx={{ mb: 1 }}>
                            Pro profile detected. Direct roaster send is
                            available, but IKAWA Home export still requires Pro
                            to Home conversion.
                        </Alert>
                    )}
                    {isDownsampledForHome && profile && (
                        <Typography
                            variant="body2"
                            color="success.main"
                            sx={{ mb: 1 }}
                        >
                            Downsampled to Home-compatible profile.
                        </Typography>
                    )}
                    {profile && (
                        <Box sx={{ display: "grid", gap: 1, mb: 1 }}>
                            <Alert
                                severity={canDirectBleSend ? "success" : "warning"}
                            >
                                {canDirectBleSend
                                    ? "Direct roaster send is available for this profile."
                                    : "Direct roaster send is blocked until the validation issues below are fixed."}
                            </Alert>
                            <Alert
                                severity={canOpenInHome ? "success" : "info"}
                            >
                                {canOpenInHome
                                    ? "IKAWA Home share-link export is available."
                                    : homeExportReason ||
                                      "IKAWA Home share-link export is not currently available."}
                            </Alert>
                        </Box>
                    )}
                </div>
            </div>

            <TextField
                label="Coffee name"
                value={profile.profile_name || ""}
                onChange={(e) =>
                    setProfile((prev: any) => ({
                        ...prev,
                        profile_name: e.target.value,
                    }))
                }
                variant="outlined"
                size="small"
                fullWidth
                sx={{ mt: 2, mb: 1 }}
            />
            <TextField
                label="Origin (Optional)"
                value={profile.metadata?.origin || profile.metadata?.farm || ""}
                onChange={(e) =>
                    setProfile((prev: any) => ({
                        ...prev,
                        metadata: {
                            ...(prev.metadata || {}),
                            origin: e.target.value,
                        },
                    }))
                }
                variant="outlined"
                size="small"
                fullWidth
                sx={{ mb: 1 }}
            />

            <Box
                sx={{
                    position: "sticky",
                    top: { xs: 8, sm: 12, lg: 16 },
                    zIndex: 2,
                    backgroundColor: "background.paper",
                    pb: 1,
                    mb: 1,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                }}
            >
                <ProfileChart
                    chartRef={chartRef}
                    chartData={chartData}
                    chartOptions={chartOptions}
                    dragInfo={dragInfo}
                    handlePointerDown={handlePointerDown}
                    handlePointerMove={handlePointerMove}
                    handleAirPointerMove={handleAirPointerMove}
                    handlePointerUp={handlePointerUp}
                />
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mt: 1,
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                    }}
                >
                    <ToggleButtonGroup
                        size="small"
                        value={tempUnit}
                        exclusive
                        onChange={(_, v) => v && setTempUnit(v)}
                    >
                        <ToggleButton value="C">°C</ToggleButton>
                        <ToggleButton value="F">°F</ToggleButton>
                    </ToggleButtonGroup>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={snapEnabled}
                                onChange={(e) => setSnapEnabled(e.target.checked)}
                                size="small"
                            />
                        }
                        label={`Snap 1s / 1${tempUnitLabel}`}
                    />
                </Box>
            </Box>

            <TemperaturePointsTable
                points={points}
                tempUnitLabel={tempUnitLabel}
                maxRoastSeconds={maxRoastSeconds}
                maxTempDisplay={maxTempDisplay}
                addPoint={addPoint}
                setPointTimeSeconds={setPointTimeSeconds}
                setPointTempDegrees={setPointTempDegrees}
                removePoint={removePoint}
                tempToDisplay={tempToDisplay}
            />

            <AirflowPointsTable
                displayAirflowPoints={displayAirflowPoints}
                maxRoastSeconds={maxRoastSeconds}
                lastAnnotationIndex={lastAnnotationIndex}
                addAirflowPoint={addAirflowPoint}
                setAirflowTimeSeconds={setAirflowTimeSeconds}
                airflowRawToPercent={airflowRawToPercent}
                airflowPercentToRaw={airflowPercentToRaw}
                updateAirflowPoint={updateAirflowPoint}
                removeAirflowPoint={removeAirflowPoint}
            />

            {profile.roast_markers && profile.roast_markers.length > 0 && (
                <Box sx={{ mb: 2, p: 2, background: "#fafafa", borderRadius: 1 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                        Roast Stages
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        {profile.roast_markers.map((m: any, i: number) => (
                            <Box
                                key={i}
                                sx={{ display: "flex", justifyContent: "space-between" }}
                            >
                                <div>
                                    <strong>{m.label || m.stage}</strong>
                                </div>
                                <div style={{ color: "text.secondary" }}>
                                    {typeof m.time_raw === "number"
                                        ? `${Math.floor(m.time_raw / 10 / 60)}:${String(
                                              Math.round((m.time_raw / 10) % 60),
                                          ).padStart(2, "0")} min`
                                        : "-"}
                                </div>
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}

            {!isValid && (
                <Box sx={{ mb: 2 }}>
                    {validationErrors.map((err, i) => (
                        <Typography key={i} color="error" variant="body2">
                            {err}
                        </Typography>
                    ))}
                </Box>
            )}

            <Accordion
                sx={{ mt: 1 }}
                defaultExpanded={false}
                TransitionProps={{ unmountOnExit: true }}
            >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="body2">Parsed profile (debug)</Typography>
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
                        {JSON.stringify(profile, null, 2)}
                    </Box>
                </AccordionDetails>
            </Accordion>
        </>
    );
}
