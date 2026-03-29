import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

interface OpenInAppDialogProps {
    open: boolean;
    onClose: () => void;
    openInAppUrl: string;
    openInAppSource: string;
    homeExportEnabled: boolean;
    homeExportReason?: string;
    bleEnabled: boolean;
    bleSupported: boolean;
    bleConnected: boolean;
    bleBusy: boolean;
    bleDeviceName: string;
    bleError: string | null;
    bleLastResponse: string;
    onBleConnect: () => void;
    onBleSendProfile: () => void;
    sendProfileDisabled: boolean;
    onCopyUrl: () => void;
    onOpenInApp: () => void;
}

function SectionCard({
    title,
    subtitle,
    children,
}: {
    title: string;
    subtitle: string;
    children: React.ReactNode;
}) {
    return (
        <Box
            sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                p: 2,
                minWidth: 0,
                height: "100%",
            }}
        >
            <Typography variant="h6" sx={{ mb: 0.5 }}>
                {title}
            </Typography>
            <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2 }}
            >
                {subtitle}
            </Typography>
            {children}
        </Box>
    );
}

export function OpenInAppDialog({
    open,
    onClose,
    openInAppUrl,
    openInAppSource,
    homeExportEnabled,
    homeExportReason,
    bleEnabled,
    bleSupported,
    bleConnected,
    bleBusy,
    bleDeviceName,
    bleError,
    bleLastResponse,
    onBleConnect,
    onBleSendProfile,
    sendProfileDisabled,
    onCopyUrl,
    onOpenInApp,
}: OpenInAppDialogProps) {
    const canShowBle = bleEnabled && bleSupported;
    const actionButtonSx = { minHeight: 56 };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Send Or Export</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Choose how to use the current profile.
                </Typography>

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                        gap: 2,
                        alignItems: "start",
                    }}
                >
                    <SectionCard
                        title="Direct Roaster"
                        subtitle="Send the current profile directly to the connected IKAWA Home roaster."
                    >
                        <Stack spacing={1.5}>
                            {!bleEnabled && (
                                <Alert severity="info">
                                    Direct Bluetooth send is disabled.
                                </Alert>
                            )}

                            {bleEnabled && !bleSupported && (
                                <Alert severity="warning">
                                    Web Bluetooth is not available in this browser.
                                </Alert>
                            )}

                            {canShowBle && (
                                <>
                                    <Typography variant="body2">
                                        {bleConnected
                                            ? `Connected${bleDeviceName ? ` to ${bleDeviceName}` : ""}.`
                                            : "No roaster connected yet."}
                                    </Typography>

                                    {bleError && (
                                        <Alert severity="error">{bleError}</Alert>
                                    )}

                                    <Box
                                        sx={{
                                            display: "grid",
                                            gridTemplateColumns: {
                                                xs: "1fr",
                                                sm: "1fr 1fr",
                                            },
                                            gap: 1.5,
                                        }}
                                    >
                                        <Button
                                            variant="outlined"
                                            onClick={onBleConnect}
                                            disabled={bleConnected || bleBusy}
                                            sx={actionButtonSx}
                                        >
                                            {bleConnected
                                                ? "Roaster Connected"
                                                : "Connect Roaster"}
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="success"
                                            onClick={onBleSendProfile}
                                            disabled={sendProfileDisabled || bleBusy}
                                            sx={actionButtonSx}
                                        >
                                            Send To Roaster
                                        </Button>
                                    </Box>

                                    {bleLastResponse && bleConnected && (
                                        <Accordion disableGutters elevation={0}>
                                            <AccordionSummary
                                                expandIcon={<ExpandMoreIcon />}
                                            >
                                                <Typography variant="body2">
                                                    Roaster response (debug)
                                                </Typography>
                                            </AccordionSummary>
                                            <AccordionDetails sx={{ pt: 0 }}>
                                                <Box
                                                    sx={{
                                                        borderRadius: 1.5,
                                                        p: 1.5,
                                                        backgroundColor:
                                                            "rgba(18, 24, 28, 0.92)",
                                                        color: "rgb(208, 239, 227)",
                                                        fontFamily:
                                                            '"SFMono-Regular", "Menlo", "Consolas", monospace',
                                                        fontSize: 12,
                                                        whiteSpace: "pre-wrap",
                                                        wordBreak: "break-word",
                                                        maxHeight: 220,
                                                        overflowY: "auto",
                                                    }}
                                                >
                                                    {bleLastResponse}
                                                </Box>
                                            </AccordionDetails>
                                        </Accordion>
                                    )}
                                </>
                            )}
                        </Stack>
                    </SectionCard>

                    <SectionCard
                        title="Legacy Export"
                        subtitle="Export a legacy share link for the IKAWA Home app."
                    >
                        <Stack spacing={1.5}>
                            <TextField
                                label="Share Link"
                                value={openInAppUrl}
                                fullWidth
                                variant="outlined"
                                size="small"
                                inputProps={{ readOnly: true }}
                            />

                            <Typography variant="caption" color="text.secondary">
                                IKAWA Home imports links from this editor as Legacy recipes.
                            </Typography>

                            {!homeExportEnabled && homeExportReason && (
                                <Alert severity="info">
                                    {homeExportReason}
                                </Alert>
                            )}

                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: {
                                        xs: "1fr",
                                        sm: "1fr 1fr",
                                    },
                                    gap: 1.5,
                                }}
                            >
                                <Button
                                    variant="outlined"
                                    onClick={onCopyUrl}
                                    sx={actionButtonSx}
                                >
                                    Copy Link
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={onOpenInApp}
                                    disabled={!homeExportEnabled}
                                    sx={actionButtonSx}
                                >
                                    Open In App
                                </Button>
                            </Box>

                            {openInAppSource && (
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Link source: {openInAppSource}
                                </Typography>
                            )}
                        </Stack>
                    </SectionCard>
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
