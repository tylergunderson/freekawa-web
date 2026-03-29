import { useMemo, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type {
    DevelopmentTime,
    NewProfileTemplate,
    NewProfileTemplateId,
    RoastCategory,
    RoastDegree,
    RoastProcess,
} from "../../data/newProfileTemplates";

interface NewProfileDialogProps {
    open: boolean;
    onClose: () => void;
    templates: NewProfileTemplate[];
    onSelectTemplate: (templateId: NewProfileTemplateId) => void;
}

const CATEGORIES: RoastCategory[] = ["Filter", "Espresso"];
const PROCESSES: RoastProcess[] = ["Natural", "Washed"];
const DEGREES: RoastDegree[] = [
    "Light",
    "Light-Medium",
    "Medium",
    "Medium-Dark",
    "Dark",
];
const DEV_LEVELS: DevelopmentTime[] = ["Low", "Medium", "High"];

export function NewProfileDialog({
    open,
    onClose,
    templates,
    onSelectTemplate,
}: NewProfileDialogProps) {
    const [process, setProcess] = useState<RoastProcess>("Natural");
    const [category, setCategory] = useState<RoastCategory>("Filter");
    const [degree, setDegree] = useState<RoastDegree>("Light");
    const [dev, setDev] = useState<DevelopmentTime>("Medium");

    const selectedTemplate = useMemo(
        () =>
            templates.find(
                (t) =>
                    t.process === process &&
                    t.category === category &&
                    t.roastDegree === degree &&
                    t.developmentTime === dev,
            ),
        [templates, process, category, degree, dev],
    );

    const create = () => {
        if (!selectedTemplate) return;
        onSelectTemplate(selectedTemplate.id);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Create New Profile</DialogTitle>
            <DialogContent>
                <Typography variant="body1" sx={{ mb: 2 }}>
                    Choose process, roast type, roast degree, and development
                    time:
                </Typography>

                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Process
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                    {PROCESSES.map((value) => (
                        <Button
                            key={value}
                            variant={process === value ? "contained" : "outlined"}
                            onClick={() => setProcess(value)}
                        >
                            {value}
                        </Button>
                    ))}
                </Box>

                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Type
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                    {CATEGORIES.map((value) => (
                        <Button
                            key={value}
                            variant={category === value ? "contained" : "outlined"}
                            onClick={() => setCategory(value)}
                        >
                            {value}
                        </Button>
                    ))}
                </Box>

                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Roast Degree
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                    {DEGREES.map((value) => (
                        <Button
                            key={value}
                            variant={degree === value ? "contained" : "outlined"}
                            onClick={() => setDegree(value)}
                            size="small"
                        >
                            {value}
                        </Button>
                    ))}
                </Box>

                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Development Time
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                    {DEV_LEVELS.map((value) => (
                        <Button
                            key={value}
                            variant={dev === value ? "contained" : "outlined"}
                            onClick={() => setDev(value)}
                            color={
                                value === "Low"
                                    ? "success"
                                    : value === "High"
                                      ? "warning"
                                      : "primary"
                            }
                        >
                            {value}
                        </Button>
                    ))}
                </Box>

                {selectedTemplate && (
                    <Box
                        sx={{
                            p: 1.5,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 1,
                        }}
                    >
                        <Typography variant="subtitle1">
                            {selectedTemplate.name}
                        </Typography>
                        <Typography variant="caption" display="block">
                            {selectedTemplate.durationLabel}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {selectedTemplate.notes}
                        </Typography>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={create}
                    disabled={!selectedTemplate}
                >
                    Create
                </Button>
            </DialogActions>
        </Dialog>
    );
}
