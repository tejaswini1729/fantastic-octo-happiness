import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled components
const GradientContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: theme.spacing(2.5),
}));

const MainCard = styled(Paper)(({ theme }) => ({
  maxWidth: 900,
  margin: '0 auto',
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(3, 4),
  backgroundColor: theme.palette.grey[50],
  borderBottom: `1px solid ${theme.palette.divider}`,
}));
const UploadSection = styled(Box)(({ theme }) => ({
  border: '2px dashed #cbd5e0',
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(5),
  textAlign: 'center',
  marginBottom: theme.spacing(4),
  transition: 'all 0.3s',
  cursor: 'pointer',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  '&.has-image': {
    border: 'none',
    padding: 0,
    background: 'none',
    cursor: 'default',
  },
}));

const PositionPoint = styled(Box)(({ theme, isLabeled }) => ({
  position: 'absolute',
  width: isLabeled ? 'auto' : 24,
  minWidth: 24,
  maxWidth: 120,
  height: 24,
  border: `3px solid ${theme.palette.primary.main}`,
  background: isLabeled ? theme.palette.primary.main : 'white',
  borderRadius: isLabeled ? '12px' : '50%',
  transform: 'translate(-50%, -50%)',
  cursor: 'pointer',
  boxShadow: `0 4px 12px ${theme.palette.primary.main}40`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: isLabeled ? '10px' : '12px',
  fontWeight: 'bold',
  color: isLabeled ? 'white' : theme.palette.primary.main,
  transition: 'all 0.2s',
  padding: isLabeled ? '2px 8px' : '2px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  '&:hover': {
    transform: 'translate(-50%, -50%) scale(1.2)',
    boxShadow: `0 6px 16px ${theme.palette.primary.main}60`,
  },
  '&::before': !isLabeled ? {
    content: '"•"',
    fontSize: '12px',
    color: theme.palette.primary.main,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  } : {},
}));

const TooltipModal = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  width: 200,
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(1),
  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  zIndex: 1000,
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 8,
    bottom: -4,
    width: 8,
    height: 8,
    background: 'rgba(255, 255, 255, 0.95)',
    transform: 'rotate(45deg)',
    zIndex: 999,
  },
}));

