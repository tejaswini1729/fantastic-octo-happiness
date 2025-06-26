// RESPONSIVE & SCALE-INVARIANT VERSION - Points maintain exact position across all screen sizes
import { useState, useEffect, useRef } from "react";
import PrimaryButton from "../../../components/Buttons/PrimaryButton/PrimaryButton";
import SecondaryButton from "../../../components/Buttons/SecondaryButton/SecondaryButton";
import { Snackbar, Alert } from "@mui/material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Select,
  MenuItem,
  Box,
  Typography,
  FormControl,
  InputLabel,
  LinearProgress,
  TextField,
  Button,
  Card,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import WarningIcon from "@mui/icons-material/Warning";
import fileIcon from "../../../assets/icons/fileIcon.svg";
import addPhoto from "../../../assets/icons/addPhoto.svg";
import { ADD_MDL } from "./constants";

function bytesToSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  else return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

const partOptions = [
  { key: "partA", label: "Part A" },
  { key: "partB", label: "Part B" },
];

const modelOptions = [
  { key: "model1", label: "Model 1" },
  { key: "model2", label: "Model 2" },
];

const variantOptions = [
  { key: "variant1", label: "Variant 1" },
  { key: "variant2", label: "Variant 2" },
];

const sideOptions = [
  { key: "rightHand", label: "Right Hand" },
  { key: "leftHand", label: "Left Hand" },
];

const categoryOptions = ["CMM", "LD Gap", "Supplier Part", "All"];

