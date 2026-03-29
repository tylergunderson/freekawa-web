import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(async () => {
    const analyze = process.env.ANALYZE_BUNDLE === "1";
    const analyzePlugins = [];

    if (analyze) {
        const { visualizer } = await import("rollup-plugin-visualizer");
        analyzePlugins.push(
            visualizer({
                filename: "dist/stats.html",
                gzipSize: true,
                brotliSize: true,
                open: false,
            }),
        );
    }

    return {
        base: "/freekawa-web/",
        plugins: [react()],
        build: {
            rollupOptions: {
                plugins: analyzePlugins,
            },
        },
    };
});
