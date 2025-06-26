import { useState, useEffect, useRef } from "react";
import PrimaryButton from "../../../components/Buttons/PrimaryButton/PrimaryButton";
import SecondaryButton from "../../../components/Buttons/SecondaryButton/SecondaryButton";
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
import Alert from "../../../components/Alert";

function bytesToSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  else return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

const partOptions = [
  { key: "Door", label: "Door" },
  { key: "partA", label: "Part A" },
  { key: "partB", label: "Part B" },
];

const modelOptions = [
  { key: "YGB", label: "YGB" },
  { key: "model1", label: "Model 1" },
  { key: "model2", label: "Model 2" },
];

const variantOptions = [
  { key: "LxI", label: "LxI" },
  { key: "VxI", label: "VxI" },
  { key: "ZxI", label: "ZxI" },
  { key: "variant1", label: "Variant 1" },
  { key: "variant2", label: "Variant 2" },
];

const sideOptions = [
  { key: "Right Hand", label: "Right Hand" },
  { key: "Left Hand", label: "Left Hand" },
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPointIndex, setEditingPointIndex] = useState(-1);
  const [confirmEditOpen, setConfirmEditOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedPointIndex, setDraggedPointIndex] = useState(-1);

  // Image tracking for responsive behavior
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const [imageMetadata, setImageMetadata] = useState({
    naturalWidth: 0,
    naturalHeight: 0,
    naturalAspectRatio: 1,
    isLoaded: false
  });

  // Initialize edit mode when editData is provided
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
    if (step === 1 && !isEditMode) {
      resetForm();
      onClose(resetForm);
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
      side: side,
      imageUrl: form.imageUrl,
      markupPoints: tempMarkupPoints.map((point) => ({
        x: point.x,
        y: point.y,
        position: point.position,
        category: point.category,
      })),
    };
    return data;
  }

  const handleNext = () => {
    if (step === 3) {
      if (isEditMode) {
        setConfirmEditOpen(true);
      } else {
        const data = mapDataRecord();
        onNext(data);
        resetForm();
      }
    } else {
      setStep((prev) => prev + 1);
    }
  };

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
    if (isEditMode) return; // Prevent image changes in edit mode
    
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

  const handleImageLoad = () => {
    if (!imageRef.current) return;
    
    const img = imageRef.current;
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    const naturalAspectRatio = naturalWidth / naturalHeight;
    
    setImageMetadata({
      naturalWidth,
      naturalHeight,
      naturalAspectRatio,
      isLoaded: true
    });
  };

  const handleImageClick = (event) => {
    if (!form.imageUrl || !imageRef.current || isDragging) return;
    
    event.preventDefault();
    event.stopPropagation();

    const img = imageRef.current;
    const imgRect = img.getBoundingClientRect();
    
    const clickX = event.clientX - imgRect.left;
    const clickY = event.clientY - imgRect.top;
    
    const xPercent = (clickX / imgRect.width) * 100;
    const yPercent = (clickY / imgRect.height) * 100;
    
    const clampedX = Math.max(0, Math.min(100, xPercent));
    const clampedY = Math.max(0, Math.min(100, yPercent));

    setCurrentPoint({ x: clampedX, y: clampedY });
    setPointModal(true);
    setPointData({ position: "", category: "" });
  };

  const handlePointSubmit = () => {
    if (pointData.position && pointData.category) {
      if (editingPointIndex !== -1) {
        // Update existing point
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
          id: Date.now(),
        };
        setTempMarkupPoints((prev) => [...prev, newPoint]);
      }
      setPointModal(false);
      setPointData({ position: "", category: "" });
    }
  };

  const handlePointUpdate = () => {
    if (pointData.position && pointData.category && editingPointIndex !== -1) {
      const updatedPoints = [...tempMarkupPoints];
      updatedPoints[editingPointIndex] = {
        ...updatedPoints[editingPointIndex],
        position: parseInt(pointData.position),
        category: pointData.category,
      };
      setTempMarkupPoints(updatedPoints);
      setPointModal(false);
      setPointData({ position: "", category: "" });
      setEditingPointIndex(-1);
    }
  };

  const handlePointClick = (index, point) => {
    if (!isEditMode) return;
    
    setEditingPointIndex(index);
    setPointData({
      position: point.position.toString(),
      category: point.category
    });
    setPointModal(true);
  };

  const handlePointDelete = (index) => {
    const updatedPoints = tempMarkupPoints.filter((_, i) => i !== index);
    setTempMarkupPoints(updatedPoints);
  };

  // Mouse drag handlers
  const handleMouseDown = (e, index) => {
    if (!isEditMode) return;
    
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDraggedPointIndex(index);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || draggedPointIndex === -1 || !imageRef.current) return;

    const img = imageRef.current;
    const imgRect = img.getBoundingClientRect();
    
    const moveX = e.clientX - imgRect.left;
    const moveY = e.clientY - imgRect.top;
    
    const xPercent = Math.max(0, Math.min(100, (moveX / imgRect.width) * 100));
    const yPercent = Math.max(0, Math.min(100, (moveY / imgRect.height) * 100));

    const updatedPoints = [...tempMarkupPoints];
    updatedPoints[draggedPointIndex] = {
      ...updatedPoints[draggedPointIndex],
      x: xPercent,
      y: yPercent,
    };
    setTempMarkupPoints(updatedPoints);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedPointIndex(-1);
  };

  // Add mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, draggedPointIndex]);

  useEffect(() => {
    if (step === 1) {
      const hasEmpty = Object.values(form).some((value) => !value);
      setIsDisabled(hasEmpty);
    }
  }, [form, step]);

  useEffect(() => {
    if (step === 2) {
      if (tempMarkupPoints.length > 0 && side) {
        setIsDisabled(false);
      } else {
        setIsDisabled(true);
      }
    }
  }, [tempMarkupPoints, side, step]);

  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="xs" 
        fullWidth
        sx={{ zIndex: isEditMode ? 1400 : 1300 }}
      >
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

        {step === 1 && !isEditMode && (
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
                disabled={isEditMode}
                onChange={(e) => setSide(e.target.value)}
              >
                {sideOptions.map((option) => (
                  <MenuItem key={option.key} value={option.key}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {form.imageUrl && (
              <Box>
                <Typography variant="body2" color="black" sx={{ mb: 1 }}>
                  {isEditMode 
                    ? "Edit markup points: Click to edit, drag to move, or use X to delete"
                    : "Click on the image to add markup points:"}
                </Typography>
                
                <Card
                  sx={{
                    width: "100%",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E3E3F1",
                    padding: "4px",
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
                      cursor: isEditMode ? "default" : "crosshair",
                      lineHeight: 0,
                    }}
                    onClick={isEditMode ? undefined : handleImageClick}
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
                        objectFit: "contain",
                        display: "block",
                        userSelect: "none",
                        verticalAlign: "top",
                      }}
                    />
                    
                    {/* Render markup points */}
                    {tempMarkupPoints.map((point, index) => (
                      <Box
                        key={point.id || index}
                        sx={{
                          position: "absolute",
                          left: `calc(${point.x}% - 12px)`,
                          top: `calc(${point.y}% - 12px)`,
                          width: 24,
                          height: 24,
                          backgroundColor: "white",
                          border: "2px solid black",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          fontWeight: 500,
                          color: "black",
                          zIndex: 10,
                          cursor: isEditMode ? "move" : "default",
                          "&:hover": isEditMode ? {
                            backgroundColor: "#f0f0f0",
                            transform: "scale(1.1)",
                          } : {},
                        }}
                        onMouseDown={(e) => handleMouseDown(e, index)}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isEditMode) {
                            handlePointClick(index, point);
                          }
                        }}
                      >
                        {point.position}
                        {isEditMode && (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePointDelete(index);
                            }}
                            sx={{
                              position: "absolute",
                              top: -8,
                              right: -8,
                              width: 16,
                              height: 16,
                              backgroundColor: "red",
                              color: "white",
                              "&:hover": { backgroundColor: "darkred" },
                            }}
                          >
                            <CloseIcon sx={{ fontSize: 10 }} />
                          </IconButton>
                        )}
                      </Box>
                    ))}
                  </Box>
                </Card>
              </Box>
            )}
          </DialogContent>
        )}

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
            name={step === 1 && !isEditMode ? ADD_MDL?.BTN_LBL1 : ADD_MDL?.BTN_LBL3}
          >
            {step === 1 && !isEditMode ? ADD_MDL?.BTN_LBL1 : "Back"}
          </SecondaryButton>
          <PrimaryButton
            sx={{
              backgroundColor: isDisabled ? "#E1E1E1" : "",
              color: isDisabled ? "#7F7F7F" : "",
            }}
            disabled={
              step === 1 && !isEditMode ? isDisabled || progress < 100 :
              step === 3 ? false : 
              isDisabled
            }
            onClick={handleNext}
          >
            {step === 3 ? (isEditMode ? "Update" : ADD_MDL?.BTN_LBL4) : "Next"}
          </PrimaryButton>
        </DialogActions>
      </Dialog>

      {/* Point Modal */}
      <Dialog
        open={pointModal}
        onClose={() => {
          setPointModal(false);
          setEditingPointIndex(-1);
          setPointData({ position: "", category: "" });
        }}
        maxWidth="sm"
        fullWidth
        sx={{ zIndex: isEditMode ? 1500 : 1400 }}
      >
        <DialogTitle>
          {editingPointIndex !== -1 ? "Edit Markup Point" : "Add Markup Point"}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box display="flex" flexDirection="column" gap={3}>
            <TextField
              label="Position"
              type="number"
              value={pointData.position}
              required
              inputProps={{ min: 0 }}
              helperText="Position must be a non-negative number"
              onChange={(e) =>
                setPointData((prev) => ({ ...prev, position: e.target.value }))
              }
              fullWidth
              variant="outlined"
            />
            <FormControl fullWidth variant="outlined">
              <InputLabel>Category</InputLabel>
              <Select
                value={pointData.category}
                onChange={(e) =>
                  setPointData((prev) => ({ ...prev, category: e.target.value }))
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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setPointModal(false);
              setEditingPointIndex(-1);
              setPointData({ position: "", category: "" });
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={editingPointIndex !== -1 ? handlePointUpdate : handlePointSubmit}
            variant="contained"
            disabled={!pointData.position || !pointData.category}
          >
            {editingPointIndex !== -1 ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Confirmation Dialog */}
      <Dialog
        open={confirmEditOpen}
        onClose={() => setConfirmEditOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={{ zIndex: 1600 }}
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

      {/* Alert for file size error */}
      <Alert
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        title="Warning"
        message={ADD_MDL?.IMG_INFO_ERR}
        severity="warning"
      />
    </>
  );
};

export default AddPartModal;