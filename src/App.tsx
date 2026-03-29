import AppController from "./AppController";

interface AppProps {
    themeMode: "light" | "dark";
    onToggleTheme: () => void;
}

export default function App({ themeMode, onToggleTheme }: AppProps) {
    return (
        <AppController
            themeMode={themeMode}
            onToggleTheme={onToggleTheme}
        />
    );
}
