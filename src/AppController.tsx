import { useEffect, useReducer, useRef, useState } from "react";
import protobuf from "protobufjs";
import Badge from "@mui/material/Badge";
import Container from "@mui/material/Container";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { BlePanel } from "./components/sections/BlePanel";
// using Ikawa defaults only (monotone interpolation)
import {
    MAX_AIRFLOW_POINTS,
    MAX_AIRFLOW_RAW,
    MAX_COOLDOWN_SECONDS,
    MAX_RAW_Y,
    MAX_ROAST_SECONDS,
    MAX_TEMP_CELSIUS,
    META_AIRFLOW_MAX_RAW,
    META_AIRFLOW_MIN_RAW,
    MIN_AIRFLOW_RAW,
    MIN_COOLDOWN_SECONDS,
    MIN_TEMP_CELSIUS,
    WARN_TEMP_CELSIUS,
    MAX_TEMP_POINTS,
} from "./rules";
import {
    normalizeBase64String,
    base64ToUint8Array,
    uint8ArrayToBase64,
} from "./utils/base64";
import {
    calculateMetaPoints,
    clampMetaPoints,
    alignLastAirflowPoint,
    normalizePoints,
    derivePointsFromWire,
} from "./utils/points";
import { generateDeviceToken } from "./utils/deviceToken";
import { toProtoProfile } from "./utils/encode";
import { isProLikeProfile } from "./utils/detect";
import {
    downsampleCurvePoints,
    downsampleAirflow,
} from "./utils/downsample";
import {
    extractBase64Candidates as extractBase64CandidatesService,
    transformGuess as transformGuessService,
    tryParseInputToObject as tryParseInputToObjectService,
    wireDecodeMessage as wireDecodeMessageService,
} from "./services/protobufService";
import { useProfileParser } from "./hooks/useProfileParser";
import { useProfileDirty } from "./hooks/useProfileDirty";
import { useChartDrag } from "./hooks/useChartDrag";
import { ParseDialog } from "./components/modals/ParseDialog";
import { NewProfileDialog } from "./components/modals/NewProfileDialog";
import { ProConvertDialog } from "./components/modals/ProConvertDialog";
import { OpenInAppDialog } from "./components/modals/OpenInAppDialog";
import { AppHeader } from "./components/layout/AppHeader";
import { OpenInAppFab } from "./components/layout/OpenInAppFab";
import { WelcomePanel } from "./components/sections/WelcomePanel";
import { ProfileEditor } from "./components/sections/ProfileEditor";
import { BLE_DIRECT_SEND_ENABLED } from "./ble/constants";
import {
    IkawaClient,
    normalizeTelemetrySample,
    type AppProfileLike,
    type DeviceRoastProfileLike,
    type RoastTelemetrySample,
    mapDeviceProfileToAppProfile,
    mapProfileToDeviceProfile,
} from "@freekawa/ikawa-home-protocol";
import { IkawaBleTransport } from "@freekawa/ikawa-home-web-bluetooth";
import type { IkawaProfile, Point } from "./types/profile";
import {
    NEW_PROFILE_TEMPLATES,
    type NewProfileTemplateId,
} from "./data/newProfileTemplates";
import {
    appReducer,
    initialAppState,
    type AppState,
} from "./app/reducer";
import {
    selectMenuOpen,
    selectProfileDirty,
    selectTempUnitLabel,
} from "./app/selectors";
// removed unused FormControl/Select imports
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip as ChartTooltip,
    Legend,
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    ChartTooltip,
    Legend,
);

const airflowCrosshairPlugin = {
    id: "airflowCrosshair",
    afterDatasetsDraw(chart: any, _args: any, opts: any) {
        const info = opts?.info;
        if (!info || !chart?.scales?.x || !chart?.scales?.air) return;
        const { rawX, rawY, percent } = info;
        if (!Number.isFinite(rawX) || !Number.isFinite(rawY)) return;
        const xScale = chart.scales.x;
        const yScale = chart.scales.air;
        const xVal = rawX / 10;
        const yVal = rawY / 10;
        const xPx = xScale.getPixelForValue(xVal);
        const yPx = yScale.getPixelForValue(yVal);
        const ctx = chart.ctx;
        ctx.save();
        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = "rgba(60,60,60,0.8)";
        ctx.lineWidth = 1;
        // vertical line
        ctx.beginPath();
        ctx.moveTo(xPx, yScale.top);
        ctx.lineTo(xPx, yScale.bottom);
        ctx.stroke();
        // horizontal line
        ctx.beginPath();
        ctx.moveTo(xScale.left, yPx);
        ctx.lineTo(xScale.right, yPx);
        ctx.stroke();

        const label = `${percent}%`;
        ctx.setLineDash([]);
        ctx.fillStyle = "rgba(0,0,0,0.75)";
        ctx.font = "12px sans-serif";
        const pad = 4;
        const textW = ctx.measureText(label).width;
        const boxW = textW + pad * 2;
        const boxH = 16;
        const boxX = Math.min(
            Math.max(xPx + 6, xScale.left + 2),
            xScale.right - boxW - 2,
        );
        const boxY = Math.min(
            Math.max(yPx - boxH - 6, yScale.top + 2),
            yScale.bottom - boxH - 2,
        );
        ctx.fillRect(boxX, boxY, boxW, boxH);
        ctx.fillStyle = "white";
        ctx.fillText(label, boxX + pad, boxY + 12);
        ctx.restore();
    },
};

const tempWarnBandPlugin = {
    id: "tempWarnBand",
    beforeDraw(chart: any, _args: any, opts: any) {
        const warnC = opts?.warnC;
        if (!Number.isFinite(warnC)) return;
        const yScale = chart?.scales?.y;
        if (!yScale || !chart?.ctx) return;
        const top = yScale.getPixelForValue(yScale.max);
        const warn = yScale.getPixelForValue(warnC);
        if (!Number.isFinite(top) || !Number.isFinite(warn)) return;
        const { left, right } = chart.chartArea;
        const ctx = chart.ctx;
        ctx.save();
        ctx.fillStyle = "rgba(255,165,0,0.3)";
        ctx.fillRect(left, top, right - left, warn - top);
        ctx.strokeStyle = "rgba(255,140,0,0.8)";
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(left, warn);
        ctx.lineTo(right, warn);
        ctx.stroke();
        ctx.restore();
    },
};

ChartJS.register(airflowCrosshairPlugin, tempWarnBandPlugin);

const PROTO_PATH = `${import.meta.env.BASE_URL}proto/ikawa_profile.proto`;

// Extract roast markers from a guessed/decoded profile object
// Roast markers are typically not directly present in the wire format
// but can be inferred from meta_points or other fields
function extractRoastMarkersFromGuessed(_obj: Record<string, unknown>) {
    // For now, return empty array as roast markers are optional
    // and typically not encoded in the profile data
    // They may be added by the app based on temperature curve analysis
    return [];
}

// Calculate meta_points (roast end marker) based on curve_points
// Analysis of 100 Ikawa profiles shows:
// - Meta point time = last curve point time × 1.22 (average ratio)
// - Meta point Y value = 200 (average from 100 profiles analysis)
// - Range: ratio 1.15-1.33, offset 65-122 seconds after last curve point

// Normalize metadata from either field 8 (nested Metadata) or fields 9/12 (flat strings)
function normalizeMetadata(obj: Record<string, any>) {
    // Field 8 can be either a nested Metadata message or a plain string.
    if (typeof obj.metadata === "string") {
        return {
            origin: obj.metadata,
        };
    }
    // Handle nested Metadata message (field 8) - 84% of profiles
    if (obj.metadata && typeof obj.metadata === "object") {
        // Check if it's a properly decoded Metadata object
        if (
            obj.metadata.share_token ||
            obj.metadata.shareToken ||
            obj.metadata.short_id ||
            obj.metadata.shortId
        ) {
            return {
                share_token:
                    obj.metadata.share_token || obj.metadata.shareToken,
                short_id: obj.metadata.short_id || obj.metadata.shortId,
                origin: obj.metadata.origin || obj.metadata.farm,
                spare: obj.metadata.spare,
                zero: obj.metadata.zero || 0,
            };
        }
        // Check metadata_nested format from wire decode
        if (
            obj.metadata_nested &&
            Array.isArray(obj.metadata_nested) &&
            obj.metadata_nested.length > 0
        ) {
            const md = obj.metadata_nested[0];
            return {
                share_token: md["1"]?.[0] || md["1"],
                short_id: md["2"]?.[0] || md["2"],
                origin: md["3"]?.[0] || md["3"],
                spare: md["4"]?.[0] || md["4"],
                zero: md["5"]?.[0] || md["5"] || 0,
            };
        }
    }
    // Fallback to fields 9/12 (16% of profiles)
    return {
        share_token: obj.extra_string_9 || obj.extraString9 || obj.field_9,
        zero: parseInt(
            obj.extra_string_12 || obj.extraString12 || obj.field_12 || "0",
            10,
        ),
    };
}

