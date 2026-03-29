import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { RefObject } from "react";

interface ParseDialogProps {
    open: boolean;
    onClose: () => void;
    parseInputRef: RefObject<HTMLInputElement>;
    base64In: string;
    setBase64In: (v: string) => void;
    parseBase64: () => void;
    decodeError: string | null;
    wireFallbackAvailable: boolean;
    wireFallbackGuess: { guessed: Record<string, any>; normalized: string } | null;
    base64Valid: boolean;
    messageTypeLoaded: boolean;
    onUseWireFallback: () => void;
    onClear: () => void;
    onParseAndClose: () => void;
}

export function ParseDialog({
    open,
    onClose,
    parseInputRef,
    base64In,
    setBase64In,
    parseBase64,
    decodeError,
    wireFallbackAvailable,
    base64Valid,
    messageTypeLoaded,
    onUseWireFallback,
    onClear,
    onParseAndClose,
}: ParseDialogProps) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Parse Ikawa Link</DialogTitle>
            <DialogContent>
                <TextField
                    inputRef={parseInputRef}
                    placeholder="Paste profile base64 or share URL"
                    multiline
                    minRows={4}
                    value={base64In}
                    onChange={(e) => setBase64In(e.target.value)}
                    onPaste={(e) => {
                        const text = e.clipboardData.getData("text");
                        if (!text) return;
                        e.preventDefault();
                        setBase64In(text);
                    }}
                    onKeyDown={(e) => {
                        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                            parseBase64();
                        }
                    }}
                    fullWidth
                    variant="outlined"
                    aria-label="Paste profile base64"
                    sx={{ mt: 1 }}
                />
                <Box
                    sx={{
                        mt: 1,
                        display: "grid",
                        gridTemplateColumns: "minmax(0, 1fr) auto",
                        alignItems: "center",
                        columnGap: 2,
                        rowGap: 1,
                    }}
                >
                    <Box>
                        {decodeError ? (
                            <>
                                <Typography color="error" variant="body2">
                                    {decodeError}
                                </Typography>
                                {wireFallbackAvailable && (
                                    <Button
                                        size="small"
                                        variant="contained"
                                        color="secondary"
                                        sx={{ mt: 1 }}
                                        onClick={onUseWireFallback}
                                    >
                                        Use wire-format fallback
                                    </Button>
                                )}
                            </>
                        ) : base64Valid ? (
                            <Typography color="success.main" variant="body2">
                                Looks good — ready to parse
                            </Typography>
                        ) : (
                            <Typography variant="body2">
                                Paste a profile base64 or share URL
                            </Typography>
                        )}
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button variant="outlined" size="small" onClick={onClear}>
                            Clear
                        </Button>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
                <Button
                    variant="contained"
                    onClick={onParseAndClose}
                    disabled={!messageTypeLoaded}
                >
                    Parse
                </Button>
            </DialogActions>
        </Dialog>
    );
}
