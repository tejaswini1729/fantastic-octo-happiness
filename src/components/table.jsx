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
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import WarningIcon from "@mui/icons-material/Warning";

// NEW: Added edit/delete props
const PartModelTable = ({ 
  setSelectedPart, 
  partsData, 
  onEditMarkupPoint, 
  onDeleteMarkupPoint, 
  setPartsData 
}) => {
  // NEW: State for dropdown menu and delete confirmation
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [selectedMarkupPoint, setSelectedMarkupPoint] = useState(null);
  const [selectedMarkupPointIndex, setSelectedMarkupPointIndex] = useState(-1);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // NEW: Transform data to table rows format
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

  // NEW: Handle row click to show part in viewer
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

  // NEW: Handle dropdown menu open
  const handleMenuClick = (event, rowData, markupPoint, markupPointIndex) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedRowData(rowData);
    setSelectedMarkupPoint(markupPoint);
    setSelectedMarkupPointIndex(markupPointIndex);
  };

  // NEW: Handle dropdown menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRowData(null);
    setSelectedMarkupPoint(null);
    setSelectedMarkupPointIndex(-1);
  };

  // NEW: Handle edit markup point
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

  // NEW: Handle delete markup point
  const handleDeleteMarkupPoint = (itemToDelete) => {
    if (onDeleteMarkupPoint) {
      onDeleteMarkupPoint(itemToDelete);
    }
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
    handleMenuClose();
  };

  // NEW: Handle delete confirmation
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

  return (
    <>
      {/* EXISTING: Your original table with minimal changes */}
      <Paper sx={{ width: "100%", overflow: "hidden", height: "100%" }}>
        <TableContainer sx={{ maxHeight: "calc(100vh - 200px)" }}>
          <Table stickyHeader aria-label="parts table">
            <TableHead>
              <TableRow>
                <TableCell>Part</TableCell>
                <TableCell>Model</TableCell>
                <TableCell>Variant</TableCell>
                <TableCell>Side</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Actions</TableCell> {/* NEW: Actions column */}
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  onClick={() => handleRowClick(row)} // NEW: Row click handler
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell>{row.part}</TableCell>
                  <TableCell>{row.model}</TableCell>
                  <TableCell>{row.variant}</TableCell>
                  <TableCell>{row.side}</TableCell>
                  <TableCell>{row.position}</TableCell>
                  <TableCell>{row.category}</TableCell>
                  <TableCell>
                    {/* NEW: Actions dropdown for markup points only */}
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

      {/* NEW: Actions Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() =>
            handleEditMarkupPoint(
              selectedRowData,
              selectedMarkupPoint,
              selectedMarkupPointIndex
            )
          }
        >
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        
        <MenuItem
          onClick={() => handleDeleteConfirmation(selectedRowData)}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* NEW: Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setItemToDelete(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <WarningIcon color="warning" />
          Confirm Deletion
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete this markup point? This action cannot be undone.
          </Typography>
          
          {itemToDelete && (
            <Box sx={{ p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Item Details:
              </Typography>
              <Typography variant="body2">Part: {itemToDelete.part}</Typography>
              <Typography variant="body2">Model: {itemToDelete.model}</Typography>
              <Typography variant="body2">Variant: {itemToDelete.variant}</Typography>
              <Typography variant="body2">Side: {itemToDelete.side}</Typography>
              <Typography variant="body2">Position: #{itemToDelete.position}</Typography>
              <Typography variant="body2">Category: {itemToDelete.category}</Typography>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteConfirmOpen(false);
              setItemToDelete(null);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleDeleteMarkupPoint(itemToDelete)}
            variant="contained"
            color="error"
          >
            Delete Point
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PartModelTable;