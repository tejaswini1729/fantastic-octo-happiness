import React, { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Typography,
  Container,
  Menu,
  MenuItem,
  Tooltip,
  Card,
  CardMedia,
  styled
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

// Styled components
const MainContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  backgroundColor: '#f5f5f5',
  padding: theme.spacing(3),
}));

const HeaderSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(1),
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
}));

const ContentContainer = styled(Box)({
  display: 'flex',
  height: 'calc(100vh - 200px)',
  backgroundColor: 'white',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
  overflow: 'hidden',
});

const TableSection = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
});

const PartViewPanel = styled(Box)(({ theme }) => ({
  width: 320,
  borderLeft: `1px solid ${theme.palette.divider}`,
  backgroundColor: '#f8f9fa',
  display: 'flex',
  flexDirection: 'column',
}));

const PartViewHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: 'white',
}));

const ImageContainer = styled(Box)({
  position: 'relative',
  flex: 1,
  border: '1px solid #e0e0e0',
  borderRadius: 8,
  overflow: 'hidden',
});

const MarkupPoint = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: 24,
  height: 24,
  backgroundColor: 'white',
  border: '1px solid black',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transform: 'translate(-50%, -50%)',
  cursor: 'pointer',
  boxShadow: theme.shadows[2],
  '& .MuiTypography-root': {
    fontSize: 12,
    fontWeight: 500,
    color: 'black',
  },
}));

const StyledTableCell = styled(TableCell)({
  padding: '12px',
});

const StyledTableHead = styled(TableCell)({
  padding: '12px',
  backgroundColor: '#f8f9fa',
  fontWeight: 500,
  color: '#374151',
});

