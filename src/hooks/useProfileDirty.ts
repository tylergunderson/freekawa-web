import { useEffect } from "react";
import type { MutableRefObject } from "react";
import { generateDeviceToken } from "../utils/deviceToken";
import { selectProfileDirty } from "../app/selectors";

interface UseProfileDirtyArgs {
    profile: Record<string, any> | null;
    messageType: unknown;
    profileDirty: boolean;
    lastParsedProfileSnapshot: string | null;
    deviceTokenRegeneratedRef: MutableRefObject<boolean>;
    setProfileDirty: (v: boolean) => void;
    setProfile: (
        updater:
            | Record<string, any>
            | null
            | ((prev: Record<string, any> | null) => Record<string, any> | null),
    ) => void;
}

export function useProfileDirty({
    profile,
    messageType,
    profileDirty,
    lastParsedProfileSnapshot,
    deviceTokenRegeneratedRef,
    setProfileDirty,
    setProfile,
}: UseProfileDirtyArgs): void {
    useEffect(() => {
        if (!profile) return;
        // During drag updates this can run very frequently; once dirty, avoid
        // repeated deep comparisons until baseline is reset on parse/clear.
        if (profileDirty) return;
        if (!lastParsedProfileSnapshot) {
            setProfileDirty(true);
            return;
        }
        setProfileDirty(selectProfileDirty(profile, lastParsedProfileSnapshot));
    }, [
        profile,
        messageType,
        profileDirty,
        lastParsedProfileSnapshot,
        setProfileDirty,
    ]);

    useEffect(() => {
        if (
            profile &&
            profileDirty &&
            lastParsedProfileSnapshot &&
            !deviceTokenRegeneratedRef.current
        ) {
            deviceTokenRegeneratedRef.current = true;
            setProfile((prev) =>
                prev
                    ? {
                          ...prev,
                          device_token: generateDeviceToken(),
                      }
                    : prev,
            );
        }
    }, [
        profile,
        profileDirty,
        lastParsedProfileSnapshot,
        deviceTokenRegeneratedRef,
        setProfile,
    ]);
}
