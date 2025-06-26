import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import WarningIcon from "@mui/icons-material/Warning";

const PartModelTable = ({ 
  setSelectedPart, 
  partsData, 
  onEditMarkupPoint, 
  onDeleteMarkupPoint, 
  setPartsData 
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [selectedMarkupPoint, setSelectedMarkupPoint] = useState(null);
  const [selectedMarkupPointIndex, setSelectedMarkupPointIndex] = useState(-1);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Transform data to table rows format
  const tableData = useMemo(() => {
    const rows = [];
    
    partsData.forEach((part) => {
      if (part.markupPoints && part.markupPoints.length > 0) {
        part.markupPoints.forEach((markupPoint, markupIndex) => {
          rows.push({
            id: `${part.id}-${markupIndex}`,
            partId: part.id,
            part: part.part,
            model: part.model,
            variant: part.variant,
            side: part.side,
            position: markupPoint.position,
            category: markupPoint.category,
            imageUrl: part.imageUrl,
            markupPoint: markupPoint,
            markupPointIndex: markupIndex,
            partData: part,
          });
        });
      } else {
        // Show parts without markup points
        rows.push({
          id: `${part.id}-empty`,
          partId: part.id,
          part: part.part,
          model: part.model,
          variant: part.variant,
          side: part.side,
          position: "No points",
          category: "N/A",
          imageUrl: part.imageUrl,
          markupPoint: null,
          markupPointIndex: -1,
          partData: part,
        });
      }
    });
    
    return rows;
  }, [partsData]);

  // Handle row click to show part in viewer
  const handleRowClick = (rowData) => {
    if (rowData.markupPoint) {
      // Set selected part with the specific markup point highlighted
      setSelectedPart({
        ...rowData.partData,
        selectedMarkupPoint: [rowData.markupPoint],
        selectedMarkupPointIndex: rowData.markupPointIndex,
      });
    } else {
      // Set selected part without highlighting any specific point
      setSelectedPart({
        ...rowData.partData,
        selectedMarkupPoint: [],
        selectedMarkupPointIndex: -1,
      });
    }
  };

  // Handle dropdown menu open
  const handleMenuClick = (event, rowData, markupPoint, markupPointIndex) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedRowData(rowData);
    setSelectedMarkupPoint(markupPoint);
    setSelectedMarkupPointIndex(markupPointIndex);
  };

  // Handle dropdown menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRowData(null);
    setSelectedMarkupPoint(null);
    setSelectedMarkupPointIndex(-1);
  };

  // Handle edit markup point
  const handleEditMarkupPoint = (rowData, markupPoint, markupPointIndex) => {
    if (onEditMarkupPoint) {
      onEditMarkupPoint({
        partData: rowData.partData,
        markupPoint: markupPoint,
        markupPointIndex: markupPointIndex
      });
    }
    handleMenuClose();
  };

  // Handle delete markup point
  const handleDeleteMarkupPoint = (itemToDelete) => {
    if (onDeleteMarkupPoint) {
      onDeleteMarkupPoint(itemToDelete);
    }
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
    handleMenuClose();
  };

  // Handle delete confirmation
  const handleDeleteConfirmation = (rowData) => {
    setItemToDelete({
      id: rowData.partId,
      part: rowData.part,
      model: rowData.model,
      variant: rowData.variant,
      side: rowData.side,
      position: rowData.position,
      category: rowData.category,
      markupPointIndex: rowData.markupPointIndex,
    });
    setDeleteConfirmOpen(true);
    handleMenuClose();
  };

  // Get category color for chips
  const getCategoryColor = (category) => {
    switch (category) {
      case "CMM":
        return "primary";
      case "LD Gap":
        return "secondary";
      case "Supplier Part":
        return "success";
      case "All":
        return "warning";
      default:
        return "default";
    }
  };

  // Format position display
  const formatPosition = (position) => {
    if (position === "No points" || !position) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
          No points
        </Typography>
      );
    }
    return (
      <Chip
        label={`#${position}`}
        size="small"
        variant="outlined"
        sx={{
          fontWeight: 600,
          minWidth: 50,
        }}
      />
    );
  };

  // Format category display
  const formatCategory = (category) => {
    if (category === "N/A" || !category) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
          N/A
        </Typography>
      );
    }
    return (
      <Chip
        label={category}
        size="small"
        color={getCategoryColor(category)}
        sx={{
          fontWeight: 500,
        }}
      />
    );
  };

  return (
    <>
      <Paper sx={{ width: "100%", overflow: "hidden", height: "100%" }}>
        <TableContainer sx={{ maxHeight: "calc(100vh - 200px)" }}>
          <Table stickyHeader aria-label="parts table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, backgroundColor: "#f5f5f5" }}>
                  Part
                </TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: "#f5f5f5" }}>
                  Model
                </TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: "#f5f5f5" }}>
                  Variant
                </TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: "#f5f5f5" }}>
                  Side
                </TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: "#f5f5f5" }}>
                  Position
                </TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: "#f5f5f5" }}>
                  Category
                </TableCell>
                <TableCell 
                  sx={{ 
                    fontWeight: 600, 
                    backgroundColor: "#f5f5f5",
                    width: 60,
                    textAlign: "center"
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  onClick={() => handleRowClick(row)}
                  sx={{
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "#f8f9fa",
                    },
                  }}
                >
                  <TableCell sx={{ fontWeight: 500 }}>
                    {row.part}
                  </TableCell>
                  <TableCell>{row.model}</TableCell>
                  <TableCell>{row.variant}</TableCell>
                  <TableCell>{row.side}</TableCell>
                  <TableCell>{formatPosition(row.position)}</TableCell>
                  <TableCell>{formatCategory(row.category)}</TableCell>
                  <TableCell sx={{ textAlign: "center", width: 60 }}>
                    {row.markupPoint && (
                      <IconButton
                        size="small"
                        onClick={(e) =>
                          handleMenuClick(
                            e,
                            row,
                            row.markupPoint,
                            row.markupPointIndex
                          )
                        }
                        sx={{
                          "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.04)",
                          },
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              
              {tableData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: "center", py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No parts data available
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Actions Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            borderRadius: 2,
            minWidth: 150,
          },
        }}
      >
        <MenuItem
          onClick={() =>
            handleEditMarkupPoint(
              selectedRowData,
              selectedMarkupPoint,
              selectedMarkupPointIndex
            )
          }
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            py: 1.5,
            "&:hover": {
              backgroundColor: "#f0f7ff",
            },
          }}
        >
          <EditIcon fontSize="small" color="primary" />
          <Typography variant="body2">Edit</Typography>
        </MenuItem>
        
        <MenuItem
          onClick={() => handleDeleteConfirmation(selectedRowData)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            py: 1.5,
            "&:hover": {
              backgroundColor: "#fff0f0",
            },
          }}
        >
          <DeleteIcon fontSize="small" color="error" />
          <Typography variant="body2" color="error">
            Delete
          </Typography>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setItemToDelete(null);
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          },
        }}
      >
        <DialogTitle 
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 1,
            pb: 2,
          }}
        >
          <WarningIcon color="warning" />
          <Typography variant="h6" fontWeight={600}>
            Confirm Deletion
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ pb: 2 }}>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Are you sure you want to delete this markup point? This action cannot be undone.
          </Typography>
          
          {itemToDelete && (
            <Box
              sx={{
                p: 2,
                backgroundColor: "#f8f9fa",
                borderRadius: 2,
                border: "1px solid #e9ecef",
              }}
            >
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                Item Details:
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                <Typography variant="body2">
                  <strong>Part:</strong> {itemToDelete.part}
                </Typography>
                <Typography variant="body2">
                  <strong>Model:</strong> {itemToDelete.model}
                </Typography>
                <Typography variant="body2">
                  <strong>Variant:</strong> {itemToDelete.variant}
                </Typography>
                <Typography variant="body2">
                  <strong>Side:</strong> {itemToDelete.side}
                </Typography>
                <Typography variant="body2">
                  <strong>Position:</strong> #{itemToDelete.position}
                </Typography>
                <Typography variant="body2">
                  <strong>Category:</strong> {itemToDelete.category}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => {
              setDeleteConfirmOpen(false);
              setItemToDelete(null);
            }}
            variant="outlined"
            color="inherit"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleDeleteMarkupPoint(itemToDelete)}
            variant="contained"
            color="error"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "0 4px 12px rgba(244, 67, 54, 0.3)",
              "&:hover": {
                boxShadow: "0 6px 16px rgba(244, 67, 54, 0.4)",
              },
            }}
          >
            Delete Point
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PartModelTable;