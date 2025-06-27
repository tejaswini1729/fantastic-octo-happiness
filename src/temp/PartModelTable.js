import { useState } from 'react';
import {TableSection, StyledTableCell,StyledTableHead} from '../styles/AnnotationStyles';
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
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';

export default function PartModelTable({setSelectedPart,partsData, onEdit, onDelete}) {
  const [selectedRow, setSelectedRow] = useState({ id: null, position: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const filteredData = partsData.filter(item =>
    Object.values(item).some(value =>
      value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  ).flatMap(part =>
    part.markupPoints.map(point => ({...point, id: part.id, part: part.part, model: part.model, variant: part.variant, side: part.side, imageUrl: part.imageUrl}))
  ).sort((a, b) => - b.position - a.position);
  ;

  const handleRowSelect = (id,position,category) => {
    if (selectedRow.id === id && selectedRow.position === position && selectedRow.category === category) {
      setSelectedRow({ id: null, position: null, position: null });
      setSelectedPart(null);
    } else {
      setSelectedRow({ id, position, category });
      const row = partsData.find((item) => item.id === id);
      const markupPoint = row?.markupPoints?.find(
        (mp) => mp.position === position && mp.category === category
      );
      const { markupPoints, ...rowWithoutMarkupPoints } = row || {};
      setSelectedPart({
        ...rowWithoutMarkupPoints,
        selectedMarkupPoint: [markupPoint],
      });
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
    if (action === 'edit') {
      onEdit(item);
    } else if (action === 'delete') {
      onDelete(item);
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
            overflow: 'auto',
            borderRadius: "16px",
            border: "none",boxShadow: "none",
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <StyledTableHead sx={{ width: 48 }}></StyledTableHead>
                <StyledTableHead>Part</StyledTableHead>
                <StyledTableHead>Model</StyledTableHead>
                <StyledTableHead>Variant</StyledTableHead>
                <StyledTableHead>Side</StyledTableHead>
                <StyledTableHead>Position</StyledTableHead>
                <StyledTableHead>Category</StyledTableHead>
                <StyledTableHead>Actions</StyledTableHead>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((item,index) => (
                <TableRow
                  key={`${item.id}-${item.position}-${item.category}`}
                  hover
                  selected={
                    selectedRow.id === item.id && selectedRow.position === item.position && selectedRow.category === item.category}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: '#e3f2fd',
                    },
                  }}
                >
                  <StyledTableCell>
                    <Checkbox
                      checked={
                        selectedRow.id === item.id && selectedRow.position === item.position && selectedRow.category === item.category}
                      onChange={() => handleRowSelect(item.id,item.position,item.category)}
                      color="primary"
                    />
                  </StyledTableCell>
                  <StyledTableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {item.part}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell>
                    <Typography variant="body2" color="text.secondary">
                      {item.model}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell>
                    <Typography variant="body2" color="text.secondary">
                      {item.variant}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell>
                    <Typography variant="body2" color="text.secondary">
                      {item.side}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell>
                    <Typography variant="body2" color="text.secondary">
                      {item.position}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell>
                    <Typography variant="body2" color="text.secondary">
                      {item.category}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell>
                    <IconButton
                      size="small"
                      onClick={(e) => handleDropdownClick(e, item)}
                      sx={{ color: 'text.secondary' }}
                    >
                      <MoreVertIcon fontSize="small" />
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
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { minWidth: 128 }
        }}
      >
        <MenuItem
          onClick={() => handleDropdownAction('edit', activeDropdown)}
          sx={{ fontSize: 14 }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => handleDropdownAction('delete', activeDropdown)}
          sx={{ fontSize: 14, color: 'error.main' }}
        >
          Delete
        </MenuItem>
      </Menu>
    </>
  );
}