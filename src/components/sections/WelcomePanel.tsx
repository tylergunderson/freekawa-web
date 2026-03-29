import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";

export function WelcomePanel() {
    return (
        <Paper
            sx={{
                p: 2,
                mb: 2,
                backgroundColor: (theme) =>
                    alpha(
                        theme.palette.background.paper,
                        theme.palette.mode === "dark" ? 0.78 : 0.88,
                    ),
            }}
        >
            <Typography variant="h6" sx={{ mb: 1 }}>
                Welcome to freeKAWA
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Use the menu to start a New Recipe or Parse an Ikawa share link.
                After parsing, you can edit temperature and airflow points, then
                tap Open In App to share the updated profile. You can also paste
                Ikawa Pro links and convert them for use with an Ikawa Home roaster.
                Home profiles support fewer temperature and airflow points, so the
                conversion algorithm will downsample and do its best to preserve
                the roast curve.
            </Typography>
        </Paper>
    );
}
