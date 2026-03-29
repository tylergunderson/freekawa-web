import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

interface ProConvertDialogProps {
    open: boolean;
    onClose: () => void;
    onConvert: () => void;
}

export function ProConvertDialog({
    open,
    onClose,
    onConvert,
}: ProConvertDialogProps) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Pro Profile Detected</DialogTitle>
            <DialogContent>
                <Typography variant="body1" sx={{ mb: 2 }}>
                    This looks like a Pro share link. To open it in the Home
                    app, it needs to be downsampled to Home-compatible limits
                    (max 7 temp points, max 3 airflow points, 50°C start).
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Click “Convert Pro → Home” to apply the conversion.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>View Recipe</Button>
                <Button variant="contained" onClick={onConvert}>
                    Convert Pro → Home
                </Button>
            </DialogActions>
        </Dialog>
    );
}
