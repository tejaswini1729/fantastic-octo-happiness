import { useState } from "react";
import {
  TableSection,
  StyledTableCell,
  StyledTableHead,
} from "../styles/AnnotationStyles";
import { TBL_HDRS, TBL_ACTIONS } from "./constants";
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  IconButton,
  Typography,
  Menu,
  MenuItem,
} from "@mui/material";
import { MoreVert as MoreVertIcon, CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon, CheckBox as CheckBoxIcon, Edit as EditIcon,Delete as DeleteIcon } from "@mui/icons-material";
export default function PartModelTable({
  setSelectedPart,
  partsData,
  onEdit,
  onDelete,
}) {
  const [selectedRow, setSelectedRow] = useState({ img_pos_id: null, id: null });
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const handleRowSelect = (img_pos_id, id) => {
    if (selectedRow?.img_pos_id === img_pos_id && selectedRow?.id===id) {
      setSelectedRow({ img_pos_id: null, id: null });
      setSelectedPart(null);
    } else {
      setSelectedRow({ img_pos_id,id});
      const row = partsData.find((item) => item?.img_pos_id === img_pos_id && item?.id === id);
      setSelectedPart(row || null);
      console.log("Checking row", row);
    }
  };

  const handleDropdownClick = (event, item) => {
    setAnchorEl(event.currentTarget);
    setActiveDropdown(item);
  };

  const handleDropdownClose = () => {
    setAnchorEl(null);
    setActiveDropdown(null);
  };

  const handleDropdownAction = (action, item) => {
    if (action === "edit") {
      onEdit(item.img_pos_id, item?.id);
    } else if (action === "delete") {
      onDelete(item.img_pos_id, item?.id);
    }
    handleDropdownClose();
  };

  return (
    <>
      {/* Table Section */}
      <TableSection>
        <TableContainer
          sx={{
            flex: 1,
            overflow: "auto",
            borderRadius: "16px",
            border: "none",
            boxShadow: "none",
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <StyledTableHead sx={{ width: 48, borderTopLeftRadius: "16px"}}></StyledTableHead>
                {TBL_HDRS.map((col) => (
                  <StyledTableHead key={col.columnName}>
                    {col.label}
                  </StyledTableHead>
                ))}
                <StyledTableHead sx={{ borderTopRightRadius: "16px" }}>Actions</StyledTableHead>
              </TableRow>
            </TableHead>
            <TableBody>
              {partsData.map((item, index) => (
                <TableRow
                  key={index}
                  hover
                  selected={
                    selectedRow.id === item.id &&
                    selectedRow.position === item.position &&
                    selectedRow.category === item.category
                  }
                  sx={{
                    "&.Mui-selected": {
                      backgroundColor: "#e3f2fd",
                    },
                  }}
                >
                  <StyledTableCell>
                    <Checkbox
                      checked={selectedRow.img_pos_id === item?.img_pos_id}
                      onChange={() => handleRowSelect(item?.img_pos_id,item?.id)}
                      icon={
                        <CheckBoxOutlineBlankIcon
                          sx={{ fontSize: "16px", color: "#97999B" }}
                        />
                      }
                      checkedIcon={
                        <CheckBoxIcon
                          sx={{
                            fontSize: "16px",
                            color: "#171C8F",
                            backgroundColor: "#FFFFFF",
                            borderRadius: "2px",
                          }}
                        />
                      }
                      sx={{
                        width: "16px",
                        height: "16px",
                        padding: 0,
                      }}
                    />
                  </StyledTableCell>
                  {TBL_HDRS.map((col) => (
                    <StyledTableCell key={col.name}>
                      <Typography
                        sx={{
                          fontWeight: 400,
                          fontStyle: "normal",
                          fontSize: "14px",
                          lineHeight: "14px",
                          letterSpacing: "0px",
                          color: "#4D505B",
                        }}
                      >
                        {item[col.name]}
                      </Typography>
                    </StyledTableCell>
                  ))}
                  <StyledTableCell>
                    <IconButton
                      size="small"
                      onClick={(e) => handleDropdownClick(e, item)}
                      sx={{ color: "#171C8F" }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </StyledTableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TableSection>

      {/* Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleDropdownClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: { minWidth: 128 },
        }}
      >
        <MenuItem
          onClick={() => handleDropdownAction(TBL_ACTIONS?.EDIT?.actionType, activeDropdown)}
          sx={{ fontSize: "12px", color: '#343536' }}
        >
          <EditIcon sx={{ fontSize: "15px", mr: 1, color: "#97999B" }} />
          {TBL_ACTIONS?.EDIT?.label}
        </MenuItem>
        <MenuItem
          onClick={() => handleDropdownAction(TBL_ACTIONS?.DELETE?.actionType, activeDropdown)}
          sx={{ fontSize: "12px", color: '#343536' }}
        >
          <DeleteIcon sx={{ fontSize: "15px", mr: 1, color: "#97999B" }} />
           {TBL_ACTIONS?.DELETE?.label}
        </MenuItem>
      </Menu>
    </>
  );
}
