import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MenuIcon from "@mui/icons-material/Menu";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import Tooltip from "@mui/material/Tooltip";

interface AppHeaderProps {
    menuAnchorEl: HTMLElement | null;
    menuOpen: boolean;
    onOpenMenu: (el: HTMLElement) => void;
    onCloseMenu: () => void;
    onNewRecipe: () => void;
    onParseLink: () => void;
    parseEnabled: boolean;
    themeMode: "light" | "dark";
    onToggleTheme: () => void;
}

export function AppHeader({
    menuAnchorEl,
    menuOpen,
    onOpenMenu,
    onCloseMenu,
    onNewRecipe,
    onParseLink,
    parseEnabled,
    themeMode,
    onToggleTheme,
}: AppHeaderProps) {
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography
                    variant="h6"
                    component="a"
                    href="/"
                    sx={{
                        flexGrow: 1,
                        color: "inherit",
                        textDecoration: "none",
                    }}
                >
                    freeKAWA | Home
                </Typography>
                <Tooltip
                    title={
                        themeMode === "dark"
                            ? "Switch to light mode"
                            : "Switch to dark mode"
                    }
                >
                    <IconButton color="inherit" onClick={onToggleTheme}>
                        {themeMode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
                    </IconButton>
                </Tooltip>
                <IconButton color="inherit" onClick={(e) => onOpenMenu(e.currentTarget)}>
                    <MenuIcon />
                </IconButton>
                <Menu anchorEl={menuAnchorEl} open={menuOpen} onClose={onCloseMenu}>
                    <MenuItem
                        onClick={() => {
                            onCloseMenu();
                            onNewRecipe();
                        }}
                    >
                        New Recipe
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            onCloseMenu();
                            onParseLink();
                        }}
                        disabled={!parseEnabled}
                    >
                        Parse Ikawa Link
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
}