export default function PartsManagementTable() {
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPart, setSelectedPart] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const partsData = [
    { 
      id: 1, 
      part: 'Door', 
      model: 'YGB', 
      variant: 'LxI', 
      side: 'Right Hand', 
      position: 10, 
      category: 'CMM',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      markupPoints: [
        { x: 50, y: 80, label: 'Handle', type: 'measurement' },
        { x: 150, y: 120, label: 'Hinge', type: 'defect' }
      ]
    },
    { 
      id: 2, 
      part: 'Door', 
      model: 'YGB', 
      variant: 'LxI', 
      side: 'Right Hand', 
      position: 9, 
      category: 'LD Gap',
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
      markupPoints: [
        { x: 75, y: 60, label: 'Gap Point', type: 'measurement' },
        { x: 200, y: 180, label: 'Edge', type: 'inspection' }
      ]
    },
    { 
      id: 3, 
      part: 'Door', 
      model: 'YGB', 
      variant: 'LxI', 
      side: 'Right Hand', 
      position: 8, 
      category: 'Supplier Part',
      imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
      markupPoints: [
        { x: 120, y: 90, label: 'Supplier Mark', type: 'defect' },
        { x: 180, y: 150, label: 'Part Number', type: 'inspection' }
      ]
    },
    { 
      id: 4, 
      part: 'Door', 
      model: 'YGB', 
      variant: 'VxI', 
      side: 'Right Hand', 
      position: 7, 
      category: 'All',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      markupPoints: [
        { x: 90, y: 110, label: 'Center Point', type: 'measurement' }
      ]
    },
    { 
      id: 5, 
      part: 'Door', 
      model: 'YGB', 
      variant: 'VxI', 
      side: 'Right Hand', 
      position: 6, 
      category: 'CMM',
      imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop',
      markupPoints: [
        { x: 60, y: 70, label: 'CMM Point 1', type: 'measurement' },
        { x: 140, y: 140, label: 'CMM Point 2', type: 'measurement' }
      ]
    },
    { 
      id: 6, 
      part: 'Door', 
      model: 'YGB', 
      variant: 'VxI', 
      side: 'Right Hand', 
      position: 5, 
      category: 'CMM',
      imageUrl: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop',
      markupPoints: [
        { x: 100, y: 50, label: 'Upper Point', type: 'inspection' },
        { x: 80, y: 160, label: 'Lower Point', type: 'measurement' }
      ]
    },
    { 
      id: 7, 
      part: 'Door', 
      model: 'YGB', 
      variant: 'ZxI', 
      side: 'Right Hand', 
      position: 4, 
      category: 'CMM',
      imageUrl: 'https://images.unsplash.com/photo-1493663284031-b7e3aaa4c4ae?w=400&h=300&fit=crop',
      markupPoints: [
        { x: 130, y: 100, label: 'Critical Point', type: 'defect' }
      ]
    },
    { 
      id: 8, 
      part: 'Door', 
      model: 'YGB', 
      variant: 'ZxI', 
      side: 'Right Hand', 
      position: 3, 
      category: 'All',
      imageUrl: 'https://images.unsplash.com/photo-1605711285791-0219e80e43a3?w=400&h=300&fit=crop',
      markupPoints: [
        { x: 110, y: 80, label: 'Reference', type: 'inspection' },
        { x: 170, y: 120, label: 'Check Point', type: 'measurement' }
      ]
    },
    { 
      id: 9, 
      part: 'Door', 
      model: 'YGB', 
      variant: 'ZxI', 
      side: 'Right Hand', 
      position: 2, 
      category: 'All',
      imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop',
      markupPoints: [
        { x: 85, y: 95, label: 'Main Point', type: 'measurement' }
      ]
    },
    { 
      id: 10, 
      part: 'Door', 
      model: 'YGB', 
      variant: 'ZxI', 
      side: 'Right Hand', 
      position: 1, 
      category: 'LD Gap',
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
      markupPoints: [
        { x: 95, y: 75, label: 'Gap Measurement', type: 'measurement' },
        { x: 160, y: 130, label: 'Secondary Gap', type: 'measurement' }
      ]
    }
  ];

  const filteredData = partsData.filter(item =>
    Object.values(item).some(value =>
      value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleRowSelect = (id) => {
    const newSelectedRows = selectedRows.includes(id)
      ? selectedRows.filter(rowId => rowId !== id)
      : [...selectedRows, id];
    
    setSelectedRows(newSelectedRows);
    
    if (!selectedRows.includes(id)) {
      const selectedItem = partsData.find(item => item.id === id);
      setSelectedPart(selectedItem);
    } else if (newSelectedRows.length === 0) {
      setSelectedPart(null);
    } else {
      const lastSelectedId = newSelectedRows[newSelectedRows.length - 1];
      const lastSelectedItem = partsData.find(item => item.id === lastSelectedId);
      setSelectedPart(lastSelectedItem);
    }
  };

  const handleDropdownClick = (event, itemId) => {
    setAnchorEl(event.currentTarget);
    setActiveDropdown(itemId);
  };

  const handleDropdownClose = () => {
    setAnchorEl(null);
    setActiveDropdown(null);
  };

  const handleDropdownAction = (action, item) => {
    console.log(`${action} action for:`, item);
    handleDropdownClose();
  };

  return (
    <MainContainer>
      <Container maxWidth="xl">
        {/* Header */}
        <HeaderSection elevation={1}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Parts Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ borderRadius: 2 }}
            >
              Add Part
            </Button>
          </Box>
          
          {/* Search and Filters */}
          <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
            <TextField
              fullWidth
              placeholder="Search parts, models, variants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ borderRadius: 2 }}
            />
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              sx={{ borderRadius: 2, minWidth: 120 }}
            >
              Filters
            </Button>
          </Box>
        </HeaderSection>

        {/* Main Content */}
        <ContentContainer>
          {/* Table Section */}
          <TableSection>
            <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
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
                  {filteredData.map((item) => (
                    <TableRow
                      key={item.id}
                      hover
                      selected={selectedRows.includes(item.id)}
                      sx={{
                        '&.Mui-selected': {
                          backgroundColor: '#e3f2fd',
                        },
                      }}
                    >
                      <StyledTableCell>
                        <Checkbox
                          checked={selectedRows.includes(item.id)}
                          onChange={() => handleRowSelect(item.id)}
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
                          onClick={(e) => handleDropdownClick(e, item.id)}
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

          {/* Part View Panel */}
          <PartViewPanel>
            <PartViewHeader>
              <Typography variant="h6" fontWeight="semibold">
                Part View
              </Typography>
            </PartViewHeader>
            <Box flex={1} p={2} display="flex">
              {selectedPart ? (
                <Box width="100%" display="flex" flexDirection="column">
                  <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <ImageContainer>
                      <CardMedia
                        component="img"
                        image={selectedPart.imageUrl}
                        alt={`${selectedPart.part} - ${selectedPart.model}`}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {/* Markup Points Overlay */}
                      {selectedPart.markupPoints.map((point, index) => (
                        <Tooltip key={index} title={point.label} arrow>
                          <MarkupPoint
                            sx={{
                              left: point.x,
                              top: point.y,
                            }}
                          >
                            <Typography>{index + 1}</Typography>
                          </MarkupPoint>
                        </Tooltip>
                      ))}
                    </ImageContainer>
                  </Card>
                </Box>
              ) : (
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  width="100%"
                  color="text.secondary"
                >
                  <VisibilityIcon sx={{ fontSize: 48, mb: 2, color: 'action.disabled' }} />
                  <Typography variant="body2">Select a part to view</Typography>
                  <Typography variant="caption" sx={{ mt: 1, textAlign: 'center' }}>
                    Check the checkbox of any row to see part image with markup points
                  </Typography>
                </Box>
              )}
            </Box>
          </PartViewPanel>
        </ContentContainer>

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
      </Container>
    </MainContainer>
  );
}