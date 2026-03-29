import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import LockIcon from "@mui/icons-material/Lock";
import { alpha } from "@mui/material/styles";
import { memo } from "react";

interface AirflowPoint {
    index: number;
    x: number;
    y: number;
    source: "annotation" | "meta";
}

interface AirflowPointsTableProps {
    displayAirflowPoints: AirflowPoint[];
    maxRoastSeconds: number;
    lastAnnotationIndex: number;
    addAirflowPoint: () => void;
    setAirflowTimeSeconds: (
        idx: number,
        value: string,
        source?: "annotation" | "meta",
    ) => void;
    airflowRawToPercent: (raw: number) => number;
    airflowPercentToRaw: (pct: number) => number;
    updateAirflowPoint: (
        idx: number,
        field: "x" | "y",
        val: number,
        source?: "annotation" | "meta",
    ) => void;
    removeAirflowPoint: (idx: number) => void;
}

export const AirflowPointsTable = memo(function AirflowPointsTable({
    displayAirflowPoints,
    maxRoastSeconds,
    lastAnnotationIndex,
    addAirflowPoint,
    setAirflowTimeSeconds,
    airflowRawToPercent,
    airflowPercentToRaw,
    updateAirflowPoint,
    removeAirflowPoint,
}: AirflowPointsTableProps) {
    return (
        <>
            <Typography variant="h6" sx={{ mt: 1, mb: 1 }}>
                Airflow Points
            </Typography>
            <Box sx={{ mb: 1 }}>
                <Button variant="outlined" onClick={addAirflowPoint}>
                    Add airflow point
                </Button>
            </Box>
            <TableContainer component={Paper} sx={{ mb: 2, overflowX: "auto" }}>
                <Table size="small" sx={{ minWidth: 520 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>time (s)</TableCell>
                            <TableCell>airflow (%)</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {displayAirflowPoints.map((pt, i) => (
                            <TableRow
                                key={i}
                                sx={
                                    pt.source === "annotation" && pt.index === 0
                                        ? {
                                              backgroundColor: (theme) =>
                                                  theme.palette.mode === "dark"
                                                      ? alpha(
                                                            theme.palette.action.hover,
                                                            0.4,
                                                        )
                                                      : alpha(
                                                            theme.palette.primary.main,
                                                            0.06,
                                                        ),
                                          }
                                        : undefined
                                }
                            >
                                <TableCell>
                                    {pt.source === "annotation" && pt.index === 0 ? (
                                        <Tooltip title="Starting point — fixed">
                                            <span
                                                style={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: 6,
                                                }}
                                            >
                                                <LockIcon
                                                    fontSize="small"
                                                    sx={{ mr: 0.5 }}
                                                />
                                                Start
                                            </span>
                                        </Tooltip>
                                    ) : pt.source === "meta" ? (
                                        "Cooldown"
                                    ) : (
                                        i
                                    )}
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        type="number"
                                        inputProps={{
                                            min: 0,
                                            max: maxRoastSeconds,
                                            step: 1,
                                        }}
                                        value={Math.round(pt.x / 10)}
                                        size="small"
                                        sx={{ width: 110 }}
                                        disabled={
                                            (pt.source === "annotation" &&
                                                pt.index === lastAnnotationIndex) ||
                                            (i === 0 && pt.source !== "meta")
                                        }
                                        onChange={(e) =>
                                            setAirflowTimeSeconds(
                                                pt.index,
                                                e.target.value,
                                                pt.source,
                                            )
                                        }
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        type="number"
                                        inputProps={{
                                            min: 0,
                                            max: 100,
                                            step: 1,
                                        }}
                                        value={airflowRawToPercent(pt.y)}
                                        size="small"
                                        sx={{ width: 110 }}
                                        disabled={i === 0}
                                        helperText={undefined}
                                        onChange={(e) =>
                                            updateAirflowPoint(
                                                pt.index,
                                                "y",
                                                airflowPercentToRaw(
                                                    Number(e.target.value),
                                                ),
                                                pt.source,
                                            )
                                        }
                                    />
                                </TableCell>
                                <TableCell>
                                    <Button
                                        size="small"
                                        color="error"
                                        disabled={pt.source === "meta"}
                                        onClick={() => removeAirflowPoint(pt.index)}
                                    >
                                        Remove
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
});
