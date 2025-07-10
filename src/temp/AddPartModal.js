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
  existingPartsData = [], // Add this prop to receive all existing parts data
}) => {
  const initialFormData = {
    part: "",
    model: "",
    variant: "",
    side: "",
    image: null,
    imageUrl: null,
  };
  console.log("existing dats",existingPartsData)
  const initial_tm_Data = [];

  const [form, setForm] = useState(initialFormData);
  const [tempMarkupPoints, setTempMarkupPoints] = useState(initial_tm_Data);
  const [currentPoint, setCurrentPoint] = useState({ x: 0, y: 0 });
  const [pointModal, setPointModal] = useState(false);
  const [pointData, setPointData] = useState({ position: "", category: "" });
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [isDisabled, setIsDisabled] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("warning");
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(1);
  const imageRef = useRef(null);
  const [hasVisitedStep2, setHasVisitedStep2] = useState(false);
  const [editingPointIndex, setEditingPointIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPointIndex, setDragPointIndex] = useState(null);
  const [isManuallyUploaded, setIsManuallyUploaded] = useState(false);

  // Get existing image data for the current configuration
  const getExistingImageData = () => {
    console.log("getExistingImageData called with:", {
      part: form.part,
      model: form.model,
      variant: form.variant,
      side: form.side,
      existingPartsDataLength: existingPartsData?.length || 0
    });

    if (!form.part || !form.model || !form.variant || !form.side || !existingPartsData) {
      console.log("Missing required data for getExistingImageData");
      return null;
    }

    // Helper function to get label from key
    const getLabel = (options, key) => {
      const option = options.find(opt => opt.key === key);
      return option ? option.label : key;
    };

    // Convert current form keys to labels for comparison
    const currentPart = getLabel(partOptions, form.part);
    const currentModel = getLabel(modelOptions, form.model);
    const currentVariant = getLabel(variantOptions, form.variant);
    const currentSide = getLabel(sideOptions, form.side);

    console.log("Comparing with labels:", {
      currentPart, currentModel, currentVariant, currentSide
    });

    // Find a part with same configuration (part, model, variant, side)
    const matchingPart = existingPartsData.find(part => {
      const match = part.part === currentPart &&
                   part.model === currentModel &&
                   part.variant === currentVariant &&
                   part.side === currentSide;
      
      console.log("Checking part:", {
        existing: { part: part.part, model: part.model, variant: part.variant, side: part.side },
        current: { part: currentPart, model: currentModel, variant: currentVariant, side: currentSide },
        match: match
      });
      
      return match;
    });

    console.log("Found matching part:", matchingPart);

    if (matchingPart) {
      // Extract filename from image URL or create a generic name
      const filename = matchingPart.imageName || 
                     (matchingPart.imageUrl ? 
                      matchingPart.imageUrl.split('/').pop() || 'existing-image.jpg' : 
                      'existing-image.jpg');
      
      const result = {
        imageUrl: matchingPart.imageUrl,
        imageName: filename,
        imageSize: matchingPart.imageSize || null // If size is stored
      };
      
      console.log("Returning image data:", result);
      return result;
    }

    console.log("No matching part found");
    return null;
  };

  // Get existing points for the current image configuration (for Add mode)
  const getExistingPointsForImage = () => {
    if (editMode || !form.part || !form.model || !form.variant || !form.side) {
      return [];
    }

    // Helper function to get label from key
    const getLabel = (options, key) => {
      const option = options.find(opt => opt.key === key);
      return option ? option.label : key;
    };

    // Convert current form keys to labels for comparison
    const currentPart = getLabel(partOptions, form.part);
    const currentModel = getLabel(modelOptions, form.model);
    const currentVariant = getLabel(variantOptions, form.variant);
    const currentSide = getLabel(sideOptions, form.side);

    // Find parts with same configuration (part, model, variant, side)
    const matchingParts = existingPartsData.filter(part => 
      part.part === currentPart &&
      part.model === currentModel &&
      part.variant === currentVariant &&
      part.side === currentSide
    );

    // Extract all existing points from matching parts and mark them as read-only
    const existingPoints = matchingParts.flatMap(part => 
      part.markupPoints ? part.markupPoints.map(point => ({
        ...point,
        isReadOnly: true, // Mark as read-only
        isEditable: false
      })) : []
    );

    return existingPoints;
  };

  // Get used positions for the current image configuration
  const getUsedPositions = () => {
    if (editMode || !form.part || !form.model || !form.variant || !form.side) {
      return [];
    }

    // Helper function to get label from key
    const getLabel = (options, key) => {
      const option = options.find(opt => opt.key === key);
      return option ? option.label : key;
    };

    // Convert current form keys to labels for comparison
    const currentPart = getLabel(partOptions, form.part);
    const currentModel = getLabel(modelOptions, form.model);
    const currentVariant = getLabel(variantOptions, form.variant);
    const currentSide = getLabel(sideOptions, form.side);

    // Find parts with same configuration (part, model, variant, side)
    const matchingParts = existingPartsData.filter(part => 
      part.part === currentPart &&
      part.model === currentModel &&
      part.variant === currentVariant &&
      part.side === currentSide
    );

    // Extract all used positions from matching parts
    const usedPositions = matchingParts.flatMap(part => 
      part.markupPoints ? part.markupPoints.map(point => point.position.toString()) : []
    );

    // Also include positions from current temp markup points (but only the new ones, not read-only)
    const currentPositions = tempMarkupPoints
      .filter(point => !point.isReadOnly)
      .map(point => point.position.toString());

    return [...new Set([...usedPositions, ...currentPositions])];
  };

  // Filter available positions based on category and used positions
  const getAvailablePositions = (category) => {
    const allPositions = positionOptions[category] || [];
    const usedPositions = getUsedPositions();
    
    return allPositions.filter(position => !usedPositions.includes(position.key));
  };

  const resetData = () => {
    setForm(initialFormData);
    setTempMarkupPoints(initial_tm_Data);
    setStep(1);
    setHasVisitedStep2(false);
    setEditingPointIndex(null);
  };

  // Debug: Log when modal opens and existingPartsData changes
  useEffect(() => {
    if (open && !editMode) {
      console.log("Add New Part Modal opened:", {
        existingPartsData: existingPartsData,
        existingPartsDataLength: existingPartsData?.length || 0,
        existingPartsDataSample: existingPartsData?.[0] || null
      });
    }
  }, [open, editMode, existingPartsData]);

  // Auto-load image when configuration matches existing part
  useEffect(() => {
    if (!editMode && form.part && form.model && form.variant && form.side && !form.imageUrl) {
      console.log("Checking for existing image data...", {
        part: form.part,
        model: form.model,
        variant: form.variant,
        side: form.side,
        existingPartsData: existingPartsData.length,
        existingPartsDataSample: existingPartsData[0]
      });
      
      const existingImageData = getExistingImageData();
      console.log("Found existing image data:", existingImageData);
      
      if (existingImageData) {
        console.log("Auto-loading image...", existingImageData);
        // Auto-load the existing image with proper file data
        handleChange("image", { 
          name: existingImageData.imageName,
          size: existingImageData.imageSize,
          isAutoLoaded: true
        });
        handleChange("imageUrl", existingImageData.imageUrl);
        setProgress(100);
        
        // Load existing points after image is set
        setTimeout(() => {
          const existingPoints = getExistingPointsForImage();
          console.log("Loading existing points:", existingPoints);
          setTempMarkupPoints(existingPoints);
        }, 100);
      } else {
        console.log("No existing image data found");
      }
    }
  }, [form.part, form.model, form.variant, form.side, isManuallyUploaded]);

  // Update temp markup points when form changes (to include existing points for the image)
  useEffect(() => {
    if (!editMode && form.part && form.model && form.variant && form.side && form.imageUrl && existingPartsData && !isManuallyUploaded) {
      const existingPoints = getExistingPointsForImage();
      // Keep only the new points (non-read-only) and merge with existing points
      const newPoints = tempMarkupPoints.filter(point => !point.isReadOnly);
      setTempMarkupPoints([...existingPoints, ...newPoints]);
    }
  }, [form.imageUrl, isManuallyUploaded]); // Only trigger when imageUrl changes and not manually uploaded

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
      
      // Set all markup points for the image, with the selected one marked as editable
      const allMarkupPoints = editData.partData.markupPoints || [];
      const editablePoint = editData.markupPoint;
      
      // Mark the editable point and set all points
      setTempMarkupPoints(allMarkupPoints.map(point => ({
        ...point,
        isEditable: point.position === editablePoint.position && point.category === editablePoint.category
      })));
      
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

  // Handle point drag for Add Part mode and editable points in Edit mode
  const handlePointMouseDown = (event, pointIndex) => {
    const point = tempMarkupPoints[pointIndex];
    
    // Don't allow dragging read-only points
    if (point.isReadOnly) return;
    
    // In edit mode, only allow dragging the editable point
    if (editMode && !point.isEditable) return;
    // In add mode, allow dragging any non-read-only point
    if (!editMode || (editMode && point.isEditable)) {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(true);
      setDragPointIndex(pointIndex);
    }
  };

  const handleMouseMove = (event) => {
    if (!isDragging || dragPointIndex === null || !imageRef.current) return;
    
    const point = tempMarkupPoints[dragPointIndex];
    // Don't allow moving read-only points
    if (point?.isReadOnly) return;
    // In edit mode, only allow moving the editable point
    if (editMode && !point?.isEditable) return;

    event.preventDefault();
    const img = imageRef.current;
    const rect = img.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    const clampedX = Math.max(0, Math.min(100, xPercent));
    const clampedY = Math.max(0, Math.min(100, yPercent));

    // Update the point position while dragging, preserving isEditable property
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

  // Handle point click for editing
  const handlePointClick = (event, pointIndex) => {
    const point = tempMarkupPoints[pointIndex];
    
    // Don't allow clicking read-only points
    if (point.isReadOnly) return;
    
    // In edit mode, only allow clicking the editable point
    if (editMode && !point.isEditable) return;
    // In add mode, allow clicking any non-read-only point if not dragging
    if (!editMode && isDragging) return;

    event.stopPropagation();
    
    // Set the point data including the current position and category
    setPointData({
      position: point.position.toString(),
      category: point.category,
    });
    setCurrentPoint({ x: point.x, y: point.y });
    
    // Calculate modal position relative to the point click
    const modalX = event.clientX + 20; // 20px offset to the right
    const modalY = event.clientY - 100; // 100px offset upwards
    
    // Ensure modal doesn't go off-screen
    const adjustedX = Math.min(modalX, window.innerWidth - 300); // assuming modal width ~280px
    const adjustedY = Math.max(modalY, 50); // minimum 50px from top
    
    setModalPosition({ x: adjustedX, y: adjustedY });
    setEditingPointIndex(pointIndex);
    setPointModal(true);
  };

  // Handle point deletion in Add Part mode
  const handleDeletePoint = (pointIndex) => {
    if (editMode) return; // Only allow deletion in Add Part mode
    
    const point = tempMarkupPoints[pointIndex];
    if (point.isReadOnly) return; // Don't allow deletion of read-only points
    
    setTempMarkupPoints((prev) => prev.filter((_, index) => index !== pointIndex));
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
    
    // Reset manual upload flag when form configuration changes (but not when setting image/imageUrl)
    if (!editMode && (key === 'part' || key === 'model' || key === 'variant' || key === 'side')) {
      setIsManuallyUploaded(false);
    }
  };

  const handleDelete = () => {
    // Check if there are existing markup points (read-only points)
    const hasExistingPoints = tempMarkupPoints.some(point => point.isReadOnly);
    
    if (hasExistingPoints && form.image?.isAutoLoaded) {
      // Don't allow deletion if there are existing points and image is auto-loaded
      return;
    }
    
    handleChange("image", null);
    handleChange("imageUrl", null);
    setProgress(0);
    setTempMarkupPoints([]); // Clear all points when image is deleted
  };

  function mapDataRecord() {
    // Helper to get label from key or label
    const getLabel = (options, value) => {
      const found = options.find(opt => opt.key === value || opt.label === value);
      return found ? found.label : value;
    };

    const getCategoryLabel = (value) => {
      const found = categoryOptions.find(opt => opt.key === value || opt.label === value);
      return found ? found.label : value;
    };

    const data = {
      part: getLabel(partOptions, form.part),
      model: getLabel(modelOptions, form.model),
      variant: getLabel(variantOptions, form.variant),
      side: getLabel(sideOptions, form.side),
      imageUrl: form.imageUrl,
      markupPoints: tempMarkupPoints
        .filter(point => !point.isReadOnly)
        .map((point) => ({
          x: point.x,
          y: point.y,
          position: point.position,
          category: getCategoryLabel(point.category),
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

    const img = imageRef.current;
    const rect = img.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    const clampedX = Math.max(0, Math.min(100, xPercent));
    const clampedY = Math.max(0, Math.min(100, yPercent));

    setCurrentPoint({ x: clampedX, y: clampedY });
    
    // Calculate modal position relative to the click point
    const modalX = event.clientX + 20; // 20px offset to the right
    const modalY = event.clientY - 100; // 100px offset upwards
    
    // Ensure modal doesn't go off-screen
    const adjustedX = Math.min(modalX, window.innerWidth - 300); // assuming modal width ~280px
    const adjustedY = Math.max(modalY, 50); // minimum 50px from top
    
    setModalPosition({ x: adjustedX, y: adjustedY });
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

      if (editingPointIndex !== null) {
        // Update existing point, preserving isEditable property in edit mode
        setTempMarkupPoints((prev) =>
          prev.map((point, index) =>
            index === editingPointIndex 
              ? { ...newPoint, isEditable: editMode ? point.isEditable : undefined }
              : point
          )
        );
      } else {
        // Add new point (only in add mode)
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
                    {form.image.isAutoLoaded?"":form.image.name}
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
                      : form.image.isAutoLoaded 
                        ? "Auto-loaded from existing configuration"
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
                  <IconButton 
                    onClick={handleDelete}
                    disabled={form.image?.isAutoLoaded && tempMarkupPoints.some(point => point.isReadOnly)}
                    sx={{
                      opacity: (form.image?.isAutoLoaded && tempMarkupPoints.some(point => point.isReadOnly)) ? 0.5 : 1,
                      cursor: (form.image?.isAutoLoaded && tempMarkupPoints.some(point => point.isReadOnly)) ? 'not-allowed' : 'pointer'
                    }}
                    title={
                      (form.image?.isAutoLoaded && tempMarkupPoints.some(point => point.isReadOnly)) 
                        ? "Cannot delete image with existing markup points"
                        : "Delete image"
                    }
                  >
                    <DeleteIcon
                      sx={{ 
                        width: 20, 
                        height: 20, 
                        color: (form.image?.isAutoLoaded && tempMarkupPoints.some(point => point.isReadOnly)) ? "#999" : "#363939"
                      }}
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
                            Tap the uploaded part image to place points. Once placed, you can drag points to move them or click to edit.
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
                    onClick={!editMode ? handleImageClick : undefined}
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
                    {tempMarkupPoints.map((point, index) => {
                      const isEditable = !editMode || point.isEditable;
                      const isReadOnly = point.isReadOnly;
                      const isCurrentlyDragging = !editMode && dragPointIndex === index;
                      
                      return (
                        <Box
                          key={index}
                          onMouseDown={isEditable && !isReadOnly ? (e) => handlePointMouseDown(e, index) : undefined}
                          onClick={isEditable && !isReadOnly ? (e) => handlePointClick(e, index) : undefined}
                          sx={{
                            position: "absolute",
                            left: `calc(${point.x}% - 12px)`,
                            top: `calc(${point.y}% - 12px)`,
                            width: 24,
                            height: 24,
                            backgroundColor: "white",
                            border: isReadOnly
                              ? "2px solid #666666" // Gray for read-only existing points
                              : isEditable && isCurrentlyDragging
                              ? "3px solid #3F57FF"
                              : isEditable
                              ? "2px solid #3F57FF" // Blue for editable points
                              : "2px solid #000000", // Black for other read-only points
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: 500,
                            color: "black",
                            zIndex: 10,
                            cursor: isReadOnly || !isEditable
                              ? "default"
                              : isDragging && dragPointIndex === index
                              ? "grabbing"
                              : "grab",
                            userSelect: "none",
                            transition: "all 0.2s ease",
                            opacity: isReadOnly ? 0.6 : (isEditable ? 1 : 0.7), // More transparent for read-only
                            "&:hover": isEditable && !isReadOnly ? {
                              backgroundColor: "#f0f0f0",
                              transform: dragPointIndex === index ? "none" : "scale(1.1)",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                            } : {},
                          }}
                          title={
                            isReadOnly
                              ? "Existing point (read-only)"
                              : !isEditable
                              ? "Read-only point"
                              : !editMode
                              ? "Drag to move, click to edit"
                              : "Drag to move, click to edit (editable point)"
                          }
                        >
                          {point.position}
                          {!editMode && !isReadOnly && (
                            <Box
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePoint(index);
                              }}
                              sx={{
                                position: "absolute",
                                top: -8,
                                right: -8,
                                width: 16,
                                height: 16,
                                backgroundColor: "#ff4444",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                fontSize: 10,
                                color: "white",
                                fontWeight: "bold",
                                zIndex: 11,
                                "&:hover": {
                                  backgroundColor: "#ff0000",
                                },
                              }}
                              title="Delete point"
                            >
                              ×
                            </Box>
                          )}
                        </Box>
                      );
                    })}
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
                      Editing Point:
                    </Typography>
                    {tempMarkupPoints.filter(point => point.isEditable).map((editablePoint, index) => (
                      <Box key={index}>
                        <Typography variant="body2">
                          Position: <strong>{editablePoint.position}</strong>
                        </Typography>
                        <Typography variant="body2">
                          Category: <strong>{editablePoint.category}</strong>
                        </Typography>
                      </Box>
                    ))}
                    <Typography
                      variant="body2"
                      sx={{ fontSize: 11, color: "text.secondary", mt: 1 }}
                    >
                      Blue point is editable (drag to move, click to edit). Black points are read-only.
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
        maxWidth={false}
        PaperProps={{
          style: {
            position: 'fixed',
            left: modalPosition.x,
            top: modalPosition.y,
            margin: 0,
            maxWidth: '280px',
            width: '280px',
            minWidth: '280px'
          }
        }}
        BackdropProps={{
          style: {
            backgroundColor: 'transparent'
          }
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
                disabled={editMode} // Disable in edit mode
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
                disabled={editMode || !pointData.category} // Disable in edit mode or when category not selected
              >
                {/* In edit mode or when editing existing point, include the current position even if it would normally be filtered out */}
                {(editMode || editingPointIndex !== null
                  ? (positionOptions[pointData.category] || [])
                  : getAvailablePositions(pointData.category)
                ).length === 0 && pointData.category ? (
                  <MenuItem disabled value="">
                    No available positions for this configuration
                  </MenuItem>
                ) : (
                  (editMode || editingPointIndex !== null
                    ? (positionOptions[pointData.category] || [])
                    : getAvailablePositions(pointData.category)
                  ).map((option) => (
                    <MenuItem key={option.key} value={option.key}>
                      {option.label}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPointModal(false)}>Cancel</Button>
          <Button
            onClick={handlePointSubmit}
            variant="contained"
            disabled={editMode ? false : (!pointData.position || !pointData.category)} // In edit mode, always enable since values are readonly
          >
            {editMode ? "Close" : (editingPointIndex !== null ? "Update" : "Add")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddPartModal;