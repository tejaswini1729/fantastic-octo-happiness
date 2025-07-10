import { useState, useEffect, useRef } from "react";
import PrimaryButton from "../../../components/Buttons/PrimaryButton/PrimaryButton";
import SecondaryButton from "../../../components/Buttons/SecondaryButton/SecondaryButton";
import Alert from "../../../components/Alert";
import info_sb from "../../../assets/icons/info_sb.svg";
import directions from "../../../assets/images/directions.svg";
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


const categoryOptions = [
  { key: "cmm", label: "CMM" },
  { key: "ldGap", label: "LD Gap" },
  { key: "supplierPart", label: "Supplier Part" },
  { key: "all", label: "All" },
];

const positionOptions = {
  cmm: [
    { key: "21", label: "21" },
    { key: "22", label: "22" },
    { key: "23", label: "23" },
  ],
  ldGap: [
    { key: "31", label: "31" },
    { key: "32", label: "32" },
    { key: "33", label: "33" },
  ],
  supplierPart: [
    { key: "41", label: "41" },
    { key: "42", label: "42" },
    { key: "43", label: "43" },
  ],
  all: [
    { key: "54", label: "54" },
    { key: "55", label: "55" },
    { key: "56", label: "56" },
    { key: "57", label: "57" },
    { key: "58", label: "58" },
  ],
};