const PositionMarkingInterface = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [positions, setPositions] = useState([]);
  const [currentPoint, setCurrentPoint] = useState(null);
  const [positionCounter, setPositionCounter] = useState(0);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [formData, setFormData] = useState({ name: '', category: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const fileInputRef = useRef(null);
  const imageRef = useRef(null);
  const tooltipRef = useRef(null);

  const equipmentInfo = {
    equipment: 'JIG MAI',
    side: 'Right Hand',
    building: 'Manufacturing Unit A'
  };

  const categories = [
    { value: '', label: 'All' },
    { value: 'motor', label: 'Motor' },
    { value: 'sensor', label: 'Sensor' },
    { value: 'valve', label: 'Valve' },
    { value: 'pump', label: 'Pump' },
    { value: 'control', label: 'Control Panel' },
    { value: 'bearing', label: 'Bearing' },
    { value: 'coupling', label: 'Coupling' },
    { value: 'other', label: 'Other' }
  ];

  const showNotification = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    if (!uploadedImage) {
      fileInputRef.current?.click();
    }
  };

  const closeTooltip = useCallback(() => {
    setTooltipVisible(false);
    setFormData({ name: '', category: '' });
    
    // Delete unsaved point
    if (currentPoint && !positions.find(p => p.id === currentPoint.id)) {
      setPositionCounter(prev => prev - 1);
    }
    
    setCurrentPoint(null);
  }, [currentPoint, positions]);

  const closeTooltipOnly = useCallback(() => {
    setTooltipVisible(false);
    setFormData({ name: '', category: '' });
    setCurrentPoint(null);
  }, []);

  const addPositionPoint = (event) => {
    event.stopPropagation();
    
    // Close existing tooltip and delete unsaved points
    if (currentPoint && !positions.find(p => p.id === currentPoint.id)) {
      setPositionCounter(prev => prev - 1);
    }
    closeTooltipOnly();

    const img = imageRef.current;
    const rect = img.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Calculate relative position as percentage
    const relativeX = (x / rect.width) * 100;
    const relativeY = (y / rect.height) * 100;
    
    const newCounter = positionCounter + 1;
    setPositionCounter(newCounter);
    
    const newPoint = {
      id: newCounter,
      x: relativeX,
      y: relativeY,
      screenX: x,
      screenY: y
    };
    
    setCurrentPoint(newPoint);
    
    // Position tooltip
    const tooltipX = relativeX;
    const tooltipY = relativeY - 1;
    
    setTooltipPosition({
      x: Math.min(tooltipX, 78),
      y: Math.max(0, tooltipY)
    });
    
    setTooltipVisible(true);
  };

  const savePosition = () => {
    if (!formData.name.trim()) {
      return;
    }
    
    if (!formData.category) {
      return;
    }
    
    if (currentPoint) {
      const positionData = {
        id: currentPoint.id,
        name: formData.name.trim(),
        category: formData.category,
        x: currentPoint.x,
        y: currentPoint.y
      };
      
      const existingIndex = positions.findIndex(p => p.id === currentPoint.id);
      if (existingIndex >= 0) {
        setPositions(prev => prev.map((p, i) => i === existingIndex ? positionData : p));
      } else {
        setPositions(prev => [...prev, positionData]);
      }
    }
    
    closeTooltipOnly();
    showNotification('Position added successfully!');
  };

  const editPosition = (pointId) => {
    const position = positions.find(p => p.id === pointId);
    if (position) {
      setFormData({ name: position.name, category: position.category });
      setCurrentPoint({
        id: pointId,
        x: position.x,
        y: position.y
      });
      
      setTooltipPosition({
        x: Math.min(position.x, 78),
        y: Math.max(0, position.y - 1)
      });
      
      setTooltipVisible(true);
    }
  };

  // Handle clicks outside tooltip
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipVisible && 
          tooltipRef.current && 
          !tooltipRef.current.contains(event.target) &&
          !event.target.closest('.position-point')) {
        closeTooltip();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape' && tooltipVisible) {
        closeTooltip();
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [tooltipVisible, closeTooltip]);

  const renderPositionPoint = (position, isCurrentPoint) => {
    const savedPosition = positions.find(p => p.id === position.id);
    const isLabeled = Boolean(savedPosition);
    
    return (
      <PositionPoint
        key={isCurrentPoint ? `current-${position.id}` : `saved-${position.id}`}
        className="position-point"
        isLabeled={isLabeled}
        onClick={(e) => {
          e.stopPropagation();
          editPosition(position.id);
        }}
        sx={{
          left: `${position.x}%`,
          top: `${position.y}%`,
        }}
        title={savedPosition ? `${savedPosition.name} (${savedPosition.category})` : ''}
      >
        {isLabeled ? savedPosition.name : null}
      </PositionPoint>
    );
  };

  const renderAllPoints = () => {
    const allPoints = [];
    
    // Add saved positions
    positions.forEach(position => {
      allPoints.push(renderPositionPoint(position, false));
    });
    
    // Add current unsaved point
    if (currentPoint && !positions.find(p => p.id === currentPoint.id)) {
      allPoints.push(renderPositionPoint(currentPoint, true));
    }
    
    return allPoints;
  };

  const handleCloseInterface = () => {
    if (positions.length > 0) {
      if (window.confirm('You have unsaved positions. Are you sure you want to close?')) {
        console.log('Interface closed');
      }
    } else {
      console.log('Interface closed');
    }
  };

  const handleBack = () => {
    if (positions.length > 0) {
      if (window.confirm('You have unsaved positions. Are you sure you want to go back?')) {
        console.log('Going back to previous page');
      }
    } else {
      console.log('Going back to previous page');
    }
  };

  const handleNext = () => {
    if (positions.length === 0) {
      showNotification('Please add at least one position before proceeding.', 'warning');
      return;
    }
    
    console.log('Proceeding with positions:', positions);
    showNotification(`Proceeding with ${positions.length} position(s) marked!`);
  };

  return (
    <GradientContainer>
      <MainCard elevation={3}>
        {/* Header */}
        <HeaderBox>
          <Typography variant="h5" fontWeight={600} color="text.primary">
            Add Position
          </Typography>
          <IconButton
            onClick={handleCloseInterface}
            sx={{ 
              backgroundColor: 'grey.200',
              '&:hover': { backgroundColor: 'grey.300' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </HeaderBox>

        {/* Main Content */}
        <Box sx={{ p: 4 }}>
          {/* Equipment Info */}
          <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Equipment
              </Typography>
              <Typography variant="body1" fontWeight={600} color="text.primary">
                {equipmentInfo.equipment}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Side
              </Typography>
              <Typography variant="body1" fontWeight={600} color="text.primary">
                {equipmentInfo.side}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Building
              </Typography>
              <Typography variant="body1" fontWeight={600} color="text.primary">
                {equipmentInfo.building}
              </Typography>
            </Box>
          </Box>

          {/* Upload Section */}
          <UploadSection
            className={uploadedImage ? 'has-image' : ''}
            onClick={triggerFileInput}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            
            {!uploadedImage ? (
              <>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    margin: '0 auto 16px',
                    backgroundColor: 'grey.200',
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ImageIcon color="action" />
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                  Click to upload equipment image
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Supports JPG, PNG, GIF up to 10MB
                </Typography>
              </>
            ) : (
              <Box
                sx={{
                  position: 'relative',
                  display: 'inline-block',
                  borderRadius: 1.5,
                  overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                }}
              >
                <img
                  ref={imageRef}
                  src={uploadedImage}
                  alt="Equipment"
                  onClick={addPositionPoint}
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    display: 'block',
                    cursor: 'crosshair'
                  }}
                />
                {renderAllPoints()}
              </Box>
            )}
          </UploadSection>

          {uploadedImage && (
            <Box
              sx={{
                textAlign: 'center',
                color: 'text.secondary',
                fontSize: 14,
                p: 2,
                backgroundColor: 'primary.50',
                borderRadius: 1,
                mb: 4
              }}
            >
              Click on the image to mark positions. Each click will add a position marker.
            </Box>
          )}
        </Box>

        {/* Navigation */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 3,
            backgroundColor: 'grey.50',
            borderTop: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Button 
            variant="outlined" 
            onClick={handleBack}
            sx={{ px: 3, py: 1.5 }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            disabled={positions.length === 0}
            onClick={handleNext}
            sx={{ px: 3, py: 1.5 }}
          >
            Next
          </Button>
        </Box>
      </MainCard>

      {/* Tooltip Modal */}
      {tooltipVisible && (
        <TooltipModal
          ref={tooltipRef}
          sx={{
            left: `${tooltipPosition.x}%`,
            top: `${tooltipPosition.y}%`,
          }}
        >
          <Box sx={{ p: 2.5 }}>
            <TextField
              fullWidth
              label="Position"
              variant="standard"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              sx={{ mb: 2 }}
              autoFocus
              InputLabelProps={{
                sx: { fontSize: 13, color: 'text.secondary' }
              }}
              InputProps={{
                sx: { fontSize: 14 }
              }}
            />
            
            <FormControl fullWidth variant="standard" sx={{ mb: 2.5 }}>
              <InputLabel sx={{ fontSize: 13, color: 'text.secondary' }}>
                Category
              </InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                sx={{ fontSize: 14 }}
              >
                {categories.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                onClick={savePosition}
                disabled={!formData.name.trim() || !formData.category}
                sx={{
                  backgroundColor: 'grey.100',
                  color: 'text.primary',
                  boxShadow: 'none',
                  px: 4,
                  py: 1.25,
                  '&:hover': {
                    backgroundColor: 'grey.200',
                    boxShadow: 'none'
                  },
                  '&:disabled': {
                    backgroundColor: 'grey.100',
                    color: 'text.disabled'
                  }
                }}
              >
                Add
              </Button>
            </Box>
          </Box>
        </TooltipModal>
      )}

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </GradientContainer>
  );
};

export default PositionMarkingInterface;