import type { MessageType } from "../types/protobuf";

export type StateUpdater<T> = T | ((prev: T) => T);

export interface AppState {
    snapEnabled: boolean;
    newProfileModalOpen: boolean;
    messageType: MessageType;
    profile: Record<string, any> | null;
    base64In: string;
    base64Valid: boolean;
    decodeError: string | null;
    wireFallbackAvailable: boolean;
    wireFallbackGuess: {
        guessed: Record<string, unknown>;
        normalized: string;
    } | null;
    draggingIdx: number | null;
    dragInfo: {
        idx: number;
        secs: number;
        rawX: number;
        rawY: number;
    } | null;
    draggingAirIdx: number | null;
    airDragInfo: {
        idx: number;
        rawX: number;
        rawY: number;
        percent: number;
    } | null;
    parseOpen: boolean;
    tempUnit: "C" | "F";
    menuAnchorEl: HTMLElement | null;
    shareBase: string;
    profileDirty: boolean;
    lastParsedWasPro: boolean;
    isDownsampledForHome: boolean;
    proConvertModalOpen: boolean;
    openInAppModalOpen: boolean;
    openInAppUrl: string;
    openInAppSource: string;
}

export const initialAppState: AppState = {
    snapEnabled: true,
    newProfileModalOpen: false,
    messageType: null,
    profile: null,
    base64In: "",
    base64Valid: false,
    decodeError: null,
    wireFallbackAvailable: false,
    wireFallbackGuess: null,
    draggingIdx: null,
    dragInfo: null,
    draggingAirIdx: null,
    airDragInfo: null,
    parseOpen: false,
    tempUnit: "C",
    menuAnchorEl: null,
    shareBase: "https://share.ikawa.support/profile_home/?",
    profileDirty: false,
    lastParsedWasPro: false,
    isDownsampledForHome: true,
    proConvertModalOpen: false,
    openInAppModalOpen: false,
    openInAppUrl: "",
    openInAppSource: "",
};

export type AppAction =
    | {
          type: "setField";
          key: keyof AppState;
          value: StateUpdater<AppState[keyof AppState]>;
      }
    | {
          type: "setMany";
          value: Partial<AppState>;
      };

export function appReducer(state: AppState, action: AppAction): AppState {
    switch (action.type) {
        case "setField": {
            const prev = state[action.key];
            const next =
                typeof action.value === "function"
                    ? (action.value as (value: typeof prev) => typeof prev)(prev)
                    : action.value;
            return {
                ...state,
                [action.key]: next,
            };
        }
        case "setMany":
            return {
                ...state,
                ...action.value,
            };
        default:
            return state;
    }
}