const AddPartModal = ({ open, onClose, onNext, editData, onEditSubmit }) => {
  const [form, setForm] = useState({
    part: "",
    model: "",
    variant: "",
    image: null,
    imageUrl: null,
  });
  const [tempMarkupPoints, setTempMarkupPoints] = useState([]);
  const [currentPoint, setCurrentPoint] = useState({ x: 0, y: 0 });
  const [pointModal, setPointModal] = useState(false);
  const [pointData, setPointData] = useState({ position: "", category: "" });
  const [side, setSide] = useState("");
  const [isDisabled, setIsDisabled] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(1);
  
  // NEW: Edit mode functionality
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPointIndex, setEditingPointIndex] = useState(-1);
  const [confirmEditOpen, setConfirmEditOpen] = useState(false);
  
  // ENHANCED: Better image tracking for responsive behavior
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const [imageMetadata, setImageMetadata] = useState({
    naturalWidth: 0,
    naturalHeight: 0,
    naturalAspectRatio: 1,
    isLoaded: false
  });

  // RESPONSIVE: Track container and display dimensions
  const [displayState, setDisplayState] = useState({
    containerWidth: 0,
    containerHeight: 0,
    imageDisplayWidth: 0,
    imageDisplayHeight: 0,
    imageAspectRatio: 1,
    scaleX: 1,
    scaleY: 1
  });

  // NEW: Initialize edit mode when editData is provided
  useEffect(() => {
    if (editData && open) {
      setIsEditMode(true);
      setStep(2);
      
      const { partData } = editData;
      setForm({
        part: partData.part,
        model: partData.model,
        variant: partData.variant,
        image: { name: "existing-image.jpg", size: 1024 }, // Mock file object
        imageUrl: partData.imageUrl,
      });
      setSide(partData.side);
      setTempMarkupPoints([...partData.markupPoints]);
      setProgress(100);
      setIsDisabled(false);
    } else if (!editData) {
      setIsEditMode(false);
      setStep(1);
    }
  }, [editData, open]);

  // NEW: Reset form function
  const resetForm = () => {
    setForm({
      part: "",
      model: "",
      variant: "",
      image: null,
      imageUrl: null,
    });
    setTempMarkupPoints([]);
    setSide("");
    setImageMetadata({
      naturalWidth: 0,
      naturalHeight: 0,
      naturalAspectRatio: 1,
      isLoaded: false
    });
    setIsDisabled(true);
    setStep(1);
    setIsEditMode(false);
    setEditingPointIndex(-1);
    setProgress(0);
  };

  const handleClose = () => {
    if (step == 1) {
      resetForm(); // CHANGED: Use resetForm function
      onClose();
    } else {
      setIsDisabled(false);
      setStep((prevStep) => prevStep - 1);
    }
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleDelete = () => {
    handleChange("image", null);
    handleChange("imageUrl", null);
    setProgress(0);
    setTempMarkupPoints([]);
    setImageMetadata({
      naturalWidth: 0,
      naturalHeight: 0,
      naturalAspectRatio: 1,
      isLoaded: false
    });
  };

  function mapDataRecord() {
    const data = {
      part: form.part,
      model: form.model,
      variant: form.variant,
      side: side, // NEW: Include side in data
      imageUrl: form.imageUrl,
      imageMetadata: imageMetadata, // ENHANCED: Store image metadata
      markupPoints: tempMarkupPoints.map((point) => ({
        x: point.x,
        y: point.y,
        position: point.position,
        category: point.category,
        // ENHANCED: Store additional metadata for future scaling
        originalImageWidth: imageMetadata.naturalWidth,
        originalImageHeight: imageMetadata.naturalHeight,
        timestamp: Date.now()
      })),
    };
    return data;
  }

  // CHANGED: Handle both add and edit operations
  const hanldeOnNext = () => {
    step === 1 && step === 3 ? setIsDisabled(true) : setIsDisabled(false);
    if (step === 3) {
      if (isEditMode) {
        setConfirmEditOpen(true); // NEW: Show confirmation for edit
      } else {
        const data = mapDataRecord();
        onNext(data);
        resetForm(); // NEW: Reset form after add
      }
    } else {
      setStep((prev) => prev + 1);
    }
  };

  // NEW: Handle edit confirmation
  const handleEditConfirm = () => {
    const updatedData = mapDataRecord();
    onEditSubmit({
      partData: editData.partData,
      markupPointIndex: editData.markupPointIndex,
      updatedData: updatedData
    });
    setConfirmEditOpen(false);
    resetForm();
  };

  const handleImageSelect = (e) => {
    if (isEditMode) return; // NEW: Prevent image changes in edit mode
    
    e.preventDefault();
    setSnackbarOpen(false);
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        setSnackbarOpen(true);
        e.target.value = "";
        return;
      }
      handleChange("image", file);
      const reader = new FileReader();
      reader.onload = (e) => {
        handleChange("imageUrl", e.target.result);
        setTempMarkupPoints([]);
        // Reset image metadata when new image is loaded
        setImageMetadata({
          naturalWidth: 0,
          naturalHeight: 0,
          naturalAspectRatio: 1,
          isLoaded: false
        });
      };
      reader.onerror = () => {
        console.error("File reading error");
        setSnackbarOpen(true);
      };
      reader.readAsDataURL(file);
      setProgress(0);
      let percent = 0;
      const interval = setInterval(() => {
        percent += 5;
        setProgress(percent);
        if (percent >= 100) clearInterval(interval);
      }, 15);
    }
  };

  // ENHANCED: Comprehensive image load handler
  const handleImageLoad = () => {
    if (!imageRef.current) return;
    
    const img = imageRef.current;
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    const naturalAspectRatio = naturalWidth / naturalHeight;
    
    // Update image metadata
    setImageMetadata({
      naturalWidth,
      naturalHeight,
      naturalAspectRatio,
      isLoaded: true
    });
    
    // Update display state
    updateDisplayDimensions();
    
    console.log('Image loaded with metadata:', {
      naturalWidth,
      naturalHeight,
      naturalAspectRatio: naturalAspectRatio.toFixed(3)
    });
  };

  // RESPONSIVE: Calculate current display dimensions and scaling factors
  const updateDisplayDimensions = () => {
    if (!imageRef.current || !containerRef.current) return;
    
    const img = imageRef.current;
    const container = containerRef.current;
    
    const imgRect = img.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    const displayState = {
      containerWidth: containerRect.width,
      containerHeight: containerRect.height,
      imageDisplayWidth: imgRect.width,
      imageDisplayHeight: imgRect.height,
      imageAspectRatio: imgRect.width / imgRect.height,
      scaleX: imgRect.width / img.naturalWidth,
      scaleY: imgRect.height / img.naturalHeight
    };
    
    setDisplayState(displayState);
    
    console.log('Display dimensions updated:', displayState);
  };

  // SCALE-INVARIANT: Convert click coordinates to image-relative percentages
  const handleImageClick = (event) => {
    if (!form.imageUrl || !imageRef.current || !imageMetadata.isLoaded) {
      console.warn('Image not ready for markup');
      return;
    }
    
    event.preventDefault();
    event.stopPropagation();

    const img = imageRef.current;
    const imgRect = img.getBoundingClientRect();
    
    // Get click position relative to the displayed image
    const clickX = event.clientX - imgRect.left;
    const clickY = event.clientY - imgRect.top;
    
    // CRITICAL: Convert to percentage of the actual displayed image (not container)
    const xPercent = (clickX / imgRect.width) * 100;
    const yPercent = (clickY / imgRect.height) * 100;
    
    // Ensure coordinates are within bounds
    const clampedX = Math.max(0, Math.min(100, xPercent));
    const clampedY = Math.max(0, Math.min(100, yPercent));

    console.log('Click processed:', {
      clickPosition: { x: clickX, y: clickY },
      imageDisplaySize: { width: imgRect.width, height: imgRect.height },
      percentages: { x: clampedX.toFixed(2), y: clampedY.toFixed(2) },
      imageMetadata
    });

    setCurrentPoint({ x: clampedX, y: clampedY });
    setPointModal(true);
    setPointData({ position: "", category: "" });
  };

  const handlePointSubmit = () => {
    if (pointData.position && pointData.category) {
      if (editingPointIndex !== -1) {
        // NEW: Update existing point
        const updatedPoints = [...tempMarkupPoints];
        updatedPoints[editingPointIndex] = {
          ...updatedPoints[editingPointIndex],
          position: parseInt(pointData.position),
          category: pointData.category,
        };
        setTempMarkupPoints(updatedPoints);
        setEditingPointIndex(-1);
      } else {
        // Add new point
        const newPoint = {
          x: currentPoint.x,
          y: currentPoint.y,
          position: parseInt(pointData.position),
          category: pointData.category,
          id: Date.now(), // Unique identifier
          imageMetadata: { ...imageMetadata } // Store current image state
        };
        
        console.log('Adding point with metadata:', newPoint);
        setTempMarkupPoints((prev) => [...prev, newPoint]);
      }
      setPointModal(false);
      setPointData({ position: "", category: "" });
    }
  };

  // NEW: Handle point click for editing
  const handlePointClick = (index, point) => {
    if (!isEditMode) return;
    
    setEditingPointIndex(index);
    setPointData({
      position: point.position.toString(),
      category: point.category
    });
    setPointModal(true);
  };

  // NEW: Handle point delete
  const handlePointDelete = (index) => {
    const updatedPoints = tempMarkupPoints.filter((_, i) => i !== index);
    setTempMarkupPoints(updatedPoints);
  };

  // RESPONSIVE: Handle window resize to maintain point accuracy
  useEffect(() => {
    let resizeTimer;
    
    const handleResize = () => {
      // Debounce resize events
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (imageRef.current && imageMetadata.isLoaded) {
          updateDisplayDimensions();
        }
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, [imageMetadata.isLoaded]);

  // Update display dimensions when image metadata changes
  useEffect(() => {
    if (imageMetadata.isLoaded) {
      updateDisplayDimensions();
    }
  }, [imageMetadata.isLoaded]);

  useEffect(() => {
    const hasEmpty = Object.values(form).some((value) => !value);
    setIsDisabled(hasEmpty);
  }, [form]);

  useEffect(() => {
    if (step === 2) {
      if (tempMarkupPoints.length > 0 && side) {
        setIsDisabled(false);
      } else {
        setIsDisabled(true);
      }
    }
  }, [tempMarkupPoints, side]);

  // RESPONSIVE: Component to render points with scale-invariant positioning
  const MarkupPoint = ({ point, index, size = 24, previewMode = false }) => {
    const pointSize = previewMode ? 16 : size;
    
    return (
      <Box
        key={point.id || index}
        sx={{
          position: "absolute",
          // CRITICAL: Use percentage positioning for scale invariance
          left: `${point.x}%`,
          top: `${point.y}%`,
          transform: "translate(-50%, -50%)", // Perfect centering
          width: pointSize,
          height: pointSize,
          backgroundColor: "white",
          border: "2px solid #1976d2",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: previewMode ? 10 : 12,
          fontWeight: 600,
          color: "#1976d2",
          zIndex: 10,
          cursor: isEditMode ? "pointer" : "pointer", // NEW: Different cursor for edit mode
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          userSelect: "none",
          // RESPONSIVE: Smooth transitions for hover states
          transition: "all 0.2s ease-in-out",
          "&:hover": previewMode ? {} : {
            transform: "translate(-50%, -50%) scale(1.15)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
            borderColor: "#1565c0",
          },
        }}
        onClick={previewMode ? undefined : (e) => {
          e.stopPropagation();
          if (isEditMode) {
            handlePointClick(index, point); // NEW: Handle edit click
          }
        }}
        title={`Position: ${point.position}, Category: ${point.category} (${point.x.toFixed(1)}%, ${point.y.toFixed(1)}%)`}
      >
        {point.position}
        {/* NEW: Delete button for edit mode */}
        {isEditMode && (
          <Box
            sx={{
              position: "absolute",
              top: -8,
              right: -8,
              width: 16,
              height: 16,
              backgroundColor: "red",
              color: "white",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: 10,
              "&:hover": { backgroundColor: "darkred" },
            }}
            onClick={(e) => {
              e.stopPropagation();
              handlePointDelete(index);
            }}
          >
            ×
          </Box>
        )}
      </Box>
    );
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: "1px",
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 600,
              fontSize: "16px",
              lineHeight: "100%",
              letterSpacing: "0px",
              color: "#000000",
            }}
          >
            {/* CHANGED: Dynamic title based on mode */}
            {isEditMode 
              ? "Edit Markup Points"
              : step === 1
              ? ADD_MDL?.TTL1
              : step === 2
              ? ADD_MDL?.TTL2
              : ADD_MDL?.TTL3}
          </Typography>
          <IconButton
            onClick={handleClose}
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              color: "#131313",
              width: 32,
              height: 32,
              p: 0,
              pr: "24px",
              "&:hover": {
                background: "none",
              },
            }}
          >
            <CloseIcon sx={{ width: 20, height: 20, color: "#131313" }} />
          </IconButton>
        </DialogTitle>
        <Box sx={{ px: 3 }}>
          <Divider />
        </Box>

        {/* CHANGED: Only show step 1 if not in edit mode */}
        {step == 1 && !isEditMode && (
          <DialogContent sx={{ pt: 3 }}>
            {/* Part Dropdown */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="part-select-label">{ADD_MDL?.DD_LBL}</InputLabel>
              <Select
                labelId="part-select-label"
                value={form.part}
                label={ADD_MDL?.DD_LBL}
                onChange={(e) => handleChange("part", e.target.value)}
              >
                {partOptions.map((part) => (
                  <MenuItem
                    key={part.key}
                    value={part.key}
                    sx={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    {part.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Model and Variant Dropdowns */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="model-select-label">Model</InputLabel>
              <Select
                labelId="model-select-label"
                value={form.model}
                label="Model"
                onChange={(e) => handleChange("model", e.target.value)}
              >
                {modelOptions.map((model) => (
                  <MenuItem key={model.key} value={model.key}>
                    {model.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="variant-select-label">Variant</InputLabel>
              <Select
                labelId="variant-select-label"
                value={form.variant}
                label="Variant"
                onChange={(e) => handleChange("variant", e.target.value)}
              >
                {variantOptions.map((variant) => (
                  <MenuItem key={variant.key} value={variant.key}>
                    {variant.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Image Upload Section */}
            {form?.image ? (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr auto",
                  alignItems: "center",
                  gap: "4px",
                  border: "1px solid #E3E3F1",
                  borderRadius: 2,
                  padding: "8px",
                }}
                fullWidth
              >
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <IconButton>
                    <img src={fileIcon} alt="File Icon" style={{ width: 36, height: 36 }} />
                  </IconButton>
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 400,
                      fontSize: "12px",
                      lineHeight: "150%",
                    }}
                  >
                    {form.image.name}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 400,
                      fontSize: "8px",
                      lineHeight: "150%",
                    }}
                  >
                    {bytesToSize(form.image.size)}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{
                        "& .MuiLinearProgress-bar": {
                          background: "#3F57FF",
                        },
                      }}
                    />
                    <Typography
                      sx={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 400,
                        fontSize: "8px",
                        lineHeight: "150%",
                        textAlign: "right",
                      }}
                    >
                      {progress}%
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <IconButton onClick={handleDelete}>
                    <DeleteIcon sx={{ width: 20, height: 20, color: "#363939" }} />
                  </IconButton>
                </Box>
              </Box>
            ) : (
              <Box
                onDrop={handleImageSelect}
                onDragOver={(e) => e.preventDefault()}
                sx={{
                  border: "0.8px dashed #D2D3D3",
                  p: 3,
                  textAlign: "center",
                  color: "#1976d2",
                  cursor: "pointer",
                  mb: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
                onClick={() => document.getElementById("add-part-image-input").click()}
              >
                <img src={addPhoto} alt="Add" style={{ width: 24, height: 24 }} />
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                  <Typography
                    sx={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 600,
                      fontSize: "14px",
                      color: "#363939",
                    }}
                  >
                    {ADD_MDL?.DROP_IMG}
                  </Typography>
                  <Typography sx={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    <span style={{ fontWeight: 600, fontSize: "8px", color: "#1681EC" }}>
                      {ADD_MDL?.BROWSE_FILE_1}
                    </span>
                    <span style={{ fontWeight: 400, fontSize: "8px", color: "#57595A" }}>
                      {ADD_MDL?.BROWSW_FILE_2}
                    </span>
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 400,
                    fontSize: "8px",
                    color: "#57595A",
                  }}
                >
                  {ADD_MDL?.IMG_INFO}
                </Typography>
                <input
                  id="add-part-image-input"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImageSelect}
                />
              </Box>
            )}
          </DialogContent>
        )}

        {step === 2 && (
          <DialogContent sx={{ pt: 3 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="side-label">Side</InputLabel>
              <Select
                labelId="side-label"
                value={side}
                label="Side"
                disabled={isEditMode} // NEW: Disable in edit mode
                onChange={(e) => setSide(e.target.value)}
              >
                {sideOptions.map((option) => (
                  <MenuItem key={option.key} value={option.key}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* RESPONSIVE: Scale-Invariant Image Display */}
            {form.imageUrl && (
              <Box>
                <Typography variant="body2" color="black" sx={{ mb: 1 }}>
                  {/* CHANGED: Dynamic instruction text */}
                  {isEditMode 
                    ? "Edit markup points: Click to edit, use × to delete"
                    : "Click on the image to add markup points:"}
                </Typography>
                
                {/* Debug info for development */}
                {imageMetadata.isLoaded && (
                  <Box sx={{ mb: 2, p: 1, backgroundColor: "#f0f7ff", borderRadius: 1, fontSize: "10px" }}>
                    <Typography variant="caption" sx={{ display: "block" }}>
                      Image: {imageMetadata.naturalWidth}×{imageMetadata.naturalHeight} 
                      (AR: {imageMetadata.naturalAspectRatio.toFixed(3)})
                    </Typography>
                    <Typography variant="caption" sx={{ display: "block" }}>
                      Display: {displayState.imageDisplayWidth.toFixed(0)}×{displayState.imageDisplayHeight.toFixed(0)}
                    </Typography>
                  </Box>
                )}
                
                <Card
                  sx={{
                    width: "100%",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E3E3F1",
                    padding: "4px",
                    // RESPONSIVE: Ensure container doesn't interfere with positioning
                    overflow: "visible",
                  }}
                >
                  <Box
                    ref={containerRef}
                    sx={{
                      position: "relative",
                      width: "100%",
                      height: "auto",
                      display: "block",
                      cursor: isEditMode ? "default" : "crosshair", // CHANGED: Different cursor for edit mode
                      // RESPONSIVE: Ensure clean container for positioning
                      lineHeight: 0, // Remove any default line height
                    }}
                    onClick={isEditMode ? undefined : handleImageClick} // CHANGED: Disable click in edit mode
                  >
                    <Box
                      component="img"
                      src={form.imageUrl}
                      alt="Uploaded part"
                      ref={imageRef}
                      onLoad={handleImageLoad}
                      sx={{
                        width: "100%",
                        height: "auto",
                        objectFit: "contain", // CRITICAL: Maintain aspect ratio
                        display: "block",
                        userSelect: "none",
                        // RESPONSIVE: Ensure image doesn't create layout issues
                        verticalAlign: "top",
                      }}
                    />
                    
                    {/* SCALE-INVARIANT: Render markup points */}
                    {tempMarkupPoints.map((point, index) => (
                      <MarkupPoint 
                        key={point.id || index} 
                        point={point} 
                        index={index} 
                        size={24}
                        previewMode={false}
                      />
                    ))}
                  </Box>
                </Card>
                
                {/* Points Summary with Coordinates */}
                {tempMarkupPoints.length > 0 && (
                  <Box sx={{ mt: 2, p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
                    <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
                      Added Points ({tempMarkupPoints.length}):
                    </Typography>
                    {tempMarkupPoints.map((point, index) => (
                      <Typography key={index} variant="caption" sx={{ display: "block", fontFamily: "monospace" }}>
                        #{point.position}: {point.category} → ({point.x.toFixed(2)}%, {point.y.toFixed(2)}%)
                      </Typography>
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
        )}

        {/* EXISTING: Step 3 unchanged */}
        {step === 3 && (
          <DialogContent sx={{ pt: 3 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-center",
                gap: 2,
                borderRadius: "16px",
                padding: "8px",
                width: "100%",
                flexWrap: "wrap",
                backgroundColor: "#F9F9FF",
              }}
            >
              <Box
                sx={{
                  width: "40%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  border: "1px solid #DFDFED",
                  borderRadius: "8px",
                  backgroundColor: "#F8F8F8",
                  padding: "4px",
                }}
              >
                <Box
                  component="img"
                  src={form.imageUrl}
                  alt="Uploaded part"
                  sx={{
                    maxWidth: "100%",
                    height: "auto",
                    objectFit: "contain",
                    borderRadius: "8px",
                  }}
                />
              </Box>

              <Box display="flex" flexDirection="column" gap={1} flex={1}>
                <Typography>
                  Part: <strong>{form.part}</strong>
                </Typography>
                <Typography>
                  Model: <strong>{form.model}</strong>
                </Typography>
                <Typography>
                  Variant: <strong>{form.variant}</strong>
                </Typography>
                <Typography>
                  Side: <strong>{side}</strong>
                </Typography>
                <Typography>
                  Markup Points:{" "}
                  <strong>
                    {tempMarkupPoints.length > 0
                      ? tempMarkupPoints.map((point, index) => (
                          <span key={index}>
                            {point.position}
                            {index < tempMarkupPoints.length - 1 ? ", " : ""}
                          </span>
                        ))
                      : "No points added"}
                  </strong>
                </Typography>
                <Typography>
                  Category:{" "}
                  <strong>
                    {tempMarkupPoints.length > 0
                      ? tempMarkupPoints.map((point, index) => (
                          <span key={index}>
                            {point.category}
                            {index < tempMarkupPoints.length - 1 ? ", " : ""}
                          </span>
                        ))
                      : "No points added"}
                  </strong>
                </Typography>
              </Box>
            </Box>
          </DialogContent>
        )}

        <DialogActions sx={{ justifyContent: "flex-end", p: 3, pt: 2 }}>
          <SecondaryButton
            onClick={handleClose}
            sx={{
              fontSize: "14px !important",
              lineHeight: "16px",
              letterSpacing: "-2.5%",
            }}
          >
            {step === 1 ? ADD_MDL?.BTN_LBL1 : ADD_MDL?.BTN_LBL3}
          </SecondaryButton>
          <PrimaryButton
            sx={{
              backgroundColor: isDisabled ? "#E1E1E1" : "",
              color: isDisabled ? "#7F7F7F" : "",
              fontSize: "14px !important",
              lineHeight: "16px",
              letterSpacing: "-2.5%",
            }}
            disabled={
              step === 1
                ? isDisabled || progress < 100
                : step === 3
                ? false
                : isDisabled
            }
            onClick={hanldeOnNext}
          >
            {/* CHANGED: Dynamic button text */}
            {step == 3 ? (isEditMode ? "Update" : ADD_MDL?.BTN_LBL4) : ADD_MDL?.BTN_LBL2}
          </PrimaryButton>
        </DialogActions>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity="error"
            sx={{ width: "100%" }}
          >
            {ADD_MDL?.IMG_INFO_ERR}
          </Alert>
        </Snackbar>
      </Dialog>

      {/* ENHANCED: Point Details Modal with Coordinate Display */}
      <Dialog
        open={pointModal}
        onClose={() => {
          setPointModal(false);
          setEditingPointIndex(-1); // NEW: Reset editing index
          setPointData({ position: "", category: "" });
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {/* CHANGED: Dynamic title */}
          {editingPointIndex !== -1 ? "Edit Markup Point" : "Add Markup Point"}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box display="flex" flexDirection="column" gap={3}>
            <TextField
              label="Position"
              type="number"
              value={pointData.position}
              required
              inputProps={{ min: 1 }}
              helperText="Position must be a positive number"
              onChange={(e) =>
                setPointData((prev) => ({
                  ...prev,
                  position: e.target.value,
                }))
              }
              fullWidth
              variant="outlined"
            />
            <FormControl fullWidth variant="outlined">
              <InputLabel>Category</InputLabel>
              <Select
                value={pointData.category}
                onChange={(e) =>
                  setPointData((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                label="Category"
              >
                {categoryOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {/* ENHANCED: Coordinate and Image Information */}
            <Box sx={{ p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Point Information:
              </Typography>
              <Typography variant="caption" sx={{ display: "block" }}>
                Click Position: ({currentPoint.x.toFixed(2)}%, {currentPoint.y.toFixed(2)}%)
              </Typography>
              {imageMetadata.isLoaded && (
                <>
                  <Typography variant="caption" sx={{ display: "block" }}>
                    Image Size: {imageMetadata.naturalWidth}×{imageMetadata.naturalHeight}px
                  </Typography>
                  <Typography variant="caption" sx={{ display: "block" }}>
                    Display Size: {displayState.imageDisplayWidth.toFixed(0)}×{displayState.imageDisplayHeight.toFixed(0)}px
                  </Typography>
                  <Typography variant="caption" sx={{ display: "block", color: "success.main" }}>
                    ✓ Position will be maintained across all screen sizes
                  </Typography>
                </>
              )}
            </Box>
            
            {/* ENHANCED: Existing Points Check */}
            {tempMarkupPoints.length > 0 && (
              <Box sx={{ p: 2, backgroundColor: "#fff3e0", borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Existing Points:
                </Typography>
                {tempMarkupPoints.map((point, index) => (
                  <Typography key={index} variant="caption" sx={{ display: "block" }}>
                    #{point.position}: {point.category}
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setPointModal(false);
            setEditingPointIndex(-1); // NEW: Reset editing index
            setPointData({ position: "", category: "" });
          }}>
            Cancel
          </Button>
          <Button
            onClick={handlePointSubmit}
            variant="contained"
            disabled={!pointData.position || !pointData.category}
          >
            {/* CHANGED: Dynamic button text */}
            {editingPointIndex !== -1 ? "Update" : "Add Point"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* NEW: Edit Confirmation Dialog */}
      <Dialog
        open={confirmEditOpen}
        onClose={() => setConfirmEditOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          Confirm Edit
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to save these changes to the markup point?
          </Typography>
          <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2">
              <strong>Part:</strong> {form.part}
            </Typography>
            <Typography variant="body2">
              <strong>Side:</strong> {side}
            </Typography>
            <Typography variant="body2">
              <strong>Points:</strong> {tempMarkupPoints.length} markup points
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmEditOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleEditConfirm} color="primary" variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddPartModal;