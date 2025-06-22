import React, { useState, useRef } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  styled
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  CloudUpload as CloudUploadIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
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
  
  // Add Part Modal States
  const [addPartModal, setAddPartModal] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [newPartData, setNewPartData] = useState({
    part: '',
    model: '',
    variant: '',
    side: ''
  });
  const [tempMarkupPoints, setTempMarkupPoints] = useState([]);
  
  // Point Modal States
  const [pointModal, setPointModal] = useState(false);
  const [currentPoint, setCurrentPoint] = useState({ x: 0, y: 0 });
  const [pointData, setPointData] = useState({ position: '', category: '' });
  
  // File input ref
  const fileInputRef = useRef(null);

  const [partsData, setPartsData] = useState([
    { 
      id: 1, 
      part: 'Door', 
      model: 'YGB', 
      variant: 'LxI', 
      side: 'Right Hand',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      markupPoints: [
        { x: 50, y: 80, position: 10, category: 'CMM' },
        { x: 150, y: 120, position: 9, category: 'LD Gap' }
      ]
    },
    { 
      id: 2, 
      part: 'Door', 
      model: 'YGB', 
      variant: 'LxI', 
      side: 'Right Hand',
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
      markupPoints: [
        { x: 75, y: 60, position: 8, category: 'Supplier Part' },
        { x: 200, y: 180, position: 7, category: 'All' }
      ]
    },
    { 
      id: 3, 
      part: 'Door', 
      model: 'YGB', 
      variant: 'LxI', 
      side: 'Right Hand',
      imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
      markupPoints: [
        { x: 120, y: 90, position: 6, category: 'CMM' },
        { x: 180, y: 150, position: 5, category: 'CMM' }
      ]
    },
    { 
      id: 4, 
      part: 'Door', 
      model: 'YGB', 
      variant: 'VxI', 
      side: 'Right Hand',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      markupPoints: [
        { x: 90, y: 110, position: 4, category: 'CMM' }
      ]
    },
    { 
      id: 5, 
      part: 'Door', 
      model: 'YGB', 
      variant: 'VxI', 
      side: 'Right Hand',
      imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop',
      markupPoints: [
        { x: 60, y: 70, position: 3, category: 'All' },
        { x: 140, y: 140, position: 2, category: 'All' }
      ]
    },
    { 
      id: 6, 
      part: 'Door', 
      model: 'YGB', 
      variant: 'VxI', 
      side: 'Right Hand',
      imageUrl: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop',
      markupPoints: [
        { x: 100, y: 50, position: 1, category: 'LD Gap' },
        { x: 80, y: 160, position: 10, category: 'CMM' }
      ]
    },
    { 
      id: 7, 
      part: 'Door', 
      model: 'YGB', 
      variant: 'ZxI', 
      side: 'Right Hand',
      imageUrl: 'https://images.unsplash.com/photo-1493663284031-b7e3aaa4c4ae?w=400&h=300&fit=crop',
      markupPoints: [
        { x: 130, y: 100, position: 9, category: 'LD Gap' }
      ]
    },
    { 
      id: 8, 
      part: 'Door', 
      model: 'YGB', 
      variant: 'ZxI', 
      side: 'Right Hand',
      imageUrl: 'https://images.unsplash.com/photo-1605711285791-0219e80e43a3?w=400&h=300&fit=crop',
      markupPoints: [
        { x: 110, y: 80, position: 8, category: 'Supplier Part' },
        { x: 170, y: 120, position: 7, category: 'All' }
      ]
    },
    { 
      id: 9, 
      part: 'Door', 
      model: 'YGB', 
      variant: 'ZxI', 
      side: 'Right Hand',
      imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop',
      markupPoints: [
        { x: 85, y: 95, position: 6, category: 'CMM' }
      ]
    },
    { 
      id: 10, 
      part: 'Door', 
      model: 'YGB', 
      variant: 'ZxI', 
      side: 'Right Hand',
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
      markupPoints: [
        { x: 95, y: 75, position: 5, category: 'CMM' },
        { x: 160, y: 130, position: 4, category: 'CMM' }
      ]
    }
  ]);

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

  // Add Part Modal Handlers
  const handleAddPartClick = () => {
    setAddPartModal(true);
    setUploadedImage(null);
    setNewPartData({ part: '', model: '', variant: '', side: '' });
    setTempMarkupPoints([]);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
        setTempMarkupPoints([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = (event) => {
    if (!uploadedImage) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    setCurrentPoint({ x, y });
    setPointModal(true);
    setPointData({ position: '', category: '' });
  };

  const handlePointSubmit = () => {
    if (pointData.position && pointData.category) {
      const newPoint = {
        x: currentPoint.x,
        y: currentPoint.y,
        position: parseInt(pointData.position),
        category: pointData.category
      };
      setTempMarkupPoints(prev => [...prev, newPoint]);
      setPointModal(false);
      setPointData({ position: '', category: '' });
    }
  };

  const handlePartSubmit = () => {
    if (newPartData.part && newPartData.model && newPartData.variant && 
        newPartData.side && uploadedImage && tempMarkupPoints.length > 0) {
      const newPart = {
        id: Date.now(),
        ...newPartData,
        imageUrl: uploadedImage,
        markupPoints: tempMarkupPoints
      };
      setPartsData(prev => [...prev, newPart]);
      setAddPartModal(false);
      setUploadedImage(null);
      setNewPartData({ part: '', model: '', variant: '', side: '' });
      setTempMarkupPoints([]);
    }
  };

  const categoryOptions = ['CMM', 'LD Gap', 'Supplier Part', 'All'];

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
              onClick={handleAddPartClick}
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
                        <Tooltip key={index} title={`Position: ${point.position}, Category: ${point.category}`} arrow>
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

        {/* Add Part Modal */}
        <Dialog 
          open={addPartModal} 
          onClose={() => setAddPartModal(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3, minHeight: '80vh' }
          }}
        >
          <DialogTitle>
            <Typography variant="h6" component="span">
              Add New Part
            </Typography>
          </DialogTitle>
          
          <DialogContent sx={{ pt: 3 }}>
            <Box display="flex" flexDirection="column" gap={3}>
              {/* Part Details Form */}
              <Box display="flex" gap={2}>
                <TextField
                  label="Part"
                  value={newPartData.part}
                  onChange={(e) => setNewPartData(prev => ({ ...prev, part: e.target.value }))}
                  fullWidth
                  variant="outlined"
                />
                <TextField
                  label="Model"
                  value={newPartData.model}
                  onChange={(e) => setNewPartData(prev => ({ ...prev, model: e.target.value }))}
                  fullWidth
                  variant="outlined"
                />
              </Box>
              
              <Box display="flex" gap={2}>
                <TextField
                  label="Variant"
                  value={newPartData.variant}
                  onChange={(e) => setNewPartData(prev => ({ ...prev, variant: e.target.value }))}
                  fullWidth
                  variant="outlined"
                />
                <TextField
                  label="Side"
                  value={newPartData.side}
                  onChange={(e) => setNewPartData(prev => ({ ...prev, side: e.target.value }))}
                  fullWidth
                  variant="outlined"
                />
              </Box>

              {/* Image Upload */}
              <Box>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                />
                <Button
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ mb: 2 }}
                >
                  Upload Image
                </Button>

                {/* Image Display with Markup Points */}
                {uploadedImage && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Click on the image to add markup points:
                    </Typography>
                    <Card sx={{ maxWidth: '100%', border: '2px solid #1976d2' }}>
                      <Box
                        component="img"
                        src={uploadedImage}
                        alt="Uploaded part"
                        onClick={handleImageClick}
                        sx={{
                          width: '100%',
                          maxHeight: '400px',
                          objectFit: 'contain',
                          cursor: 'crosshair',
                          position: 'relative'
                        }}
                      />
                      {/* Temporary Markup Points */}
                      <Box sx={{ position: 'relative' }}>
                        {tempMarkupPoints.map((point, index) => (
                          <Box
                            key={index}
                            sx={{
                              position: 'absolute',
                              left: point.x - 12,
                              top: point.y - 12 - 400, // Adjust for image height
                              width: 24,
                              height: 24,
                              backgroundColor: 'white',
                              border: '2px solid white',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                              fontSize: 12,
                              fontWeight: 500,
                              color: 'black',
                              zIndex: 10
                            }}
                          >
                            {index + 1}
                          </Box>
                        ))}
                      </Box>
                    </Card>
                    
                    {tempMarkupPoints.length > 0 && (
                      <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                        {tempMarkupPoints.length} markup point(s) added
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={() => setAddPartModal(false)}
              startIcon={<CancelIcon />}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePartSubmit}
              startIcon={<SaveIcon />}
              variant="contained"
              disabled={!newPartData.part || !newPartData.model || !newPartData.variant || 
                       !newPartData.side || !uploadedImage || tempMarkupPoints.length === 0}
            >
              Save Part
            </Button>
          </DialogActions>
        </Dialog>

        {/* Point Details Modal */}
        <Dialog 
          open={pointModal} 
          onClose={() => setPointModal(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Add Markup Point
          </DialogTitle>
          
          <DialogContent sx={{ pt: 3 }}>
            <Box display="flex" flexDirection="column" gap={3}>
              <TextField
                label="Position"
                type="number"
                value={pointData.position}
                onChange={(e) => setPointData(prev => ({ ...prev, position: e.target.value }))}
                fullWidth
                variant="outlined"
              />
              
              <FormControl fullWidth variant="outlined">
                <InputLabel>Category</InputLabel>
                <Select
                  value={pointData.category}
                  onChange={(e) => setPointData(prev => ({ ...prev, category: e.target.value }))}
                  label="Category"
                >
                  {categoryOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={() => setPointModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handlePointSubmit}
              variant="contained"
              disabled={!pointData.position || !pointData.category}
            >
              Add Point
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </MainContainer>
  );
}