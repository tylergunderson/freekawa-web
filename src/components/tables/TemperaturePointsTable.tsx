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

interface TemperaturePoint {
    index: number;
    x: number;
    y: number;
}

interface TemperaturePointsTableProps {
    points: TemperaturePoint[];
    tempUnitLabel: string;
    maxRoastSeconds: number;
    maxTempDisplay: number;
    addPoint: () => void;
    setPointTimeSeconds: (idx: number, value: string) => void;
    setPointTempDegrees: (idx: number, value: string) => void;
    removePoint: (idx: number) => void;
    tempToDisplay: (celsius: number) => number;
}

export const TemperaturePointsTable = memo(function TemperaturePointsTable({
    points,
    tempUnitLabel,
    maxRoastSeconds,
    maxTempDisplay,
    addPoint,
    setPointTimeSeconds,
    setPointTempDegrees,
    removePoint,
    tempToDisplay,
}: TemperaturePointsTableProps) {
    return (
        <>
            <Typography variant="h6" sx={{ mt: 1, mb: 1 }}>
                Temperature Points
            </Typography>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                }}
            >
                <Box>
                    <Button variant="outlined" onClick={addPoint} sx={{ mr: 1 }}>
                        Add temp point
                    </Button>
                </Box>
            </Box>
            <TableContainer component={Paper} sx={{ mb: 2, overflowX: "auto" }}>
                <Table size="small" sx={{ minWidth: 520 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>time (s)</TableCell>
                            <TableCell>temp ({tempUnitLabel})</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {points.map((pt, i) => (
                            <TableRow
                                key={i}
                                sx={
                                    i === 0
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
                                    {i === 0 ? (
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
                                    ) : (
                                        i
                                    )}
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        type="number"
                                        inputProps={{
                                            min: (points[0]?.x || 0) / 10 + (i === 0 ? 0 : 1),
                                            max: maxRoastSeconds,
                                            step: 1,
                                        }}
                                        value={Math.round(pt.x / 10)}
                                        size="small"
                                        sx={{ width: 110 }}
                                        disabled={i === 0}
                                        onChange={(e) =>
                                            setPointTimeSeconds(i, e.target.value)
                                        }
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        type="number"
                                        inputProps={{
                                            min: 0,
                                            max: maxTempDisplay,
                                            step: 1,
                                        }}
                                        value={tempToDisplay(pt.y / 10).toFixed(0)}
                                        size="small"
                                        sx={{ width: 110 }}
                                        disabled={i === 0}
                                        helperText={
                                            i === 0
                                                ? `Fixed ${tempToDisplay(pt.y / 10).toFixed(0)}${tempUnitLabel}`
                                                : undefined
                                        }
                                        onChange={(e) =>
                                            setPointTempDegrees(i, e.target.value)
                                        }
                                    />
                                </TableCell>
                                <TableCell>
                                    <Button
                                        size="small"
                                        color="error"
                                        disabled={i === 0}
                                        onClick={() => removePoint(i)}
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