function toAppProfile(profile: IkawaProfile): AppProfileLike {
    return {
        version: profile.version,
        profileName: profile.profile_name,
        deviceToken: profile.device_token,
        curvePoints: profile.curve_points,
        airflowPoints: profile.annotations,
        cooldownPoints: profile.meta_points,
        metadata: {
            shareToken: profile.metadata.share_token,
            shortId: profile.metadata.short_id,
            origin: profile.metadata.origin,
            farm: profile.metadata.farm,
            spare: profile.metadata.spare,
            zero: profile.metadata.zero,
        },
    };
}

function fromAppProfile(profile: AppProfileLike): IkawaProfile {
    return {
        version: profile.version,
        profile_name: profile.profileName,
        device_token: profile.deviceToken,
        curve_points: profile.curvePoints,
        annotations: profile.airflowPoints,
        meta_points: profile.cooldownPoints,
        metadata: {
            share_token: profile.metadata.shareToken,
            short_id: profile.metadata.shortId,
            origin: profile.metadata.origin,
            farm: profile.metadata.farm,
            spare: profile.metadata.spare,
            zero: profile.metadata.zero,
        },
    };
}


interface AppControllerProps {
    themeMode: "light" | "dark";
    onToggleTheme: () => void;
}

export default function App({
    themeMode,
    onToggleTheme,
}: AppControllerProps) {
    // snap settings
    const SNAP_TIME_STEP_SECONDS = 1; // 1 second
    const [state, dispatch] = useReducer(appReducer, initialAppState);
    const {
        snapEnabled,
        newProfileModalOpen,
        messageType,
        profile,
        base64In,
        base64Valid,
        decodeError,
        wireFallbackAvailable,
        wireFallbackGuess,
        draggingIdx,
        dragInfo,
        draggingAirIdx,
        airDragInfo,
        parseOpen,
        tempUnit,
        menuAnchorEl,
        shareBase,
        profileDirty,
        lastParsedWasPro,
        isDownsampledForHome,
        proConvertModalOpen,
        openInAppModalOpen,
        openInAppUrl,
        openInAppSource,
    } = state;

    const setField =
        <K extends keyof AppState>(key: K) =>
        (value: AppState[K] | ((prev: AppState[K]) => AppState[K])) =>
            dispatch({
                type: "setField",
                key,
                value,
            } as any);
    const setSnapEnabled = setField("snapEnabled");
    const setNewProfileModalOpen = setField("newProfileModalOpen");
    const setMessageType = setField("messageType");
    const setProfile = setField("profile");
    const setBase64In = setField("base64In");
    const setBase64Valid = setField("base64Valid");
    const setDecodeError = setField("decodeError");
    const setWireFallbackAvailable = setField("wireFallbackAvailable");
    const setWireFallbackGuess = setField("wireFallbackGuess");
    const setDraggingIdx = setField("draggingIdx");
    const setDragInfo = setField("dragInfo");
    const setDraggingAirIdx = setField("draggingAirIdx");
    const setAirDragInfo = setField("airDragInfo");
    const setParseOpen = setField("parseOpen");
    const setTempUnit = setField("tempUnit");
    const setMenuAnchorEl = setField("menuAnchorEl");
    const setShareBase = setField("shareBase");
    const setProfileDirty = setField("profileDirty");
    const setLastParsedWasPro = setField("lastParsedWasPro");
    const setIsDownsampledForHome = setField("isDownsampledForHome");
    const setProConvertModalOpen = setField("proConvertModalOpen");
    const setOpenInAppModalOpen = setField("openInAppModalOpen");
    const setOpenInAppUrl = setField("openInAppUrl");
    const setOpenInAppSource = setField("openInAppSource");

    const chartRef = useRef<any>(null);
    const lastParsedRef = useRef<string | null>(null);
    const lastParsedProfileRef = useRef<string | null>(null);
    const parseInputRef = useRef<HTMLInputElement | null>(null);
    const deviceTokenRegeneratedRef = useRef(false);
    const ikawaClientRef = useRef<IkawaClient | null>(null);
    const bleDisconnectCleanupRef = useRef<(() => void) | null>(null);
    const bleTelemetryIntervalRef = useRef<number | null>(null);
    const bleTelemetryBusyRef = useRef(false);
    const bleCommandQueueRef = useRef<Promise<void>>(Promise.resolve());
    const bleCommandActiveRef = useRef(false);
    const bleQueuedCommandCountRef = useRef(0);
    const [bleSupported] = useState(() => {
        return IkawaBleTransport.isSupported();
    });
    const [bleConnected, setBleConnected] = useState(false);
    const [bleBusy, setBleBusy] = useState(false);
    const [bleDeviceName, setBleDeviceName] = useState("");
    const [bleMtu, setBleMtu] = useState<number | null>(null);
    const [bleError, setBleError] = useState<string | null>(null);
    const [bleLastResponse, setBleLastResponse] = useState("");
    const [bleProfileSchema, setBleProfileSchema] = useState(1);
    const [bleLoadedProfile, setBleLoadedProfile] =
        useState<IkawaProfile | null>(null);
    const [bleTelemetryRunning, setBleTelemetryRunning] = useState(false);
    const [bleTelemetryBusy, setBleTelemetryBusy] = useState(false);
    const [bleTelemetryError, setBleTelemetryError] = useState<string | null>(
        null,
    );
    const [bleTelemetrySample, setBleTelemetrySample] =
        useState<RoastTelemetrySample | null>(null);
    const [bleTelemetryHistory, setBleTelemetryHistory] = useState<
        RoastTelemetrySample[]
    >([]);
    const [activeTab, setActiveTab] = useState<"editor" | "roaster">("editor");

    const stopTelemetryInterval = () => {
        if (bleTelemetryIntervalRef.current !== null) {
            window.clearInterval(bleTelemetryIntervalRef.current);
            bleTelemetryIntervalRef.current = null;
        }
        setBleTelemetryRunning(false);
    };

    const startTelemetryInterval = () => {
        if (bleTelemetryIntervalRef.current !== null) {
            return;
        }
        bleTelemetryIntervalRef.current = window.setInterval(() => {
            void handleBleTelemetryTick();
        }, 500);
        setBleTelemetryRunning(true);
    };

    const queueBleCommand = ({
        task,
        pauseTelemetry = false,
        setBusy = true,
        clearError = true,
    }: {
        task: () => Promise<void>;
        pauseTelemetry?: boolean;
        setBusy?: boolean;
        clearError?: boolean;
    }) => {
        const shouldResumeTelemetry =
            pauseTelemetry && bleTelemetryIntervalRef.current !== null;
        if (pauseTelemetry) {
            stopTelemetryInterval();
        }
        if (setBusy) {
            setBleBusy(true);
        }
        if (clearError) {
            setBleError(null);
        }

        bleQueuedCommandCountRef.current += 1;
        const run = async () => {
            bleQueuedCommandCountRef.current -= 1;
            bleCommandActiveRef.current = true;
            try {
                await task();
            } finally {
                bleCommandActiveRef.current = false;
            }
        };

        const queued = bleCommandQueueRef.current
            .catch(() => {
                // keep queue alive after a rejected command
            })
            .then(run);

        bleCommandQueueRef.current = queued;

        return queued
            .catch((error) => {
                setBleError(error instanceof Error ? error.message : String(error));
            })
            .finally(() => {
                if (setBusy) {
                    setBleBusy(false);
                }
                if (
                    shouldResumeTelemetry &&
                    bleTelemetryIntervalRef.current === null &&
                    bleConnected
                ) {
                    startTelemetryInterval();
                }
            });
    };

    // using Ikawa defaults only (monotone interpolation)
    const tension = 0.45;
    const cubicMode = "monotone"; // Ikawa default
    const pointRadius = 4;
    const airOpacity = 0.15;
    const tempUnitLabel = selectTempUnitLabel(tempUnit);
    const menuOpen = selectMenuOpen(menuAnchorEl);
    const tempToDisplay = (c: number) =>
        tempUnit === "C" ? c : c * (9 / 5) + 32;
    const tempToDisplayInt = (c: number) => Math.round(tempToDisplay(c));
    const displayToTempC = (v: number) =>
        tempUnit === "C" ? v : (v - 32) * (5 / 9);

    useEffect(() => {
        if (parseOpen && parseInputRef.current) {
            parseInputRef.current.focus();
        }
    }, [parseOpen]);

    useProfileDirty({
        profile,
        messageType,
        profileDirty,
        lastParsedProfileSnapshot: lastParsedProfileRef.current,
        deviceTokenRegeneratedRef,
        setProfileDirty,
        setProfile,
    });

    const isProfileDirtyNow = () => {
        return selectProfileDirty(profile, lastParsedProfileRef.current);
    };

    useEffect(() => {
        protobuf.load(PROTO_PATH).then((r) => {
            setMessageType(r.lookupType("ikawa.IkawaProfile"));
        });
    }, []);

    useEffect(() => {
        const client = new IkawaClient(new IkawaBleTransport());
        ikawaClientRef.current = client;
        bleDisconnectCleanupRef.current = client.onDisconnect(() => {
            setBleConnected(false);
            setBleMtu(null);
            setBleLoadedProfile(null);
            if (bleTelemetryIntervalRef.current !== null) {
                window.clearInterval(bleTelemetryIntervalRef.current);
                bleTelemetryIntervalRef.current = null;
            }
            setBleTelemetryRunning(false);
        });

        return () => {
            if (bleTelemetryIntervalRef.current !== null) {
                window.clearInterval(bleTelemetryIntervalRef.current);
                bleTelemetryIntervalRef.current = null;
            }
            bleDisconnectCleanupRef.current?.();
            client.destroy();
            ikawaClientRef.current = null;
        };
    }, []);

    useProfileParser({
        base64In,
        messageType,
        setBase64Valid,
        setDecodeError,
        setWireFallbackAvailable,
        setWireFallbackGuess,
    });

    // Show new profile modal
    const newProfile = () => {
        setNewProfileModalOpen(true);
    };

    // Create profile from selected baseline template
    const createProfileFromTemplate = (templateId: NewProfileTemplateId) => {
        const template = NEW_PROFILE_TEMPLATES.find(
            (item) => item.id === templateId,
        );
        if (!template) {
            console.error("Unknown template id:", templateId);
            return;
        }

        if (!messageType) {
            setDecodeError("Schema not loaded yet. Please try again.");
            return;
        }

        try {
            const res = tryParseInputToObject(template.roastProfileLink);
            const obj = res.obj as Record<string, any>;

            const curvePoints = normalizePoints(
                obj.curve_points || obj.curvePoints || [],
            );
            const annotations = normalizePoints(
                obj.annotations || obj.annotation || [],
            );
            const parsedMetaPoints = normalizePoints(
                obj.meta_points || obj.metaPoints || [],
            );
            const parsedMetadata = normalizeMetadata(obj);
            const lastCurveX = curvePoints[curvePoints.length - 1]?.x ?? 0;
            const metaPointsSource =
                parsedMetaPoints.length > 0
                    ? parsedMetaPoints
                    : calculateMetaPoints(curvePoints);

            // Import-safe fork mode: preserve template structure/context and
            // mint a fresh device token, but do not invent share IDs.
            // Synthetic share_token/short_id appears to make IKAWA Home ignore
            // import (likely unresolved cloud identity).
            const parsedFarm =
                "farm" in parsedMetadata ? parsedMetadata.farm : undefined;
            const forkedMetadata = {
                origin:
                    parsedMetadata.origin || parsedFarm || template.process,
                farm:
                    parsedFarm || parsedMetadata.origin || template.process,
                spare:
                    "spare" in parsedMetadata
                        ? parsedMetadata.spare || ""
                        : "",
                zero:
                    typeof parsedMetadata.zero === "number"
                        ? parsedMetadata.zero
                        : 0,
            };

            const p = {
                version: obj.version || 1,
                profile_name: template.name,
                device_token: generateDeviceToken(),
                curve_points: curvePoints,
                annotations: alignLastAirflowPoint(annotations, curvePoints) || [],
                meta_points: clampMetaPoints(
                    metaPointsSource,
                    MAX_ROAST_SECONDS * 10,
                    lastCurveX,
                    MIN_COOLDOWN_SECONDS * 10,
                    true,
                    META_AIRFLOW_MIN_RAW,
                    META_AIRFLOW_MAX_RAW,
                    MAX_COOLDOWN_SECONDS * 10,
                ),
                metadata: forkedMetadata,
                _cooldownMinEnforced: true,
            };

            setProfile(p);
            setShareBase("https://share.ikawa.support/profile_home/?");
            setDecodeError(null);
            lastParsedProfileRef.current = null;
            deviceTokenRegeneratedRef.current = false;
            setProfileDirty(true);
            setLastParsedWasPro(false);
            setIsDownsampledForHome(true);
            setBase64In("");
            setNewProfileModalOpen(false);
        } catch (err) {
            console.error("Failed to create profile from template:", err);
            setDecodeError("Failed to load selected template.");
        }
    };

    const extractBase64Candidates = (s: string) =>
        extractBase64CandidatesService(s);

    const tryParseInputToObject = (s: string) => {
        if (!messageType) throw new Error("Schema not loaded");
        return tryParseInputToObjectService(
            s,
            messageType,
            extractRoastMarkersFromGuessed,
        );
    };

    const wireDecodeMessage = (bytes: Uint8Array, depth = 0) =>
        wireDecodeMessageService(bytes, depth);

    const transformGuess = (decoded: Record<string, any>) =>
        transformGuessService(decoded);

    const parseBase64 = (input?: string) => {
        if (!messageType) return;
        try {
            const rawInput = (input ?? base64In).trim();
            // capture share base from input URL if present
            try {
                const u = new URL(rawInput);
                if (u.origin.includes("share.ikawa.support")) {
                    const base = `${u.origin}${u.pathname}?`;
                    setShareBase(base);
                    const isPro = u.pathname.includes("/profile/");
                    setLastParsedWasPro(isPro);
                    setIsDownsampledForHome(!isPro);
                    if (isPro) setProConvertModalOpen(true);
                }
            } catch (_) {
                // not a URL
            }
            const res = tryParseInputToObject(rawInput);
            const obj = res.obj as Record<string, any>;

            // Use helper functions for consistent normalization
            const curvePoints = normalizePoints(
                obj.curve_points || obj.curvePoints || [],
            );
            const annotations = normalizePoints(
                obj.annotations || obj.annotation || [],
            );
            const metaPoints = normalizePoints(
                obj.meta_points || obj.metaPoints || [],
            );
            const metadata = normalizeMetadata(obj);

            // attach roast markers if present on guessed object
            let roastMarkers = [];
            if (obj.roast_markers && Array.isArray(obj.roast_markers)) {
                roastMarkers = obj.roast_markers.map((m: any) => ({
                    time_raw: Number(m.time_raw),
                    label: m.label || "",
                    stage: m.stage || "UNKNOWN",
                }));
            } else {
                // try to extract from other fields heuristically
                roastMarkers = extractRoastMarkersFromGuessed(obj);
            }

            const normalized = {
                version: obj.version || 1,
                profile_name:
                    obj.profile_name || obj.profileName || obj.profile || "",
                device_token:
                    obj.device_token ||
                    obj.deviceToken ||
                    obj.device ||
                    undefined,
                curve_points: curvePoints,
                annotations:
                    alignLastAirflowPoint(annotations, curvePoints) || [],
                meta_points: clampMetaPoints(
                    metaPoints,
                    MAX_ROAST_SECONDS * 10,
                    curvePoints[curvePoints.length - 1]?.x ?? 0,
                    MIN_COOLDOWN_SECONDS * 10,
                    true,
                    META_AIRFLOW_MIN_RAW,
                    META_AIRFLOW_MAX_RAW,
                    MAX_COOLDOWN_SECONDS * 10,
                ),
                metadata: metadata,
                roast_markers: roastMarkers,
                _cooldownMinEnforced: true,
            };

            // If schema decode produced no points, try wire-format heuristic extraction
            if (
                normalized.curve_points.length === 0 &&
                normalized.annotations.length === 0 &&
                normalized.meta_points.length === 0
            ) {
                try {
                    const normalizedB64 = res.normalizedB64 || base64In.trim();
                    const u8 = base64ToUint8Array(normalizedB64);
                    const decoded = wireDecodeMessage(u8);
                    const derived = derivePointsFromWire(decoded);
                    if (derived) {
                        normalized.curve_points = derived.curve_points || [];
                        normalized.annotations = derived.annotations || [];
                        normalized.meta_points = derived.meta_points || [];
                    }
                } catch (_) {
                    // ignore and keep empty points
                }
            }

            setProfile(normalized);
            // update the input box with the normalized (clean) base64 for clarity
            setBase64In(res.normalizedB64 || "");
            setDecodeError(null);
            lastParsedRef.current = res.normalizedB64 || rawInput;
            lastParsedProfileRef.current = JSON.stringify(normalized);
            deviceTokenRegeneratedRef.current = false;
            setProfileDirty(false);
            // If input wasn't a Pro URL, infer Pro-ness from payload shape
            if (!rawInput.includes("share.ikawa.support/profile/?")) {
                const proLike = isProLikeProfile(normalized);
                setLastParsedWasPro(proLike);
                setIsDownsampledForHome(!proLike);
                if (proLike) setProConvertModalOpen(true);
            }
        } catch (e) {
            const msg = String(e);
            const hint =
                "Possible causes: you pasted a full share URL instead of the token, or the string contains URL-safe base64 / padding issues. Try pasting just the token after the '?' if problems persist.";
            setDecodeError(msg + " — " + hint);
            // fallback: try the legacy protobuf (if available), then wire-format parse
            try {
                const candidates = extractBase64Candidates(base64In.trim());
                for (const token of candidates) {
                    try {
                        const normalized = normalizeBase64String(token);
                        const u8 = base64ToUint8Array(normalized);

                        // schema-free wire decode as last resort
                        const decoded = wireDecodeMessage(u8);
                        const guessed = transformGuess(decoded);
                        const normalizedObj = { ...guessed };
                        normalizedObj.profile_name =
                            guessed.profile_name || guessed.profile || "";
                        setProfile(normalizedObj);
                        setBase64In(normalized);
                        setDecodeError(null);
                        return;
                    } catch (inner) {
                        // continue to next candidate
                    }
                }
            } catch (tErr) {
                // ignore
            }
        }
    };

    const encodeProfileRaw = (
        p: Record<string, any> | null,
        opts: Record<string, any> = {},
    ) => {
        if (!p || !messageType) return null;
        try {
            const maybe = messageType.fromObject(
                toProtoProfile(p, opts) || {},
            );
            const buf = messageType.encode(maybe).finish();
            return uint8ArrayToBase64(buf);
        } catch (_) {
            return null;
        }
    };

    const getEncodedToken = () => {
        const dirtyNow = isProfileDirtyNow();
        const b64 = encodeProfileRaw(profile, { stripMetadata: false });
        if (!b64)
            return {
                token: lastParsedRef.current || null,
                source: "original (encode failed)",
            };
        if (
            lastParsedRef.current &&
            !dirtyNow &&
            b64 === lastParsedRef.current
        ) {
            return { token: lastParsedRef.current, source: "original" };
        }
        return { token: b64, source: "re-encoded" };
    };

    const points =
        profile && profile.curve_points
            ? profile.curve_points.map((p: any, i: number) => ({
                  index: i,
                  x: p.x,
                  y: p.y,
              }))
            : [];

    const airflowPoints =
        profile && profile.annotations
            ? profile.annotations.map((p: any, i: number) => ({
                  index: i,
                  x: p.x,
                  y: p.y,
              }))
            : [];

    const metaAirflowPoint =
        profile && Array.isArray(profile.meta_points)
            ? profile.meta_points[0]
            : null;

    const airflowRawToPercent = (raw: number) => {
        const v = Number(raw);
        if (!Number.isFinite(v)) return 0;
        return Math.max(
            0,
            Math.min(100, Math.round((v / MAX_AIRFLOW_RAW) * 100)),
        );
    };

    const airflowPercentToRaw = (pct: number) => {
        const v = Number(pct);
        if (!Number.isFinite(v)) return 0;
        const clamped = Math.max(0, Math.min(100, v));
        return Math.round((clamped / 100) * MAX_AIRFLOW_RAW);
    };

    const displayAirflowPoints = (() => {
        const pts: Array<{
            index: number;
            x: number;
            y: number;
            source: "annotation" | "meta";
        }> = airflowPoints.map((p: any) => ({
            ...p,
            source: "annotation" as const,
        }));
        if (metaAirflowPoint && Number.isFinite(Number(metaAirflowPoint.x))) {
            pts.push({
                index: pts.length,
                x: metaAirflowPoint.x,
                y: metaAirflowPoint.y,
                    source: "meta" as const,
            });
        }
        return pts;
    })();

    const lastAnnotationIndex = Math.max(
        0,
        (profile?.annotations?.length || 0) - 1,
    );

    // normalize numeric values to avoid NaN and rendering issues
    const numericPoints = points.map((p: any) => ({
        x: Number(p.x || 0),
        y: Number(p.y || 0),
    }));

    const numericAir = displayAirflowPoints.map((p: any) => ({
        x: Number(p.x || 0),
        y: Number(p.y || 0),
    }));

    // Build Chart.js data using numeric x (seconds) so we can overlay airflow
    // Add marker datasets: each roast marker is represented as a vertical dotted line
    const markerDatasets = (profile?.roast_markers || []).map(
        (m: any, i: number) => {
        const secs = (Number(m.time_raw) || 0) / 10;
        const color =
            m.stage === "FIRST_CRACK"
                ? "white"
                : m.stage === "YELLOWING"
                  ? "gold"
                  : m.stage === "DEVELOPMENT"
                    ? "cyan"
                    : m.stage === "COOL_DOWN"
                      ? "blue"
                      : "rgba(255,255,255,0.6)";
        return {
            label: `marker-${i}`,
            data: [
                { x: secs, y: 0 },
                { x: secs, y: MAX_TEMP_CELSIUS },
            ],
            parsing: true,
            showLine: true,
            fill: false,
            borderColor: color,
            borderWidth: 2,
            borderDash: [6, 6],
            pointRadius: 0,
            yAxisID: "y",
        };
        },
    );

    const chartData = {
        datasets: [
            {
                label: `Temp (${tempUnitLabel})`,
                data: numericPoints.map((p: any) => ({
                    x: p.x / 10,
                    y: tempToDisplayInt(p.y / 10),
                })),
                // parsing enabled so Chart.js uses the provided x/y values (seconds/°C)
                parsing: true,
                showLine: true,
                fill: false,
                borderColor: "rgb(255,99,132)",
                backgroundColor: "rgba(255,99,132,0.2)",
                tension: tension,
                cubicInterpolationMode: cubicMode,
                pointRadius: pointRadius,
            },
            {
                label: "Airflow",
                data: numericAir.map((p: any) => ({ x: p.x / 10, y: p.y / 10 })),
                // parsing enabled so Chart.js uses the provided x/y values (seconds/°C)
                parsing: true,
                showLine: true,
                fill: true,
                borderColor: "rgba(0,150,136,0.9)",
                backgroundColor: `rgba(0,150,136,${airOpacity})`,
                pointRadius: 3,
                yAxisID: "air",
            },
            ...markerDatasets,
        ],
    };

    // compute airflow y-axis max
    const maxAirY = Math.max(
        100,
        (numericAir.reduce((m, p) => Math.max(m, p.y / 10), 0) || 0) * 1.2,
    );

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        transitions: {
            active: { animation: { duration: 0 } },
            resize: { animation: { duration: 0 } },
            show: { animation: { duration: 0 } },
            hide: { animation: { duration: 0 } },
        },
        plugins: {
            legend: { display: false },
            airflowCrosshair: { info: airDragInfo },
            tempWarnBand: { warnC: tempToDisplayInt(WARN_TEMP_CELSIUS) },
            tooltip: {
                animation: false,
                callbacks: {
                    title: (items: any[]) => {
                        const xVal = Number(items?.[0]?.parsed?.x || 0);
                        const mins = Math.floor(xVal / 60);
                        const secs = Math.round(xVal % 60)
                            .toString()
                            .padStart(2, "0");
                        return `${mins}:${secs}`;
                    },
                    label: (ctx: any) => {
                        const label = ctx.dataset?.label || "";
                        if (label === "Airflow") {
                            const raw = Number(ctx.parsed?.y || 0) * 10;
                            const pct = Math.round(
                                (raw / MAX_AIRFLOW_RAW) * 100,
                            );
                            return `Airflow: ${pct}%`;
                        }
                        if (label.startsWith("Temp")) {
                            const t = Math.round(Number(ctx.parsed?.y || 0));
                            return `Temp: ${t}${tempUnitLabel}`;
                        }
                        return `${label}: ${ctx.parsed?.y ?? ""}`;
                    },
                },
            },
        },
        interaction: {
            mode: "nearest",
            intersect: false,
        },
        scales: {
            x: {
                type: "linear",
                title: { display: true, text: "Time" },
                ticks: {
                    callback: function (val: any, _idx: any, _values: any) {
                        const s = Number(val);
                        if (isNaN(s)) return val;
                        const m = Math.floor(s / 60);
                        const sec = Math.round(s % 60)
                            .toString()
                            .padStart(2, "0");
                        return `${m}:${sec}`;
                    },
                },
            },
            y: {
                title: {
                    display: true,
                    text: `Temperature (${tempUnitLabel})`,
                },
                min: tempToDisplayInt(0),
                max: tempToDisplayInt(MAX_TEMP_CELSIUS),
                ticks: { stepSize: 25 },
            },
            air: { display: false, position: "right", min: 0, max: maxAirY },
        },
    };

    // Update a single curve point using a functional state update to avoid stale closures
    // Also recalculates meta_points when the last curve point changes
    // Auto-aligns last airflow point when last curve point's x changes
    const updateCurvePoint = (
        idx: number,
        field: "x" | "y",
        val: number,
    ) => {
        if (idx === 0) return;
        const maxRawX = MAX_ROAST_SECONDS * 10;
        setProfile((prev: any) => {
            const p = { ...prev };
            const curvePointsLength = (p.curve_points || []).length;
            const isLastPoint = idx === curvePointsLength - 1;
            const prevX = p.curve_points?.[idx - 1]?.x ?? 0;
            const nextX =
                p.curve_points?.[idx + 1]?.x ?? Number.POSITIVE_INFINITY;
            const enforceMinCooldown = Boolean(p._cooldownMinEnforced);
            const minDeltaRaw = snapEnabled ? SNAP_TIME_STEP_SECONDS * 10 : 1;

            p.curve_points = (p.curve_points || []).map(
                (pt: any, i: number) =>
                i === idx
                    ? {
                          ...pt,
                          [field]:
                              field === "x"
                                  ? Math.max(
                                        prevX + minDeltaRaw,
                                        Math.min(
                                            Number(val),
                                            maxRawX,
                                            nextX - minDeltaRaw,
                                        ),
                                    )
                                  : Math.max(
                                        MIN_TEMP_CELSIUS * 10,
                                        Math.min(Number(val), MAX_RAW_Y),
                                    ),
                      }
                    : pt,
            );
            // Recalculate meta_points based on updated curve_points
            p.meta_points = clampMetaPoints(
                calculateMetaPoints(p.curve_points),
                maxRawX,
                p.curve_points[curvePointsLength - 1]?.x ?? 0,
                MIN_COOLDOWN_SECONDS * 10,
                enforceMinCooldown,
                META_AIRFLOW_MIN_RAW,
                META_AIRFLOW_MAX_RAW,
                MAX_COOLDOWN_SECONDS * 10,
            );

            // Auto-align last airflow point when last curve point's x changes
            if (isLastPoint && field === "x") {
                p.annotations = alignLastAirflowPoint(
                    p.annotations,
                    p.curve_points,
                );
            }
            return p;
        });
    };

    // Update both x and y at once to avoid race conditions when dragging
    // Also recalculates meta_points when the last curve point changes
    // Auto-aligns last airflow point when last curve point is dragged
    const updateCurvePointXY = (idx: number, rawX: number, rawY: number) => {
        if (idx === 0) return;
        const maxRawX = MAX_ROAST_SECONDS * 10;
        const clampedY = Math.max(MIN_TEMP_CELSIUS * 10, Math.min(Number(rawY), MAX_RAW_Y));
        setProfile((prev: any) => {
            const p = { ...prev };
            const curvePointsLength = (p.curve_points || []).length;
            const isLastPoint = idx === curvePointsLength - 1;
            const enforceMinCooldown = Boolean(p._cooldownMinEnforced);
            const prevX = p.curve_points?.[idx - 1]?.x ?? 0;
            const nextX =
                p.curve_points?.[idx + 1]?.x ?? Number.POSITIVE_INFINITY;
            const minDeltaRaw = snapEnabled ? SNAP_TIME_STEP_SECONDS * 10 : 1;
            const clampedX = Math.max(
                prevX + minDeltaRaw,
                Math.min(Number(rawX), maxRawX, nextX - minDeltaRaw),
            );

            p.curve_points = (p.curve_points || []).map(
                (pt: any, i: number) =>
                i === idx ? { ...pt, x: clampedX, y: clampedY } : pt,
            );
            // Recalculate meta_points based on updated curve_points
            p.meta_points = clampMetaPoints(
                calculateMetaPoints(p.curve_points),
                maxRawX,
                p.curve_points[curvePointsLength - 1]?.x ?? 0,
                MIN_COOLDOWN_SECONDS * 10,
                enforceMinCooldown,
                META_AIRFLOW_MIN_RAW,
                META_AIRFLOW_MAX_RAW,
                MAX_COOLDOWN_SECONDS * 10,
            );

            // Auto-align last airflow point when last curve point is dragged
            if (isLastPoint) {
                p.annotations = alignLastAirflowPoint(
                    p.annotations,
                    p.curve_points,
                );
            }
            return p;
        });
    };

    // helpers to set time (seconds) and temp (degrees) from user-friendly inputs
    const setPointTimeSeconds = (idx: number, secVal: string) => {
        if (idx === 0) return;
        let secs = Number(secVal);
        if (Number.isNaN(secs)) return;
        secs = Math.round(secs);
        const raw = Math.round(secs * 10);

        updateCurvePoint(idx, "x", raw);
    };

    const setPointTempDegrees = (idx: number, degVal: string) => {
        if (idx === 0) return;
        let displayVal = Number(degVal);
        if (Number.isNaN(displayVal)) return;
        if (snapEnabled) displayVal = Math.round(displayVal);
        const celsius = Math.max(MIN_TEMP_CELSIUS, Math.min(displayToTempC(displayVal), MAX_TEMP_CELSIUS));
        const raw = Math.round(celsius * 10);
        updateCurvePoint(idx, "y", raw);
    };

    const setAirflowTimeSeconds = (
        idx: number,
        secVal: string,
        source: "annotation" | "meta" = "annotation",
    ) => {
        if (idx === 0 && source !== "meta") return;
        let secs = Number(secVal);
        if (Number.isNaN(secs)) return;
        secs = Math.round(secs);
        const raw = Math.round(secs * 10);
        updateAirflowPoint(idx, "x", raw, source);
    };

    const updateAirflowPoint = (
        idx: number,
        field: "x" | "y",
        val: number,
        source: "annotation" | "meta" = "annotation",
    ) => {
        const p = { ...profile };
        const maxRawX = MAX_ROAST_SECONDS * 10;
        const lastCurveX = p?.curve_points?.[p.curve_points.length - 1]?.x ?? 0;
        if (source === "meta") {
            const enforceMinCooldown = Boolean(p._cooldownMinEnforced);
            const minMetaX = enforceMinCooldown
                ? lastCurveX + MIN_COOLDOWN_SECONDS * 10
                : 0;
            const maxMetaX = Math.min(
                maxRawX,
                lastCurveX + MAX_COOLDOWN_SECONDS * 10,
            );
            const raw =
                field === "y"
                    ? enforceMinCooldown
                        ? Math.max(
                              META_AIRFLOW_MIN_RAW,
                              Math.min(Number(val), META_AIRFLOW_MAX_RAW),
                          )
                        : Math.max(0, Math.min(Number(val), MAX_AIRFLOW_RAW))
                    : Math.max(minMetaX, Math.min(Number(val), maxMetaX));
            const mp = Array.isArray(p.meta_points) ? p.meta_points : [];
            if (mp.length === 0) {
                p.meta_points = [{ x: raw, y: 0 }];
            } else {
                p.meta_points = mp.map((pt: any, i: number) =>
                    i === 0 ? { ...pt, [field]: raw } : pt,
                );
            }
        } else {
            p.annotations = (p.annotations || []).map((pt: any, i: number) =>
                i === idx
                    ? {
                          ...pt,
                          [field]:
                              field === "x"
                                  ? i === lastAnnotationIndex
                                      ? lastCurveX
                                      : Math.min(Number(val), maxRawX)
                                  : Math.max(
                                        MIN_AIRFLOW_RAW,
                                        Math.min(Number(val), MAX_AIRFLOW_RAW),
                                    ),
                      }
                    : pt,
            );
        }
        setProfile(p);
    };

    const updateAirflowPointXY = (
        idx: number,
        rawX: number,
        rawY: number,
        source: "annotation" | "meta" = "annotation",
    ) => {
        const maxRawX = MAX_ROAST_SECONDS * 10;
        setProfile((prev: any) => {
            const p = { ...prev };
            const lastCurveX =
                p?.curve_points?.[p.curve_points.length - 1]?.x ?? 0;
            if (source === "meta") {
                const enforceMinCooldown = Boolean(p._cooldownMinEnforced);
                const minMetaX = enforceMinCooldown
                    ? lastCurveX + MIN_COOLDOWN_SECONDS * 10
                    : 0;
                const xVal = Math.max(minMetaX, Math.min(rawX, maxRawX));
                const yVal = enforceMinCooldown
                    ? Math.max(
                          META_AIRFLOW_MIN_RAW,
                          Math.min(rawY, META_AIRFLOW_MAX_RAW),
                      )
                    : Math.max(0, Math.min(rawY, MAX_AIRFLOW_RAW));
                const mp = Array.isArray(p.meta_points) ? p.meta_points : [];
                if (mp.length === 0) {
                    p.meta_points = [{ x: xVal, y: yVal }];
                } else {
                    p.meta_points = mp.map((pt: any, i: number) =>
                        i === 0 ? { ...pt, x: xVal, y: yVal } : pt,
                    );
                }
                return p;
            }

            p.annotations = (p.annotations || []).map((pt: any, i: number) =>
                i === idx
                    ? {
                          ...pt,
                          x:
                              i === lastAnnotationIndex
                                  ? lastCurveX
                                  : Math.min(rawX, maxRawX),
                          y: Math.max(MIN_AIRFLOW_RAW, Math.min(rawY, MAX_AIRFLOW_RAW)),
                      }
                    : pt,
            );
            return p;
        });
    };

    const {
        handlePointerDown,
        handlePointerMove,
        handleAirPointerMove,
        handlePointerUp,
    } = useChartDrag({
        chartRef,
        profile,
        displayAirflowPoints,
        lastAnnotationIndex,
        draggingIdx,
        draggingAirIdx,
        snapEnabled,
        snapTimeStepSeconds: SNAP_TIME_STEP_SECONDS,
        maxRoastSeconds: MAX_ROAST_SECONDS,
        maxRawY: MAX_RAW_Y,
        maxAirflowRaw: MAX_AIRFLOW_RAW,
        setDraggingIdx,
        setDragInfo,
        setDraggingAirIdx,
        setAirDragInfo,
        updateCurvePointXY,
        updateAirflowPointXY,
        displayToTempC,
        airflowRawToPercent,
    });

    const addPoint = () => {
        const p = { ...(profile || {}) };
        const cur = p.curve_points || [];
        const enforceMinCooldown = Boolean(p._cooldownMinEnforced);
        if (cur.length >= MAX_TEMP_POINTS) {
            alert(`Max ${MAX_TEMP_POINTS} temperature points allowed`);
            return;
        }

        // Calculate smart position for new point:
        // - Time: 30 seconds after the last point (or at 60s if no points)
        // - Temp: Same as last point (or 200°C if no points)
        let newX, newY;
        if (cur.length > 0) {
            const lastPoint = cur[cur.length - 1];
            const lastX = Number(lastPoint.x || 0);
            const lastY = Number(lastPoint.y || 2000);
            // Add 30 seconds (300 raw units) after last point
            newX = Math.min(lastX + 300, MAX_ROAST_SECONDS * 10);
            // Keep same temperature as last point
            newY = lastY;
        } else {
            // Default: 60 seconds, 200°C
            newX = 600;
            newY = 2000;
        }

        p.curve_points = [...cur, { x: newX, y: newY }];
        // Recalculate meta_points based on updated curve_points
        p.meta_points = clampMetaPoints(
            calculateMetaPoints(p.curve_points),
            MAX_ROAST_SECONDS * 10,
            p.curve_points[p.curve_points.length - 1]?.x ?? 0,
            MIN_COOLDOWN_SECONDS * 10,
            enforceMinCooldown,
            META_AIRFLOW_MIN_RAW,
            META_AIRFLOW_MAX_RAW,
            MAX_COOLDOWN_SECONDS * 10,
        );
        // Auto-align last airflow point to new last curve point time
        p.annotations = alignLastAirflowPoint(p.annotations, p.curve_points);
        setProfile(p);
    };

    const addAirflowPoint = () => {
        const p = { ...(profile || {}) };
        const cur = p.annotations || [];
        if (cur.length >= MAX_AIRFLOW_POINTS) return;
        if (cur.length === 1) {
            const start = cur[0];
            const lastCurveX =
                p.curve_points?.[p.curve_points.length - 1]?.x ?? 0;
            const endX =
                lastCurveX > Number(start?.x || 0)
                    ? lastCurveX
                    : Math.min(
                          Number(start?.x || 0) + 300,
                          MAX_ROAST_SECONDS * 10,
                      );
            const midX = Math.round(
                (Number(start?.x || 0) + Number(endX || 0)) / 2,
            );
            const yVal = Number(start?.y ?? 0);
            p.annotations = [
                { x: Number(start?.x || 0), y: yVal },
                { x: midX, y: yVal },
                { x: endX, y: yVal },
            ];
        } else if (cur.length >= 2) {
            const last = cur[cur.length - 1];
            const prev = cur[cur.length - 2];
            const midX = Math.round(
                (Number(prev?.x || 0) + Number(last?.x || 0)) / 2 || 0,
            );
            const midY = Number(prev?.y ?? last?.y ?? 0);
            p.annotations = [
                ...cur.slice(0, cur.length - 1),
                { x: midX, y: midY },
                last,
            ];
        } else {
            p.annotations = [...cur, { x: 0, y: 0 }];
        }
        setProfile(p);
    };

    const removePoint = (idx: number) => {
        if (idx === 0) {
            alert("Cannot remove the starting point (fixed at 50°C)");
            return;
        }
        const p = { ...profile };
        const enforceMinCooldown = Boolean(p._cooldownMinEnforced);
        p.curve_points = (p.curve_points || []).filter(
            (_: any, i: number) => i !== idx,
        );
        // Recalculate meta_points based on updated curve_points
        p.meta_points = clampMetaPoints(
            calculateMetaPoints(p.curve_points),
            MAX_ROAST_SECONDS * 10,
            p.curve_points[p.curve_points.length - 1]?.x ?? 0,
            MIN_COOLDOWN_SECONDS * 10,
            enforceMinCooldown,
            META_AIRFLOW_MIN_RAW,
            META_AIRFLOW_MAX_RAW,
            MAX_COOLDOWN_SECONDS * 10,
        );
        // Auto-align last airflow point to new last curve point time
        p.annotations = alignLastAirflowPoint(p.annotations, p.curve_points);
        setProfile(p);
    };
    const removeAirflowPoint = (idx: number) => {
        const p = { ...profile };
        p.annotations = (p.annotations || []).filter(
            (_: any, i: number) => i !== idx,
        );
        setProfile(p);
    };

    const downloadEncoded = () => {
        if (!messageType) {
            alert("Schema not loaded yet — try again in a moment.");
            return;
        }
        const res = getEncodedToken();
        if (!res?.token) return;
        const base = shareBase || "https://share.ikawa.support/profile_home/?";
        const url = `${base}${res.token}`;
        setOpenInAppUrl(url);
        setOpenInAppSource(res.source);
        setOpenInAppModalOpen(true);
    };

    const convertProToHome = () => {
        if (!profile) return;
        const p = { ...profile };
        // force start at 0s, 50°C and add early point at 10s with Pro start temp
        const curve = normalizePoints(p.curve_points || []);
        if (curve.length === 0) return;
        const proStart = curve[0] || { x: 0, y: 500 };
        const firstAfterStart = curve[1];
        let earlyY = Number(proStart.y || 500);
        if (
            firstAfterStart &&
            Number(firstAfterStart.y) < Number(proStart.y)
        ) {
            earlyY = Number(firstAfterStart.y);
        }
        let earlyPoint = { x: 100, y: earlyY };
        let restCurve = curve.slice(1);
        if (firstAfterStart && Number(firstAfterStart.x) <= 300) {
            earlyPoint = { x: Number(firstAfterStart.x), y: earlyY };
            restCurve = curve.slice(2);
        }
        const forcedCurve = [{ x: 0, y: 500 }, earlyPoint, ...restCurve];
        const downCurve = downsampleCurvePoints(forcedCurve, MAX_TEMP_POINTS);

        const ann = normalizePoints(p.annotations || []);
        const downAir = downsampleAirflow(ann, MAX_AIRFLOW_POINTS);
        const alignedAir = alignLastAirflowPoint(downAir, downCurve);

        const meta = clampMetaPoints(
            normalizePoints(p.meta_points || []),
            MAX_ROAST_SECONDS * 10,
            downCurve[downCurve.length - 1]?.x ?? 0,
            MIN_COOLDOWN_SECONDS * 10,
            true,
            META_AIRFLOW_MIN_RAW,
            META_AIRFLOW_MAX_RAW,
            MAX_COOLDOWN_SECONDS * 10,
        );

        const next = {
            ...p,
            profile_name: p.profile_name?.includes(" - Converted")
                ? p.profile_name
                : `${p.profile_name || "Untitled"} - Converted`,
            curve_points: downCurve,
            annotations: alignedAir,
            meta_points: meta,
            _cooldownMinEnforced: true,
        };
        setProfile(next);
        setShareBase("https://share.ikawa.support/profile_home/?");
        setLastParsedWasPro(false);
        setIsDownsampledForHome(true);
        setProConvertModalOpen(false);
    };

    const validateProfile = ({
        enforceHomeAirflowPointLimit,
    }: {
        enforceHomeAirflowPointLimit: boolean;
    }): string[] => {
        const errs: string[] = [];
        const cp = profile?.curve_points || [];
        const ap = profile?.annotations || [];
        if (cp.length > MAX_TEMP_POINTS)
            errs.push(`Too many temperature points (max ${MAX_TEMP_POINTS})`);
        if (enforceHomeAirflowPointLimit && ap.length > MAX_AIRFLOW_POINTS)
            errs.push(`Too many airflow points (max ${MAX_AIRFLOW_POINTS})`);
        const maxRawX = MAX_ROAST_SECONDS * 10;
        cp.forEach((pt: any, i: number) => {
            if (Number(pt.x) < 0 || Number(pt.x) > maxRawX)
                errs.push(
                    `Temp point ${i} time out of range (0 - ${MAX_ROAST_SECONDS}s)`,
                );
            if (Number(pt.y) < MIN_TEMP_CELSIUS * 10 || Number(pt.y) > MAX_RAW_Y)
                errs.push(
                    `Temp point ${i} temperature out of range (${MIN_TEMP_CELSIUS} - ${MAX_TEMP_CELSIUS}°C)`,
                );
        });
        ap.forEach((pt: any, i: number) => {
            if (Number(pt.x) < 0 || Number(pt.x) > maxRawX)
                errs.push(
                    `Airflow point ${i} time out of range (0 - ${MAX_ROAST_SECONDS}s)`,
                );
            if (Number(pt.y) < MIN_AIRFLOW_RAW || Number(pt.y) > MAX_AIRFLOW_RAW)
                errs.push(
                    `Airflow point ${i} value out of range (${MIN_AIRFLOW_RAW} - ${MAX_AIRFLOW_RAW})`,
                );
        });
        const mp = profile?.meta_points || [];
        const enforceMinCooldown = Boolean(profile?._cooldownMinEnforced);
        if (mp[0]?.x !== undefined) {
            if (Number(mp[0].x) < 0 || Number(mp[0].x) > maxRawX)
                errs.push(
                    `Cooldown airflow time out of range (0 - ${MAX_ROAST_SECONDS}s)`,
                );
            if (enforceMinCooldown) {
                const minMetaX =
                    (cp[cp.length - 1]?.x ?? 0) + MIN_COOLDOWN_SECONDS * 10;
                if (Number(mp[0].x) < minMetaX)
                    errs.push(
                        `Cooldown airflow must be at least ${MIN_COOLDOWN_SECONDS}s after final temp point`,
                    );
                if (
                    Number(mp[0].y) < META_AIRFLOW_MIN_RAW ||
                    Number(mp[0].y) > META_AIRFLOW_MAX_RAW
                )
                    errs.push(
                        `Cooldown airflow must be between ${META_AIRFLOW_MIN_RAW} and ${META_AIRFLOW_MAX_RAW}`,
                    );
            }
            const maxMetaX =
                (cp[cp.length - 1]?.x ?? 0) + MAX_COOLDOWN_SECONDS * 10;
            if (Number(mp[0].x) > maxMetaX)
                errs.push(
                    `Cooldown airflow must be within ${MAX_COOLDOWN_SECONDS}s of final temp point`,
                );
        }
        return errs;
    };

    const directValidationErrors = profile
        ? validateProfile({ enforceHomeAirflowPointLimit: false })
        : [];
    const homeValidationErrors = profile
        ? validateProfile({ enforceHomeAirflowPointLimit: true })
        : [];
    const homeOnlyValidationErrors = homeValidationErrors.filter(
        (error) => !directValidationErrors.includes(error),
    );
    const validationErrors = directValidationErrors;
    const isValid = validationErrors.length === 0;
    const canDirectBleSend = Boolean(profile) && isValid;
    const canOpenInHome =
        Boolean(profile) &&
        homeValidationErrors.length === 0 &&
        (!lastParsedWasPro || isDownsampledForHome);
    const openInAppDisabled = !profile || (!canDirectBleSend && !canOpenInHome);
    const homeExportReason =
        lastParsedWasPro && !isDownsampledForHome
            ? "This profile can be sent directly to the roaster, but IKAWA Home export still requires Pro → Home conversion because the share-link format expects Home limits and a 50C start."
            : homeOnlyValidationErrors.length > 0
              ? `This profile can still be sent directly to the roaster, but IKAWA Home export is blocked: ${homeOnlyValidationErrors[0]}`
            : !isValid
              ? "Fix the profile validation errors before exporting or sending."
              : "";
    const overlayProfile = bleLoadedProfile;
    const overlayProfileSourceLabel = bleLoadedProfile
        ? `Roaster${bleLoadedProfile.profile_name ? `: ${bleLoadedProfile.profile_name}` : ""}`
        : "None";
    const bleLoadedProfileOrigin =
        bleLoadedProfile?.metadata?.origin ||
        bleLoadedProfile?.metadata?.farm ||
        "";
    const canUseLoadedProfileInEditor = Boolean(bleLoadedProfile);
    const handleUseWireFallback = () => {
        const g = wireFallbackGuess?.guessed || {};
        const p = {
            ...(g || {}),
        };
        p.profile_name = g.profile_name || g.profile || "";
        setProfile(p);
        setBase64In(wireFallbackGuess?.normalized || base64In);
        setDecodeError(null);
        setWireFallbackAvailable(false);
        setWireFallbackGuess(null);
    };
    const handleClearParseDialog = () => {
        setBase64In("");
        setDecodeError(null);
        setWireFallbackAvailable(false);
        setWireFallbackGuess(null);
        setProfile(null);
        lastParsedRef.current = null;
        lastParsedProfileRef.current = null;
        deviceTokenRegeneratedRef.current = false;
        setProfileDirty(false);
        setLastParsedWasPro(false);
        setIsDownsampledForHome(true);
        setProConvertModalOpen(false);
    };
    const handleParseAndClose = () => {
        parseBase64();
        setParseOpen(false);
    };
    const handleCopyOpenInAppUrl = () => {
        if (openInAppUrl) {
            navigator.clipboard.writeText(openInAppUrl);
        }
    };
    const handleOpenInAppUrl = () => {
        if (openInAppUrl) {
            window.open(openInAppUrl, "_blank");
        }
    };
    const handleBleConnect = async () => {
        const client = ikawaClientRef.current;
        if (!client) return;
        await queueBleCommand({
            task: async () => {
            const device = await client.requestDevice();
            const transportState = await client.connect(device);
            setBleConnected(true);
            setBleDeviceName(transportState.deviceName || "IKAWA");
            setBleMtu(transportState.mtu);
            try {
                const response = await client.getProfile();
                const deviceProfile = response.respProfileGet as
                    | { profile?: Record<string, unknown> }
                    | undefined;
                if (deviceProfile?.profile) {
                    const mapped = fromAppProfile(
                        mapDeviceProfileToAppProfile(
                            deviceProfile.profile as DeviceRoastProfileLike,
                        ),
                    );
                    setBleLoadedProfile(mapped);
                    setBleLastResponse(
                        JSON.stringify(
                            {
                                connected: true,
                                loadedProfile: mapped.profile_name,
                            },
                            null,
                            2,
                        ),
                    );
                } else {
                    setBleLastResponse("Connected to roaster.");
                }
            } catch {
                setBleLastResponse("Connected to roaster.");
            }
            },
        });
    };
    const handleBleDisconnect = async () => {
        const client = ikawaClientRef.current;
        if (!client) return;
        stopTelemetryInterval();
        await queueBleCommand({
            task: async () => {
            await client.disconnect();
            setBleConnected(false);
            setBleMtu(null);
            setBleLastResponse("Disconnected.");
            },
        });
    };
    const handleBleGetMachineInfo = async () => {
        const client = ikawaClientRef.current;
        if (!client) return;
        await queueBleCommand({
            task: async () => {
            const bootloader = await client.getBootloaderVersion();
            const machineType = await client.getMachineType();
            const machineId = await client.getMachineId();
            const support = await client.getSupportInfo();
            const supportInfo = support.respMachPropGetSupportInfo as
                | { profileSchema?: number | string }
                | undefined;
            const reportedSchema = Number(supportInfo?.profileSchema);
            if (Number.isFinite(reportedSchema) && reportedSchema > 0) {
                setBleProfileSchema(reportedSchema);
            }
            setBleLastResponse(
                JSON.stringify(
                    {
                        bootloader,
                        machineType,
                        machineId,
                        support,
                    },
                    null,
                    2,
                ),
            );
            },
        });
    };
    const handleBleGetCurrentProfile = async () => {
        const client = ikawaClientRef.current;
        if (!client) return;
        await queueBleCommand({
            task: async () => {
            const response = await client.getProfile();
            const deviceProfile = response.respProfileGet as
                | { profile?: Record<string, unknown> }
                | undefined;
            if (!deviceProfile?.profile) {
                throw new Error("Roaster returned no profile payload");
            }
            const mapped = fromAppProfile(
                mapDeviceProfileToAppProfile(
                    deviceProfile.profile as DeviceRoastProfileLike,
                ),
            );
            setBleLoadedProfile(mapped);
            setBleLastResponse(
                JSON.stringify(
                    {
                        currentProfile: mapped,
                        response,
                    },
                    null,
                    2,
                ),
            );
            },
        });
    };
    const handleUseLoadedProfileInEditor = () => {
        if (!bleLoadedProfile) return;
        setProfile({
            ...bleLoadedProfile,
            curve_points: [...(bleLoadedProfile.curve_points || [])],
            annotations: [...(bleLoadedProfile.annotations || [])],
            meta_points: [...(bleLoadedProfile.meta_points || [])],
            metadata: { ...(bleLoadedProfile.metadata || {}) },
        } as IkawaProfile);
        setProfileDirty(false);
        setLastParsedWasPro(isProLikeProfile(bleLoadedProfile as IkawaProfile));
        setDecodeError(null);
        setWireFallbackAvailable(false);
        setWireFallbackGuess(null);
        setActiveTab("editor");
    };
    const handleBleSendProfile = async () => {
        const client = ikawaClientRef.current;
        if (!client || !profile) return;
        await queueBleCommand({
            pauseTelemetry: true,
            task: async () => {
            const support = await client.getSupportInfo();
            const supportInfo = support.respMachPropGetSupportInfo as
                | { profileSchema?: number | string }
                | undefined;
            const reportedSchema = Number(supportInfo?.profileSchema);
            const activeSchema =
                Number.isFinite(reportedSchema) && reportedSchema > 0
                    ? reportedSchema
                    : bleProfileSchema;
            if (activeSchema !== bleProfileSchema) {
                setBleProfileSchema(activeSchema);
            }
            const mapped = mapProfileToDeviceProfile(
                toAppProfile(profile as IkawaProfile),
                { schema: activeSchema },
            );
            const response = await client.setProfile(mapped);
            setBleLoadedProfile({
                ...(profile as IkawaProfile),
                curve_points: [...((profile as IkawaProfile).curve_points || [])],
                annotations: [...((profile as IkawaProfile).annotations || [])],
                meta_points: [...((profile as IkawaProfile).meta_points || [])],
                metadata: { ...(((profile as IkawaProfile).metadata || {}) as Record<string, unknown>) },
            } as IkawaProfile);
            setBleLastResponse(
                JSON.stringify(
                    {
                        sentProfile: mapped,
                        response,
                    },
                    null,
                    2,
                ),
            );
            },
        });
    };
    const handleBleGetStatus = async () => {
        const client = ikawaClientRef.current;
        if (!client) return;
        await queueBleCommand({
            task: async () => {
            const status = await client.getStatus();
            const errorStatus = await client.getErrorStatus();
            setBleLastResponse(
                JSON.stringify(
                    {
                        status,
                        errorStatus,
                    },
                    null,
                    2,
                ),
            );
            },
        });
    };
    const handleBleTelemetryTick = async () => {
        const client = ikawaClientRef.current;
        if (!client || !client.isConnected()) return;
        if (bleTelemetryBusyRef.current) return;
        if (bleCommandActiveRef.current || bleQueuedCommandCountRef.current > 0)
            return;

        bleTelemetryBusyRef.current = true;
        setBleTelemetryBusy(true);
        setBleTelemetryError(null);
        await queueBleCommand({
            setBusy: false,
            clearError: false,
            task: async () => {
                try {
                    const status = await client.getStatus({ timeoutMs: 1500 });
                    const sample = normalizeTelemetrySample(
                        status.respMachStatusGetAll as
                            | Record<string, number | string>
                            | undefined,
                    );
                    if (!sample) {
                        throw new Error("Roaster returned no status payload");
                    }
                    setBleTelemetrySample(sample);
                    setBleTelemetryHistory((prev) => [...prev.slice(-119), sample]);
                } catch (error) {
                    setBleTelemetryError(
                        error instanceof Error ? error.message : String(error),
                    );
                } finally {
                    bleTelemetryBusyRef.current = false;
                    setBleTelemetryBusy(false);
                }
            },
        });
    };
    const handleBleStartTelemetry = async () => {
        if (bleTelemetryIntervalRef.current !== null) {
            return;
        }
        await handleBleTelemetryTick();
        startTelemetryInterval();
    };
    const handleBleStopTelemetry = () => {
        stopTelemetryInterval();
    };

    return (
        <>
            <AppHeader
                menuAnchorEl={menuAnchorEl}
                menuOpen={menuOpen}
                onOpenMenu={setMenuAnchorEl}
                onCloseMenu={() => setMenuAnchorEl(null)}
                onNewRecipe={newProfile}
                onParseLink={() => setParseOpen(true)}
                parseEnabled={Boolean(messageType)}
                themeMode={themeMode}
                onToggleTheme={onToggleTheme}
            />
        <Container maxWidth="lg" sx={{ mt: 3, pb: 12 }}>
            <Tabs
                value={activeTab}
                onChange={(_, value: "editor" | "roaster") => setActiveTab(value)}
                sx={{ mb: 2 }}
            >
                <Tab label="Editor" value="editor" />
                <Tab
                    value="roaster"
                    label={
                        <Badge
                            color="success"
                            variant="dot"
                            invisible={!bleConnected && !bleTelemetryRunning}
                        >
                            <span>Roaster</span>
                        </Badge>
                    }
                />
            </Tabs>

            {activeTab === "roaster" && (
                <BlePanel
                    enabled={BLE_DIRECT_SEND_ENABLED}
                    supported={bleSupported}
                    connected={bleConnected}
                    busy={bleBusy}
                    deviceName={bleDeviceName}
                    mtu={bleMtu}
                    error={bleError}
                    lastResponse={bleLastResponse}
                    onConnect={handleBleConnect}
                    onDisconnect={handleBleDisconnect}
                    onGetStatus={handleBleGetStatus}
                    onGetMachineInfo={handleBleGetMachineInfo}
                    onGetCurrentProfile={handleBleGetCurrentProfile}
                    telemetryRunning={bleTelemetryRunning}
                    telemetryBusy={bleTelemetryBusy}
                    telemetryError={bleTelemetryError}
                    telemetrySample={bleTelemetrySample}
                    telemetryHistory={bleTelemetryHistory}
                    telemetryHistoryCount={bleTelemetryHistory.length}
                    profileCurvePoints={(overlayProfile?.curve_points || []) as Point[]}
                    profileFanPoints={(overlayProfile?.annotations || []) as Point[]}
                    profileName={overlayProfile?.profile_name || ""}
                    profileSourceLabel={overlayProfileSourceLabel}
                    loadedProfileName={bleLoadedProfile?.profile_name || ""}
                    loadedProfileOrigin={bleLoadedProfileOrigin}
                    loadedProfileTempPointCount={
                        bleLoadedProfile?.curve_points?.length || 0
                    }
                    loadedProfileFanPointCount={
                        bleLoadedProfile?.annotations?.length || 0
                    }
                    onStartTelemetry={handleBleStartTelemetry}
                    onStopTelemetry={handleBleStopTelemetry}
                    onUseLoadedProfile={handleUseLoadedProfileInEditor}
                    useLoadedProfileDisabled={!canUseLoadedProfileInEditor}
                />
            )}

            {activeTab === "editor" && !profile && <WelcomePanel />}

            {activeTab === "editor" && profile && (
                    <ProfileEditor
                        profile={profile}
                        lastParsedWasPro={lastParsedWasPro}
                        isDownsampledForHome={isDownsampledForHome}
                        setProfile={setProfile}
                        chartRef={chartRef}
                        chartData={chartData}
                        chartOptions={chartOptions}
                        dragInfo={dragInfo}
                        handlePointerDown={handlePointerDown}
                        handlePointerMove={handlePointerMove}
                        handleAirPointerMove={handleAirPointerMove}
                        handlePointerUp={handlePointerUp}
                        tempUnit={tempUnit}
                        setTempUnit={setTempUnit}
                        snapEnabled={snapEnabled}
                        setSnapEnabled={setSnapEnabled}
                        tempUnitLabel={tempUnitLabel}
                        points={points}
                        displayAirflowPoints={displayAirflowPoints}
                        maxRoastSeconds={MAX_ROAST_SECONDS}
                        minTempDisplay={tempToDisplay(MIN_TEMP_CELSIUS)}
                        maxTempDisplay={tempToDisplayInt(MAX_TEMP_CELSIUS)}
                        addPoint={addPoint}
                        addAirflowPoint={addAirflowPoint}
                        setPointTimeSeconds={setPointTimeSeconds}
                        setPointTempDegrees={setPointTempDegrees}
                        removePoint={removePoint}
                        tempToDisplay={tempToDisplay}
                        lastAnnotationIndex={lastAnnotationIndex}
                        setAirflowTimeSeconds={setAirflowTimeSeconds}
                        airflowRawToPercent={airflowRawToPercent}
                        airflowPercentToRaw={airflowPercentToRaw}
                        updateAirflowPoint={updateAirflowPoint}
                        removeAirflowPoint={removeAirflowPoint}
                        isValid={isValid}
                        validationErrors={validationErrors}
                        canDirectBleSend={canDirectBleSend}
                        canOpenInHome={canOpenInHome}
                        homeExportReason={homeExportReason}
                    />
            )}
            </Container>
            {activeTab === "editor" && (
                <OpenInAppFab
                    onClick={downloadEncoded}
                    disabled={openInAppDisabled}
                />
            )}

            <ParseDialog
                open={parseOpen}
                onClose={() => setParseOpen(false)}
                parseInputRef={parseInputRef}
                base64In={base64In}
                setBase64In={setBase64In}
                parseBase64={() => parseBase64()}
                decodeError={decodeError}
                wireFallbackAvailable={wireFallbackAvailable}
                wireFallbackGuess={wireFallbackGuess}
                base64Valid={base64Valid}
                messageTypeLoaded={Boolean(messageType)}
                onUseWireFallback={handleUseWireFallback}
                onClear={handleClearParseDialog}
                onParseAndClose={handleParseAndClose}
            />

            <NewProfileDialog
                open={newProfileModalOpen}
                onClose={() => setNewProfileModalOpen(false)}
                templates={NEW_PROFILE_TEMPLATES}
                onSelectTemplate={createProfileFromTemplate}
            />

            <ProConvertDialog
                open={proConvertModalOpen}
                onClose={() => setProConvertModalOpen(false)}
                onConvert={() => {
                    convertProToHome();
                    setProConvertModalOpen(false);
                }}
            />

            <OpenInAppDialog
                open={openInAppModalOpen}
                onClose={() => setOpenInAppModalOpen(false)}
                openInAppUrl={openInAppUrl}
                openInAppSource={openInAppSource}
                homeExportEnabled={canOpenInHome}
                homeExportReason={homeExportReason}
                bleEnabled={BLE_DIRECT_SEND_ENABLED}
                bleSupported={bleSupported}
                bleConnected={bleConnected}
                bleBusy={bleBusy}
                bleDeviceName={bleDeviceName}
                bleError={bleError}
                bleLastResponse={bleLastResponse}
                onBleConnect={handleBleConnect}
                onBleSendProfile={handleBleSendProfile}
                sendProfileDisabled={!bleConnected || !canDirectBleSend}
                onCopyUrl={handleCopyOpenInAppUrl}
                onOpenInApp={handleOpenInAppUrl}
            />
        </>
    );
}
