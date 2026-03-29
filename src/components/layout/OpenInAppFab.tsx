import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

interface OpenInAppFabProps {
    disabled: boolean;
    onClick: () => void;
}

export function OpenInAppFab({ disabled, onClick }: OpenInAppFabProps) {
    return (
        <Box
            sx={{
                position: "fixed",
                bottom: 16,
                left: 0,
                right: 0,
                display: "flex",
                justifyContent: "center",
                pointerEvents: "none",
                zIndex: 10,
            }}
        >
            <Button
                variant="contained"
                color="success"
                size="large"
                onClick={onClick}
                disabled={disabled}
                sx={{
                    minHeight: 52,
                    minWidth: 200,
                    pointerEvents: "auto",
                    boxShadow: 3,
                }}
            >
                Send Or Export
            </Button>
        </Box>
    );
}
