import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useEffect, useMemo, useState } from "react";

type ThemeMode = "light" | "dark";

const THEME_STORAGE_KEY = "freekawa-theme-mode";

function RootApp() {
    const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
    const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
        const stored =
            typeof window !== "undefined"
                ? window.localStorage.getItem(THEME_STORAGE_KEY)
                : null;
        return stored === "dark" || stored === "light" ? stored : "light";
    });

    useEffect(() => {
        const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
        if (stored === "dark" || stored === "light") {
            setThemeMode(stored);
            return;
        }
        setThemeMode(prefersDarkMode ? "dark" : "light");
    }, [prefersDarkMode]);

    useEffect(() => {
        window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
    }, [themeMode]);

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode: themeMode,
                    primary: {
                        main: themeMode === "dark" ? "#5aa7ff" : "#1f72c9",
                    },
                    secondary: {
                        main: themeMode === "dark" ? "#f2b75c" : "#cf8b1b",
                    },
                    background: {
                        default:
                            themeMode === "dark" ? "#0f1419" : "#f5f7fa",
                        paper:
                            themeMode === "dark" ? "#171d24" : "#ffffff",
                    },
                },
                shape: {
                    borderRadius: 12,
                },
            }),
        [themeMode],
    );

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <App
                themeMode={themeMode}
                onToggleTheme={() =>
                    setThemeMode((current) =>
                        current === "dark" ? "light" : "dark",
                    )
                }
            />
        </ThemeProvider>
    );
}

const rootEl = document.getElementById("root");
if (!rootEl) {
    throw new Error("Root element '#root' not found");
}

createRoot(rootEl).render(
    <React.StrictMode>
        <RootApp />
    </React.StrictMode>,
);