const AddPartModal = ({
  open,
  onClose,
  onNext,
  editMode = false,
  editData = null,
}) => {
  const initialFormData = {
    part: "",
    model: "",
    variant: "",
    side: "",
    image: null,
    imageUrl: null,
  };

  const initial_tm_Data = [];

  const [form, setForm] = useState(initialFormData);
  const [tempMarkupPoints, setTempMarkupPoints] = useState(initial_tm_Data);
  const [currentPoint, setCurrentPoint] = useState({ x: 0, y: 0 });
  const [pointModal, setPointModal] = useState(false);
  const [pointData, setPointData] = useState({ position: "", category: "" });
  const [isDisabled, setIsDisabled] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(1);
  const imageRef = useRef(null);
  const [hasVisitedStep2, setHasVisitedStep2] = useState(false);
  const [editingPointIndex, setEditingPointIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPointIndex, setDragPointIndex] = useState(null);
  const [selectedPointIndex, setSelectedPointIndex] = useState(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });

  const resetData = () => {
    setForm(initialFormData);
    setTempMarkupPoints(initial_tm_Data);
    // setSide(initialSideData);
    setStep(1);
    setHasVisitedStep2(false);
    setEditingPointIndex(null);
  };

  // Initialize edit mode data
  useEffect(() => {
    if (editMode && editData && open) {
      setForm({
        part: editData.partData.part,
        model: editData.partData.model,
        variant: editData.partData.variant,
        side: editData.partData.side,
        image: { name: "existing-image" }, // Mock file object
        imageUrl: editData.partData.imageUrl,
      });
      // setSide(editData.partData.side);
      setTempMarkupPoints([editData.markupPoint]);
      setStep(2); // Start from step 2 in edit mode
      setHasVisitedStep2(true);
      setProgress(100);

      // Pre-fill the point data for editing
      setPointData({
        position: editData.markupPoint.position.toString(),
        category: editData.markupPoint.category,
      });
    } else if (!editMode) {
      resetData();
    }
  }, [editMode, editData, open]);

  // Handle point drag for Add Part mode only
  const handlePointMouseDown = (event, pointIndex) => {
    if (editMode) return; // Only allow dragging in Add Part mode, not Edit mode
    
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
    setDragPointIndex(pointIndex);
  };

  const handleMouseMove = (event) => {
    if (editMode || !isDragging || dragPointIndex === null || !imageRef.current) return;

    event.preventDefault();
    const img = imageRef.current;
    const rect = img.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    const clampedX = Math.max(0, Math.min(100, xPercent));
    const clampedY = Math.max(0, Math.min(100, yPercent));

    // Update the point position while dragging
    setTempMarkupPoints((prev) =>
      prev.map((point, index) =>
        index === dragPointIndex
          ? { ...point, x: clampedX, y: clampedY }
          : point
      )
    );
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragPointIndex(null);
  };

  // Handle point click for editing in Add Part mode
  const handlePointClick = (event, pointIndex) => {
    if (editMode || isDragging) return; // Only allow in Add Part mode

    event.stopPropagation();
    
    // If clicking on already selected point, open edit modal
    if (selectedPointIndex === pointIndex) {
      const point = tempMarkupPoints[pointIndex];
      setPointData({
        position: point.position.toString(),
        category: point.category,
      });
      setCurrentPoint({ x: point.x, y: point.y });
      setEditingPointIndex(pointIndex);
      setPointModal(true);
      setSelectedPointIndex(null);
    } else {
      // Select the point to show X icon
      setSelectedPointIndex(pointIndex);
    }
  };

  // Handle X icon click to delete point
  const handleDeletePoint = (pointIndex) => {
    if (editMode) return; // Only allow deletion in Add Part mode
    
    setTempMarkupPoints((prev) => prev.filter((_, index) => index !== pointIndex));
    setSelectedPointIndex(null);
    setPointModal(false);
    setEditingPointIndex(null);
  };

  const [imageDisplay, setImageDisplay] = useState({
    width: 0,
    height: 0,
    naturalWidth: 0,
    naturalHeight: 0,
    offsetX: 0,
    offsetY: 0,
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleDelete = () => {
    handleChange("image", null);
    handleChange("imageUrl", null);
    setProgress(0);
    setTempMarkupPoints([]);
  };

  function mapDataRecord() {
    const data = {
      part: form.part,
      model: form.model,
      variant: form.variant,
      side: form.side,
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

  const hanldeOnNext = (e) => {
    if (editMode && step === 2) {
      // In edit mode, go from step 2 to step 3 for review
      setStep(3);
      setIsDisabled(false);
      return;
    }

    if (editMode && step === 3) {
      // In edit mode, submit from step 3
      const data = mapDataRecord();
      resetData();
      onNext(data);
      return;
    }

    const nextStep = step + 1;
    setIsDisabled(true);
    setStep(nextStep);

    if (nextStep === 2) {
      setHasVisitedStep2(true);
    }

    if (nextStep === 4) {
      const data = mapDataRecord();
      setStep(1);
      resetData();
      onNext(data);
    }

    if ((nextStep === 2 || nextStep === 3) && hasVisitedStep2) {
      setIsDisabled(false);
    }
  };

  const handleClose = (e) => {
    if (e.target.name === ADD_MDL?.BTN_LBL1) {
      setIsDisabled(true);
      onClose(resetData);
    } else {
      setIsDisabled(false);
      if (editMode && step === 3) {
        // In edit mode, go back from step 3 to step 2
        setStep(2);
      } else {
        setStep((prevStep) => prevStep - 1);
      }
    }
  };

  const handleImageSelect = (e) => {
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

  const handleImageClick = (event) => {
    if (!form.imageUrl || !imageRef.current) return;

    event.preventDefault();
    event.stopPropagation();

    // Clear any selected point when clicking on empty area
    setSelectedPointIndex(null);

    // Don't add new points in edit mode
    if (editMode) return;

    const img = imageRef.current;
    const rect = img.getBoundingClientRect();
    
    // Simple percentage calculation relative to the image container
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    const clampedX = Math.max(0, Math.min(100, xPercent));
    const clampedY = Math.max(0, Math.min(100, yPercent));

    console.log("Click position:", { x, y, xPercent, yPercent, clampedX, clampedY });

    // Set modal position near the click point
    setModalPosition({
      x: event.clientX,
      y: event.clientY
    });

    setCurrentPoint({ x: clampedX, y: clampedY });
    setPointModal(true);
    setPointData({ position: "", category: "" });
    setEditingPointIndex(null);
  };

  const handlePointSubmit = () => {
    if (pointData.position && pointData.category) {
      const newPoint = {
        x: currentPoint.x,
        y: currentPoint.y,
        position: parseInt(pointData.position),
        category: pointData.category,
      };

      console.log("Adding point:", newPoint);

      if (editingPointIndex !== null) {
        // Update existing point
        setTempMarkupPoints((prev) =>
          prev.map((point, index) =>
            index === editingPointIndex ? newPoint : point
          )
        );
      } else {
        // Add new point
        setTempMarkupPoints((prev) => [...prev, newPoint]);
      }

      setPointModal(false);
      setPointData({ position: "", category: "" });
      setEditingPointIndex(null);
    }
  };

  useEffect(() => {
    console.log("Checking step", step);
  }, [step]);

  useEffect(() => {
    if (editMode) {
      // In edit mode, only check if we have points and side
      if (tempMarkupPoints.length > 0) {
        setIsDisabled(false);
      } else {
        setIsDisabled(true);
      }
      return;
    }

    const hasEmpty = Object.values(form).some((value) => !value);
    setIsDisabled(hasEmpty);
  }, [form, editMode, tempMarkupPoints]);

  useEffect(() => {
    if (step === 2) {
      if (tempMarkupPoints.length > 0) {
        setIsDisabled(false);
      } else {
        setIsDisabled(true);
      }
    }
  }, [tempMarkupPoints]);

  useEffect(() => {
    const handleResize = () => {
      if (imageRef.current) {
        const rect = imageRef.current.getBoundingClientRect();
        setImageDisplay((prev) => ({
          ...prev,
          width: rect.width,
          height: rect.height,
          offsetX: rect.left,
          offsetY: rect.top,
        }));
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
            {editMode
              ? "Edit Markup Point"
              : step === 1
              ? ADD_MDL?.TTL1
              : step === 2
              ? ADD_MDL?.TTL2
              : ADD_MDL?.TTL3}
          </Typography>
          <IconButton
            onClick={handleChange}
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
            name={ADD_MDL?.BTN_LBL1}
          >
            <CloseIcon sx={{ width: 20, height: 20, color: "#131313" }} />
          </IconButton>
        </DialogTitle>
        <Box sx={{ px: 3 }}>
          <Divider />
        </Box>

        {/* Only show step 1 if not in edit mode */}
        {!editMode && step == 1 && (
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

            {/* Model Dropdown */}
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

            {/* Variant Dropdown */}
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
            {/* Side Dropdown */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="side-label">Side</InputLabel>
              <Select
                labelId="side-label"
                value={form.side}
                label="Side"
                onChange={(e) => handleChange("side", e.target.value)}
                disabled={editMode} // Disable side editing in edit mode
              >
                {sideOptions.map((option) => (
                  <MenuItem key={option.key} value={option.key}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Image Drop Zone */}
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
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-center",
                    alignItems: "flex-center",
                  }}
                >
                  <IconButton>
                    <img
                      src={fileIcon}
                      alt="File Icon"
                      style={{ width: 36, height: 36 }}
                    />
                  </IconButton>
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 400,
                      fontSize: "12px",
                      lineHeight: "150%",
                      letterSpacing: "0%",
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
                      letterSpacing: "0%",
                    }}
                  >
                    {typeof form.image.size === "number"
                      ? bytesToSize(form.image.size)
                      : "Unknown size"}
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
                        letterSpacing: "0%",
                        textAlign: "right",
                      }}
                    >
                      {progress}%
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-center",
                    alignItems: "flex-center",
                  }}
                >
                  <IconButton onClick={handleDelete}>
                    <DeleteIcon
                      sx={{ width: 20, height: 20, color: "#363939" }}
                    />
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
                onClick={() =>
                  document.getElementById("add-part-image-input").click()
                }
              >
                <img
                  src={addPhoto}
                  alt="Add"
                  style={{ width: 24, height: 24 }}
                />
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "2px",
                  }}
                >
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
                  <Typography
                    sx={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: "8px",
                        color: "#1681EC",
                      }}
                    >
                      {ADD_MDL?.BROWSE_FILE_1}
                    </span>
                    <span
                      style={{
                        fontWeight: 400,
                        fontSize: "8px",
                        color: "#57595A",
                      }}
                    >
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
          <DialogContent sx={{ pt: "10px" }}>
            {/* Image Display with Markup Points */}
            {form.imageUrl && (
              <Box>
                <Box
                  display="flex"
                  gap="8px"
                  sx={{
                    border: "1px solid #298BED",
                    borderRadius: "4px",
                    backgroundColor: "#F3F9FF",
                    padding: "10px",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                    }}
                  >
                    <Box
                      component="img"
                      src={info_sb}
                      alt="Description"
                      sx={{
                        width: "auto",
                        height: "auto",
                      }}
                    />
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      color="black"
                      sx={{
                        mb: 1,
                        fontFamily: "Plus Jakarta Sans",
                        lineHeight: "120%",
                        letterSpacing: "0px",
                        verticalAlign: "middle",
                        fontSize: "14px",
                      }}
                    >
                      {editMode ? (
                        "This is the markup point for the part. You can view the details below."
                      ) : (
                        <>
                          <span
                            style={{
                              fontWeight: 600,
                            }}
                          >
                            Note:
                          </span>
                          <span> </span>
                          <span
                            style={{
                              fontWeight: 400,
                            }}
                          >
                            Tap the uploaded part image to place points. Once placed, you can drag points to move them, click to select them, or click again to edit.
                          </span>
                        </>
                      )}
                    </Typography>
                  </Box>
                </Box>
                <Card
                  sx={{
                    width: "100%",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E3E3F1",
                    padding: "4px",
                    mt: "10px",
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      height: "auto",
                      display: "inline-block",
                    }}
                    onClick={handleImageClick}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    <Box
                      component="img"
                      src={form.imageUrl}
                      alt="Uploaded part"
                      ref={imageRef}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        cursor: editMode
                          ? "default"
                          : isDragging
                          ? "grabbing"
                          : "crosshair",
                        display: "block",
                        borderRadius: "16px",
                        userSelect: "none",
                      }}
                      draggable={false}
                    />
                    {tempMarkupPoints.map((point, index) => (
                      <Box key={index} sx={{ position: "relative" }}>
                        {/* Main Point */}
                        <Box
                          onMouseDown={!editMode ? (e) => handlePointMouseDown(e, index) : undefined}
                          onClick={!editMode ? (e) => handlePointClick(e, index) : undefined}
                          sx={{
                            position: "absolute",
                            left: `${point.x}%`,
                            top: `${point.y}%`,
                            transform: "translate(-50%, -50%)",
                            width: 24,
                            height: 24,
                            backgroundColor: "white",
                            border: !editMode && dragPointIndex === index
                              ? "3px solid #3F57FF"
                              : selectedPointIndex === index
                              ? "2px solid #FF6B6B"
                              : "2px solid black",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: 500,
                            color: "black",
                            zIndex: 10,
                            cursor: editMode
                              ? "default"
                              : isDragging && dragPointIndex === index
                              ? "grabbing"
                              : "grab",
                            userSelect: "none",
                            transition: "all 0.2s ease",
                            "&:hover": !editMode ? {
                              backgroundColor: "#f0f0f0",
                              transform: dragPointIndex === index ? "translate(-50%, -50%)" : "translate(-50%, -50%) scale(1.1)",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                            } : {},
                          }}
                          title={!editMode ? "Drag to move, click to select, click again to edit" : ""}
                        >
                          {point.position}
                        </Box>
                        
                        {/* X Delete Icon - only show when point is selected */}
                        {!editMode && selectedPointIndex === index && (
                          <Box
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePoint(index);
                            }}
                            sx={{
                              position: "absolute",
                              left: `${point.x}%`,
                              top: `${point.y}%`,
                              transform: "translate(-50%, -150%)",
                              width: 16,
                              height: 16,
                              backgroundColor: "#FF6B6B",
                              border: "1px solid white",
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 10,
                              fontWeight: "bold",
                              color: "white",
                              cursor: "pointer",
                              zIndex: 15,
                              "&:hover": {
                                backgroundColor: "#FF5252",
                                transform: "translate(-50%, -150%) scale(1.1)",
                              },
                            }}
                            title="Delete point"
                          >
                            ×
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                </Card>

                {/* Show current values in edit mode */}
                {editMode && tempMarkupPoints.length > 0 && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      backgroundColor: "#f5f5f5",
                      borderRadius: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight="medium"
                      sx={{ mb: 1 }}
                    >
                      Current Values:
                    </Typography>
                    <Typography variant="body2">
                      Position: <strong>{tempMarkupPoints[0].position}</strong>
                    </Typography>
                    <Typography variant="body2">
                      Category: <strong>{tempMarkupPoints[0].category}</strong>
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontSize: 11, color: "text.secondary", mt: 1 }}
                    >
                      Click the point to edit these values
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
        )}

        {(step === 3 || (editMode && step === 3)) && (
          <DialogContent sx={{ pt: 3 }}>
            {console.log("I am caled123", form)}
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
              {/* Image Section */}
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

              {/* Text Section */}
              <Box
                display="flex"
                flexDirection="column"
                gap={1}
                flex={1}
                sx={{ wordBreak: "break-word", maxWidth: "85%" }}
              >
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
                  Side: <strong>{form.side}</strong>
                </Typography>
                <Typography>
                  Position Added :
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
                  Category:
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
            name={step === 1 ? ADD_MDL?.BTN_LBL1 : ADD_MDL?.BTN_LBL3}
          >
            {editMode
              ? step === 3
                ? "Back"
                : "Cancel"
              : step === 1
              ? ADD_MDL?.BTN_LBL1
              : ADD_MDL?.BTN_LBL3}
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
              editMode
                ? step === 3
                  ? false
                  : isDisabled
                : step === 1
                ? isDisabled || progress !== 100
                : step === 3
                ? false
                : isDisabled
            }
            onClick={hanldeOnNext}
          >
            {editMode
              ? step === 3
                ? "Submit"
                : "Next"
              : step == 3
              ? ADD_MDL?.BTN_LBL4
              : ADD_MDL?.BTN_LBL2}
          </PrimaryButton>
        </DialogActions>

        <Alert
          open={snackbarOpen}
          onClose={() => setSnackbarOpen(false)}
          title="Warning"
          message={ADD_MDL?.IMG_INFO_ERR}
          severity={"warning"}
          sx={{
            backgroundColor: "#FFAA00",
            color: "black",
            "& .MuiAlert-icon": {
              color: "black",
            },
          }}
        />
      </Dialog>

      <Dialog
        open={pointModal}
        onClose={() => setPointModal(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-container': {
            '& .MuiPaper-root': {
              position: 'fixed',
              left: `${modalPosition.x + 20}px`,
              top: `${modalPosition.y - 100}px`,
              margin: 0,
              maxWidth: '400px',
              width: 'auto',
            },
          },
        }}
      >
        <DialogTitle>
          {editingPointIndex !== null
            ? "Edit Markup Point"
            : "Add Markup Point"}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box display="flex" flexDirection="column" gap={3}>
            <Box
              component="img"
              src={directions}
              alt="Graph"
              sx={{
                display: "block",
                maxWidth: "100%", 
              }}
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
                  <MenuItem key={option.key} value={option.key}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Position</InputLabel>
              <Select
                value={pointData.position}
                onChange={(e) =>
                  setPointData((prev) => ({
                    ...prev,
                    position: e.target.value,
                  }))
                }
                label="Position"
                disabled={!pointData.category}
              >
                {(positionOptions[pointData.category] || []).map((option) => (
                  <MenuItem key={option.key} value={option.key}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPointModal(false)}>Cancel</Button>
          <Button
            onClick={handlePointSubmit}
            variant="contained"
            disabled={!pointData.position || !pointData.category}
          >
            {editingPointIndex !== null ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddPartModal;
