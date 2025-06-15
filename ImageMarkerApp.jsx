import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Badge,
  Grid,
  Divider,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Image as ImageIcon,  LocationOn as LocationOnIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const ImageMarkerApp = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [points, setPoints] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [currentPoint, setCurrentPoint] = useState({ x: 0, y: 0 });
  const [formData, setFormData] = useState({ number: '', name: '', part: '' });
  const [errors, setErrors] = useState({});
  const imageRef = useRef(null);
  const fileInputRef = useRef(null);

  // Predefined part options
  const partOptions = [
    'Engine',
    'Transmission',
    'Brake System',
    'Suspension',
    'Electrical System',
    'Cooling System',
    'Fuel System',
    'Exhaust System',
    'Steering System',
    'Body Panel',
    'Interior Component',
    'Safety Equipment',
    'Other'
  ];

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
        setPoints([]);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleImageClick = (event) => {
    if (!uploadedImage) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setCurrentPoint({ x, y });
    setShowForm(true);
    setFormData({ number: '', name: '', part: '' });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.number.trim()) newErrors.number = 'Number is required';
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.part.trim()) newErrors.part = 'Part is required';
    
    // Check if number already exists
    if (formData.number && points.some(p => p.number === formData.number)) {
      newErrors.number = 'This number already exists';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = () => {
    if (validateForm()) {
      const newPoint = {
        id: Date.now(),
        x: currentPoint.x,
        y: currentPoint.y,
        number: formData.number,
        name: formData.name,
        part: formData.part
      };

      setPoints([...points, newPoint]);
      setShowForm(false);
      setFormData({ number: '', name: '', part: '' });
      setErrors({});
    }
  };
  const handleFormCancel = () => {
    setShowForm(false);
    setFormData({ number: '', name: '', part: '' });
    setErrors({});
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleFormSubmit();
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography 
        variant="h3" 
        component="h1" 
        align="center" 
        gutterBottom
        sx={{ 
          mb: 4, 
          fontWeight: 'bold',
          background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        Image Point Marker
      </Typography>
      {/* Upload Section */}
      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <ImageIcon color="primary" />
            <Typography variant="h5" component="h2" fontWeight="medium">
              Upload Image
            </Typography>
          </Stack>
          
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
            ref={fileInputRef}
          />
          
          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            onClick={triggerFileInput}
            size="large"
            sx={{ 
              minWidth: 200,
              py: 1.5,
              background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1565c0, #1976d2)',
              }
            }}
          >
            Choose Image File
          </Button>
        </CardContent>
      </Card>
      {/* Image Display Section */}
      {uploadedImage && (
        <Card sx={{ mb: 3, boxShadow: 3 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <LocationOnIcon color="primary" />
              <Typography variant="h5" component="h2" fontWeight="medium">
                Mark Points on Image
              </Typography>
              <Badge 
                badgeContent={points.length} 
                color="secondary"
                sx={{ ml: 'auto' }}
              >
                <Chip 
                  label={`${points.length} Points Marked`}
                  color="primary"
                  variant="outlined"
                />
              </Badge>
            </Stack>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Click anywhere on the image to add a new point marker
            </Typography>
            
            <Box 
              sx={{ 
                position: 'relative', 
                display: 'inline-block',
                border: '3px solid',
                borderColor: 'primary.main',
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: 2
              }}
            >              <Box
                component="img"
                ref={imageRef}
                src={uploadedImage}
                alt="Uploaded"
                onClick={handleImageClick}
                sx={{
                  maxWidth: '100%',
                  height: 'auto',
                  maxHeight: '600px',
                  cursor: 'crosshair',
                  display: 'block'
                }}
              />
              
              {/* Render marked points */}
              {points.map((point) => (
                <Tooltip 
                  key={point.id}
                  title={
                    <Box>
                      <Typography variant="subtitle2">{point.name}</Typography>
                      <Typography variant="body2">{point.part}</Typography>
                      <Typography variant="caption">
                        Position: ({Math.round(point.x)}, {Math.round(point.y)})
                      </Typography>
                    </Box>
                  }
                  arrow
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      left: point.x - 20,
                      top: point.y - 20,
                      width: 40,
                      height: 40,
                      bgcolor: 'error.main',
                      border: '3px solid white',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      cursor: 'pointer',
                      boxShadow: 3,
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'scale(1.1)',
                        boxShadow: 4
                      }
                    }}
                  >
                    {point.number}
                  </Box>
                </Tooltip>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}
      {/* Form Dialog */}
      <Dialog 
        open={showForm} 
        onClose={handleFormCancel}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <AddIcon color="primary" />
            <Typography variant="h6" component="span">
              Add Point Information
            </Typography>
          </Stack>
        </DialogTitle>
        
        <Divider />
        
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Number"
                value={formData.number}
                onChange={(e) => handleInputChange('number', e.target.value)}
                onKeyPress={handleKeyPress}
                error={!!errors.number}
                helperText={errors.number}
                fullWidth
                autoFocus
                variant="outlined"
                placeholder="Enter a unique number"
              />
            </Grid>            
            <Grid item xs={12}>
              <TextField
                label="Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                onKeyPress={handleKeyPress}
                error={!!errors.name}
                helperText={errors.name}
                fullWidth
                variant="outlined"
                placeholder="Enter name"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl 
                fullWidth 
                variant="outlined" 
                error={!!errors.part}
              >
                <InputLabel id="part-select-label">Part</InputLabel>
                <Select
                  labelId="part-select-label"
                  value={formData.part}
                  onChange={(e) => handleInputChange('part', e.target.value)}
                  label="Part"
                  placeholder="Select a part"
                >
                  {partOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                {errors.part && (
                  <FormHelperText>{errors.part}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>        
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={handleFormCancel}
            startIcon={<CancelIcon />}
            variant="outlined"
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={handleFormSubmit}
            startIcon={<SaveIcon />}
            variant="contained"
            disabled={!formData.number || !formData.name || !formData.part}
            sx={{ ml: 1 }}
          >
            Save Point
          </Button>
        </DialogActions>
      </Dialog>

      {/* Points List */}
      {points.length > 0 && (
        <Card sx={{ boxShadow: 3 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
              <InfoIcon color="primary" />
              <Typography variant="h5" component="h2" fontWeight="medium">
                Marked Points Summary
              </Typography>
              <Chip 
                label={`${points.length} Total`}
                color="success"
                size="small"
              />
            </Stack>            
            <Grid container spacing={2}>
              {points.map((point) => (
                <Grid item xs={12} sm={6} md={4} key={point.id}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      p: 2,
                      transition: 'all 0.2s',
                      '&:hover': { 
                        boxShadow: 3,
                        transform: 'translateY(-2px)',
                        borderColor: 'primary.main'
                      }
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: 'error.main',
                          border: '2px solid white',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '14px',
                          boxShadow: 2,
                          flexShrink: 0
                        }}
                      >
                        {point.number}
                      </Box>
                      <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                        {point.name}
                      </Typography>
                    </Stack>                    
                    <Typography variant="body1" color="text.primary" sx={{ mb: 1 }}>
                      <strong>Part:</strong> {point.part}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary">
                      <strong>Position:</strong> ({Math.round(point.x)}, {Math.round(point.y)})
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default ImageMarkerApp;