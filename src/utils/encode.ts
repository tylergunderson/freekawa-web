export function toProtoProfile(p: any, opts: { stripMetadata?: boolean } = {}) {
    if (!p) return null;
    const { stripMetadata } = opts;
    const meta = p.metadata || {};
    const metaOut = stripMetadata
        ? undefined
            : Object.keys(meta || {}).length
          ? {
                shareToken: meta.share_token || meta.shareToken,
                shortId: meta.short_id || meta.shortId,
                farm: meta.origin || meta.farm,
                spare: meta.spare,
                zero: meta.zero ?? 0,
            }
          : undefined;
    return {
        version: p.version ?? 1,
        deviceToken: p.device_token || p.deviceToken,
        profileName: p.profile_name || p.profileName || p.profile || "",
        curvePoints: p.curve_points || p.curvePoints || [],
        annotations: p.annotations || p.annotation || [],
        flag: p.flag ?? 1,
        metaPoints: p.meta_points || p.metaPoints || [],
        metadata: metaOut,
    };
}
