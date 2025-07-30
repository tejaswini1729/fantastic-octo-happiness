import { useState, useEffect, useRef, useMemo } from "react";
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
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  transformDataToOptions,
  getVariantOptions,
  getPartOptions,
  getSideOptions,
} from "../../../utils/transformDataToOptions";
import { checkPartExists } from "../../../axios/getRequest";

function bytesToSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  else return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

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
  formData,
  updateFormData,
  existingPartsData = null,
  modelOptions = [],
  variantOptions = [],
  partOptions = [],
  sideOptions = [],
}) => {
  console.log("Checking Model Options", modelOptions);
  // Use form data from props instead of local state
  const form = {
    part: formData?.part || "",
    model: formData?.model || "",
    variant: formData?.variant || "",
    side: formData?.side || "",
    image: formData?.image || null,
    imageUrl: formData?.imageUrl || null,
  };

  // Use tempMarkupPoints from parent formData
  const tempMarkupPoints = formData?.tempMarkupPoints || [];

  const setTempMarkupPoints = (newPoints) => {
    console.log("🔥 setTempMarkupPoints CALLED:", {
      editMode,
      currentLength: tempMarkupPoints.length,
      newLength: Array.isArray(newPoints) ? newPoints.length : "not array",
      newPoints: newPoints,
    });
    updateFormData({ tempMarkupPoints: newPoints });
  };

  // Local state for modal operations
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
  const [dragStarted, setDragStarted] = useState(false);
  const [mouseDownPosition, setMouseDownPosition] = useState({ x: 0, y: 0 });
  const [editModeInitialized, setEditModeInitialized] = useState(false);
  const [editModePointsSet, setEditModePointsSet] = useState(false);
  //Zoom states
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  //Pan States
  const [isPanMode, setIsPanMode] = useState(false);
  const [panDistance, setPanDistance] = useState(0);

  //Banner state
  const [showNoPointsBanner, setShowNoPointsBanner] = useState(false);

  // Helper functions
  const getLabel = (options, key) => {
    if (!options || !Array.isArray(options)) return key;
    const option = options.find((opt) => opt.key === key);
    return option ? option.label : key;
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3)); // Max zoom 3x
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5)); // Min zoom 0.5x
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const handlePanStart = (event) => {
    if (event.button === 0 || event.button === 1) {
      const isMiddleMouse = event.button === 1;
      const isLeftMouseAndZoomed = event.button === 0 && zoomLevel > 1;

      if (isMiddleMouse || isLeftMouseAndZoomed) {
        event.preventDefault();
        setIsPanning(true);
        setIsPanMode(true); // Set pan mode flag
        setPanDistance(0); // Reset pan distance
        setPanStart({
          x: event.clientX - imagePosition.x,
          y: event.clientY - imagePosition.y,
        });
      }
    }
  };

  const handlePanMove = (event) => {
    if (isPanning) {
      event.preventDefault();

      const newX = event.clientX - panStart.x;
      const newY = event.clientY - panStart.y;

      // Calculate how far we've moved to determine if this is a pan or click
      const deltaX = Math.abs(newX - imagePosition.x);
      const deltaY = Math.abs(newY - imagePosition.y);
      const currentPanDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      setPanDistance(currentPanDistance);

      // Optional: Add boundaries to prevent panning too far
      const container = containerRef.current;
      if (container && imageRef.current) {
        const containerRect = container.getBoundingClientRect();
        const imgNaturalRatio =
          imageRef.current.naturalWidth / imageRef.current.naturalHeight;
        const containerRatio = containerRect.width / containerRect.height;

        let displayWidth, displayHeight;
        if (imgNaturalRatio > containerRatio) {
          displayWidth = containerRect.width * zoomLevel;
          displayHeight = (containerRect.width / imgNaturalRatio) * zoomLevel;
        } else {
          displayHeight = containerRect.height * zoomLevel;
          displayWidth = containerRect.height * imgNaturalRatio * zoomLevel;
        }

        // Calculate max pan distances to keep image within bounds
        const maxPanX = Math.max(0, (displayWidth - containerRect.width) / 2);
        const maxPanY = Math.max(0, (displayHeight - containerRect.height) / 2);

        const constrainedX = Math.max(-maxPanX, Math.min(maxPanX, newX));
        const constrainedY = Math.max(-maxPanY, Math.min(maxPanY, newY));

        setImagePosition({
          x: constrainedX,
          y: constrainedY,
        });
      } else {
        setImagePosition({
          x: newX,
          y: newY,
        });
      }
    }
  };

  const handlePanEnd = () => {
    setIsPanning(false);
    // Reset pan mode after a short delay to allow click events to be processed
    setTimeout(() => {
      setIsPanMode(false);
      setPanDistance(0);
    }, 50);
  };

  const getKey = (options, label) => {
    if (!options || !Array.isArray(options)) return label;
    const option = options.find((opt) => opt.label === label);
    return option ? option.key : label;
  };

  // Get existing image data for the current configuration
  const getExistingImageData = () => {
    if (
      !form.part ||
      !form.model ||
      !form.variant ||
      !form.side ||
      !existingPartsData ||
      !existingPartsData.exists
    ) {
      return null;
    }

    const currentPart = getLabel(partOptions || [], form.part);
    const currentModel = getLabel(modelOptions || [], form.model);
    const currentVariant = getLabel(variantOptions || [], form.variant);
    const currentSide = getLabel(sideOptions || [], form.side);

    const match =
      existingPartsData.part === currentPart &&
      existingPartsData.model === currentModel &&
      existingPartsData.variant === currentVariant &&
      existingPartsData.side === currentSide &&
      existingPartsData.id;

    if (match) {
      const filename = existingPartsData.imageName || "existing-image.jpg";
      return {
        imageUrl: existingPartsData.imageUrl,
        imageName: filename,
        imageSize: existingPartsData.imageSize || null,
        partId: existingPartsData.id,
      };
    }

    return null;
  };

  // Get existing points for the current image configuration
  const getExistingPointsForImage = () => {
    if (
      !form.part ||
      !form.model ||
      !form.variant ||
      !form.side ||
      !existingPartsData ||
      !existingPartsData.exists
    ) {
      return [];
    }

    const currentPart = getLabel(partOptions, form.part);
    const currentModel = getLabel(modelOptions, form.model);
    const currentVariant = getLabel(variantOptions, form.variant);
    const currentSide = getLabel(sideOptions, form.side);

    const match =
      existingPartsData.part === currentPart &&
      existingPartsData.model === currentModel &&
      existingPartsData.variant === currentVariant &&
      existingPartsData.side === currentSide &&
      existingPartsData.id;

    if (match && existingPartsData.markupPoints) {
      const existingPoints = existingPartsData.markupPoints.map((point) => ({
        ...point,
        partId: existingPartsData.id,
        img_pos_id: point.img_pos_id,
        isReadOnly: true,
        isEditable: false,
      }));
      return existingPoints;
    }

    return [];
  };

  // Get used positions for the current image configuration
  const getUsedPositions = () => {
    if (
      editMode ||
      !form.part ||
      !form.model ||
      !form.variant ||
      !form.side ||
      !existingPartsData ||
      !existingPartsData.exists
    ) {
      return [];
    }

    const currentPart = getLabel(partOptions, form.part);
    const currentModel = getLabel(modelOptions, form.model);
    const currentVariant = getLabel(variantOptions, form.variant);
    const currentSide = getLabel(sideOptions, form.side);

    const match =
      existingPartsData.part === currentPart &&
      existingPartsData.model === currentModel &&
      existingPartsData.variant === currentVariant &&
      existingPartsData.side === currentSide &&
      existingPartsData.id;

    let usedPositions = [];

    if (match && existingPartsData.markupPoints) {
      usedPositions = existingPartsData.markupPoints.map((point) => ({
        position: point.position.toString(),
        img_pos_id: point.img_pos_id,
        category: point.category,
      }));
    }

    const currentPositions = tempMarkupPoints
      .filter((point) => !point.isReadOnly)
      .map((point) => ({
        position: point.position.toString(),
        img_pos_id: point.img_pos_id || null,
        category: point.category,
      }));

    const allPositions = [...usedPositions, ...currentPositions];
    const uniquePositions = [...new Set(allPositions.map((p) => p.position))];

    return uniquePositions;
  };

  // Filter available positions based on category and used positions
  const getAvailablePositions = (category) => {
    const allPositions = positionOptions[category] || [];
    const usedPositions = getUsedPositions();

    return allPositions.filter(
      (position) => !usedPositions.includes(position.key)
    );
  };

  const resetData = () => {
    if (editMode) {
      setStep(2);
      setHasVisitedStep2(true);
      setEditingPointIndex(null);
      // Reset zoom in edit mode too
      setZoomLevel(1);
      setImagePosition({ x: 0, y: 0 });
      setIsPanning(false);
      return;
    }

    // Reset form data in parent
    updateFormData({
      part: "",
      model: "",
      variant: "",
      side: "",
      image: null,
      imageUrl: null,
      tempMarkupPoints: [],
    });
    setStep(1);
    setHasVisitedStep2(false);
    setEditingPointIndex(null);
    setIsManuallyUploaded(false);
    setEditModeInitialized(false);
    setEditModePointsSet(false);

    // Reset zoom
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
    setIsPanning(false);
  };

  // Auto-load image when configuration matches existing part
  useEffect(() => {
    if (
      !editMode &&
      !editModePointsSet &&
      form.part &&
      form.model &&
      form.variant &&
      form.side &&
      !form.imageUrl &&
      !isManuallyUploaded &&
      existingPartsData &&
      existingPartsData.exists
    ) {
      const existingImageData = getExistingImageData();

      if (existingImageData) {
        handleChange("image", {
          name: existingImageData.imageName,
          size: existingImageData.imageSize,
          isAutoLoaded: true,
          partId: existingImageData.partId,
        });
        handleChange("imageUrl", existingImageData.imageUrl);
        setProgress(100);

        setTimeout(() => {
          const existingPoints = getExistingPointsForImage();
          setTempMarkupPoints(existingPoints);
        }, 100);
      }
    }
  }, [
    form.part,
    form.model,
    form.variant,
    form.side,
    editMode,
    existingPartsData,
    editModePointsSet,
  ]);

  // Update temp markup points when form changes
  useEffect(() => {
    if (
      !editMode &&
      !editModePointsSet &&
      form.part &&
      form.model &&
      form.variant &&
      form.side &&
      form.imageUrl &&
      existingPartsData &&
      existingPartsData.exists
    ) {
      const existingPoints = getExistingPointsForImage();
      const newPoints = tempMarkupPoints.filter((point) => !point.isReadOnly);
      setTempMarkupPoints([...existingPoints, ...newPoints]);
    }
  }, [form.imageUrl, editModePointsSet]);

  // Reset edit mode initialization when editData changes
  useEffect(() => {
    if (editMode && editData) {
      setEditModeInitialized(false);
      setEditModePointsSet(false);
    }
  }, [editData?.markupPoint?.img_pos_id, editData?.markupPoint?.position]);

  const setupEditModePoints = () => {
    if (!editMode || !editData) return;

    let allMarkupPointsForImage = [];

    if (
      existingPartsData?.exists &&
      existingPartsData.markupPoints?.length > 0
    ) {
      allMarkupPointsForImage = existingPartsData.markupPoints.map((point) => ({
        ...point,
        partId: existingPartsData.id,
        img_pos_id: point.img_pos_id,
        isReadOnly: true,
        isEditable: false,
      }));
    } else {
      allMarkupPointsForImage = [
        {
          ...editData.markupPoint,
          partId: editData.partData.id,
          isReadOnly: true,
          isEditable: false,
        },
      ];
    }

    const editablePoint = editData.markupPoint;
    const finalPoints = allMarkupPointsForImage.map((point) => ({
      ...point,
      isEditable:
        point.img_pos_id === editablePoint.img_pos_id &&
        point.position == editablePoint.position &&
        point.category === editablePoint.category,
      isReadOnly: !(
        point.img_pos_id === editablePoint.img_pos_id &&
        point.position == editablePoint.position &&
        point.category === editablePoint.category
      ),
    }));

    setTempMarkupPoints(finalPoints);
  };

  // Replace both your useEffects with these two simplified ones:

  // Main edit mode initialization
  useEffect(() => {
    if (editMode && editData && open) {
      setEditModeInitialized(true);
      setupEditModePoints();
      setStep(2);
      setHasVisitedStep2(true);
      setProgress(100);
      setPointData({
        position: editData.markupPoint.position.toString(),
        category: editData.markupPoint.category,
      });
      setEditModePointsSet(true);
    } else if (!editMode) {
      resetData();
    }
  }, [editMode, editData?.markupPoint?.img_pos_id, open]);

  // Update points when existingPartsData loads
  useEffect(() => {
    if (
      editMode &&
      editData &&
      open &&
      existingPartsData?.markupPoints?.length > 0 &&
      tempMarkupPoints.length === 1
    ) {
      setupEditModePoints();
    }
  }, [existingPartsData?.markupPoints?.length]);

  const handleChange = (key, value) => {
    const updates = { [key]: value };

    // Reset dependent fields when parent selections change
    if (key === "model") {
      updates.variant = "";
      updates.part = "";
      updates.side = "";
      // Clear image when model changes
      if (!isManuallyUploaded) {
        updates.image = null;
        updates.imageUrl = null;
        updates.tempMarkupPoints = [];
        setProgress(0);
      }
    } else if (key === "variant") {
      updates.part = "";
      updates.side = "";
      // Clear image when variant changes
      if (!isManuallyUploaded) {
        updates.image = null;
        updates.imageUrl = null;
        updates.tempMarkupPoints = [];
        setProgress(0);
      }
    } else if (key === "part") {
      updates.side = "";
      // Clear image when part changes
      if (!isManuallyUploaded) {
        updates.image = null;
        updates.imageUrl = null;
        updates.tempMarkupPoints = [];
        setProgress(0);
      }
    } else if (key === "side") {
      // Clear image when side changes
      if (!isManuallyUploaded) {
        updates.image = null;
        updates.imageUrl = null;
        updates.tempMarkupPoints = [];
        setProgress(0);
      }
    }

    updateFormData(updates);

    // Reset manual upload flag when form configuration changes
    if (
      !editMode &&
      (key === "part" || key === "model" || key === "variant" || key === "side")
    ) {
      setIsManuallyUploaded(false);
    }
  };
  const handleDelete = () => {
    const hasExistingPoints = tempMarkupPoints.some(
      (point) => point.isReadOnly
    );

    if (hasExistingPoints && form.image?.isAutoLoaded) {
      return;
    }

    handleChange("image", null);
    handleChange("imageUrl", null);
    setIsManuallyUploaded(false);
    setProgress(0);
    setTempMarkupPoints([]);
  };

  const handleDeletePoint = (pointIndex) => {
    if (editMode) return;

    const point = tempMarkupPoints[pointIndex];
    if (point.isReadOnly) return;

    const updatedPoints = tempMarkupPoints.filter(
      (_, index) => index !== pointIndex
    );
    setTempMarkupPoints(updatedPoints);
    setPointModal(false);
    setEditingPointIndex(null);
  };

  function mapDataRecord() {
    const data = {
      id: editMode ? editData?.partData?.id : undefined,
      part: getLabel(partOptions, form.part),
      model: getLabel(modelOptions, form.model),
      variant: getLabel(variantOptions, form.variant),
      side: getLabel(sideOptions, form.side),
      imageUrl: form.imageUrl,
      imageName: form.image?.name || null,
      imageSize: form.image?.size || null,
      markupPoints: (() => {
        if (editMode) {
          return tempMarkupPoints.map((point) => {
            const basePoint = {
              x: point.x,
              y: point.y,
              position: point.position,
              category: point.category,
              img_pos_id: point.img_pos_id || null,
            };

            if (point.isEditable) {
              basePoint.method = "UPDATE";
            }

            return basePoint;
          });
        } else {
          return tempMarkupPoints
            .filter((point) => !point.isReadOnly)
            .map((point) => ({
              x: point.x,
              y: point.y,
              position: point.position,
              category: point.category,
            }));
        }
      })(),
    };

    return data;
  }

  const hanldeOnNext = () => {
    if (editMode && step === 3) {
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
    if (e?.target?.name === ADD_MDL?.BTN_LBL1) {
      setIsDisabled(true);
      onClose(resetData);
    } else {
      setIsDisabled(false);
      if (editMode && step === 3) {
        setStep(2);
      } else if (editMode && step === 2) {
        setIsDisabled(true);
        onClose(resetData);
      } else {
        setStep((prevStep) => prevStep - 1);
      }
    }
  };

  const handleImageSelect = (e) => {
    e.preventDefault();
    setSnackbarOpen(false);

    const file =
      e.target.files?.[0] || (e.dataTransfer && e.dataTransfer.files?.[0]);

    if (file) {
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        setSnackbarMessage(
          ADD_MDL?.IMG_INFO_ERR || "File size too large. Maximum size is 2MB."
        );
        setSnackbarSeverity("warning");
        setSnackbarOpen(true);
        if (e.target.value) e.target.value = "";
        return;
      }

      handleChange("image", file);
      setIsManuallyUploaded(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        handleChange("imageUrl", e.target.result);
        setTempMarkupPoints([]);
      };
      reader.onerror = () => {
        setSnackbarMessage("Error reading file. Please try again.");
        setSnackbarSeverity("error");
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

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleImageSelect(e);
  };

  const handlePointClick = (event, pointIndex) => {
    const point = tempMarkupPoints[pointIndex];

    if (point.isReadOnly) return;
    if (editMode && !point.isEditable) return;

    if (dragStarted) {
      setDragStarted(false);
      return;
    }

    event.stopPropagation();

    const categoryKey =
      categoryOptions.find((opt) => opt.label === point.category)?.key ||
      point.category;

    const positionKey = point.position.toString();

    setPointData({
      position: positionKey,
      category: categoryKey,
    });

    setCurrentPoint({ x: point.x, y: point.y });

    const modalX = event.clientX + 20;
    const modalY = event.clientY - 100;

    const adjustedX = Math.min(modalX, window.innerWidth - 300);
    const adjustedY = Math.max(modalY, 50);

    setModalPosition({ x: adjustedX, y: adjustedY });
    setEditingPointIndex(pointIndex);
    setPointModal(true);
  };

  const handlePointMouseDown = (event, pointIndex) => {
    const point = tempMarkupPoints[pointIndex];

    if (point.isReadOnly) return;
    if (editMode && !point.isEditable) return;

    if (!editMode || (editMode && point.isEditable)) {
      event.preventDefault();
      event.stopPropagation(); // This line already exists

      setMouseDownPosition({ x: event.clientX, y: event.clientY });
      setIsDragging(true);
      setDragPointIndex(pointIndex);
      setDragStarted(false);
    }
  };
  const handleMouseMove = (event) => {
    if (isPanning) {
      handlePanMove(event);
      return;
    }

    if (!isDragging || dragPointIndex === null || !imageRef.current) return;

    const point = tempMarkupPoints[dragPointIndex];
    if (point?.isReadOnly) return;
    if (editMode && !point?.isEditable) return;

    event.preventDefault();
    event.stopPropagation();

    const deltaX = Math.abs(event.clientX - mouseDownPosition.x);
    const deltaY = Math.abs(event.clientY - mouseDownPosition.y);
    const movementDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (movementDistance > 2 && !dragStarted) {
      setDragStarted(true);
    }

    if (movementDistance > 2) {
      const img = imageRef.current;
      const imgRect = img.getBoundingClientRect();

      // Get mouse position relative to the actual image element
      const mouseX = event.clientX - imgRect.left;
      const mouseY = event.clientY - imgRect.top;

      // Convert to percentage
      const xPercent = (mouseX / imgRect.width) * 100;
      const yPercent = (mouseY / imgRect.height) * 100;

      const clampedX = Math.max(0, Math.min(100, xPercent));
      const clampedY = Math.max(0, Math.min(100, yPercent));

      const updatedPoints = tempMarkupPoints.map((point, index) =>
        index === dragPointIndex
          ? { ...point, x: clampedX, y: clampedY }
          : point
      );
      setTempMarkupPoints(updatedPoints);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragPointIndex(null);
    handlePanEnd();

    setTimeout(() => {
      setDragStarted(false);
    }, 150);
  };
  const handleImageClick = (event) => {
  if (!form.imageUrl || !imageRef.current) return;

  // Prevent adding points in edit mode
  if (editMode) return;

  // Prevent adding points if we just finished panning (moved more than 5 pixels)
  if (isPanMode || panDistance > 5) {
    return;
  }

  // Prevent adding points while panning
  if (isPanning) return;

  if (dragStarted) {
    return;
  }
  setShowNoPointsBanner(false);

  event.preventDefault();
  event.stopPropagation();

  const img = imageRef.current;
  
  // ✅ Use simple method when no zoom/pan is active (this preserves existing points functionality)
  if (zoomLevel === 1 && imagePosition.x === 0 && imagePosition.y === 0) {
    // Simple method - this is what was working before
    const imgRect = img.getBoundingClientRect();
    const clickX = event.clientX - imgRect.left;
    const clickY = event.clientY - imgRect.top;
    
    if (clickX < 0 || clickX > imgRect.width || clickY < 0 || clickY > imgRect.height) {
      return;
    }
    
    const xPercent = (clickX / imgRect.width) * 100;
    const yPercent = (clickY / imgRect.height) * 100;
    
    const clampedX = Math.max(0, Math.min(100, xPercent));
    const clampedY = Math.max(0, Math.min(100, yPercent));
    
    setCurrentPoint({ x: clampedX, y: clampedY });
  } else {
    // Complex method for zoom/pan (your new logic)
    const container = containerRef.current;
    
    if (!container) {
      // Fallback to simple method if container not available
      const imgRect = img.getBoundingClientRect();
      const clickX = event.clientX - imgRect.left;
      const clickY = event.clientY - imgRect.top;
      
      if (clickX < 0 || clickX > imgRect.width || clickY < 0 || clickY > imgRect.height) {
        return;
      }
      
      const xPercent = (clickX / imgRect.width) * 100;
      const yPercent = (clickY / imgRect.height) * 100;
      
      const clampedX = Math.max(0, Math.min(100, xPercent));
      const clampedY = Math.max(0, Math.min(100, yPercent));
      
      setCurrentPoint({ x: clampedX, y: clampedY });
    } else {
      // Your existing complex logic for zoom/pan
      const transformedContainer = img.parentElement;
      const transformedRect = transformedContainer.getBoundingClientRect();

      const clickX = event.clientX - transformedRect.left;
      const clickY = event.clientY - transformedRect.top;

      if (clickX < 0 || clickX > transformedRect.width || clickY < 0 || clickY > transformedRect.height) {
        return;
      }

      const xPercent = (clickX / transformedRect.width) * 100;
      const yPercent = (clickY / transformedRect.height) * 100;

      const clampedX = Math.max(0, Math.min(100, xPercent));
      const clampedY = Math.max(0, Math.min(100, yPercent));

      setCurrentPoint({ x: clampedX, y: clampedY });

      console.log("Complex positioning:", {
        transformedRect,
        clickX,
        clickY,
        percentages: { x: clampedX, y: clampedY },
        zoomLevel,
        imagePosition,
      });
    }
  }

  // Rest of the function remains the same
  const modalX = event.clientX + 20;
  const modalY = event.clientY - 100;

  const adjustedX = Math.min(modalX, window.innerWidth - 300);
  const adjustedY = Math.max(modalY, 50);

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

      // Check for position uniqueness (only in add mode and when adding new point)
      if (!editMode && editingPointIndex === null) {
        const existingPoint = tempMarkupPoints.find((point) => {
          if (
            point.img_pos_id &&
            point.position === newPoint.position &&
            point.category === newPoint.category
          ) {
            return true;
          }
          return (
            point.position === newPoint.position &&
            point.category === newPoint.category
          );
        });

        if (existingPoint) {
          setSnackbarMessage(
            `Position ${newPoint.position} with category ${newPoint.category} already exists.`
          );
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
          return;
        }
      }

      let updatedPoints;
      if (editingPointIndex !== null) {
        updatedPoints = tempMarkupPoints.map((point, index) =>
          index === editingPointIndex
            ? {
                ...newPoint,
                img_pos_id: point.img_pos_id,
                partId: point.partId,
                isEditable: editMode ? point.isEditable : undefined,
              }
            : point
        );
      } else {
        if (!editMode) {
          updatedPoints = [...tempMarkupPoints, newPoint];
        } else {
          updatedPoints = tempMarkupPoints;
        }
      }

      setTempMarkupPoints(updatedPoints);
      setPointModal(false);
      if (!editMode) {
        setPointData({ position: "", category: "" });
      }
      setEditingPointIndex(null);
    }
  };

  const getImageContainerCursor = () => {
    if (isPanning) return "grabbing";
    if (editMode) return "default";
    if (isDragging) return "grabbing";
    if (zoomLevel > 1) return "grab"; // Pan mode when zoomed
    return "crosshair"; // Add point mode when not zoomed
  };

  useEffect(() => {
    if (editMode) {
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
  // Show banner when image exists but no points exist
  if (
    !editMode &&
    form.imageUrl &&
    form.part &&
    form.model &&
    form.variant &&
    form.side &&
    tempMarkupPoints.length === 0
  ) {
    setShowNoPointsBanner(true);
  } else {
    setShowNoPointsBanner(false);
  }
}, [form.imageUrl, tempMarkupPoints.length, form.part, form.model, form.variant, form.side, editMode]);
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
            onClick={(e) => {
              // Create a proper event object with the name
              const syntheticEvent = { target: { name: ADD_MDL?.BTN_LBL1 } };
              handleClose(syntheticEvent);
            }}
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
            {/* Model Dropdown */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="model-select-label">Model</InputLabel>
              <Select
                labelId="model-select-label"
                value={form.model}
                label="Model"
                onChange={(e) => {
                  console.log("Checking model", e.target.value);
                  handleChange("model", e.target.value);
                }}
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
                disabled={!form.model} // Disable when no model selected
              >
                {variantOptions.map((variant) => (
                  <MenuItem key={variant.key} value={variant.key}>
                    {variant.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Part Dropdown */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="part-select-label">{ADD_MDL?.DD_LBL}</InputLabel>
              <Select
                labelId="part-select-label"
                value={form.part}
                label={ADD_MDL?.DD_LBL}
                onChange={(e) => handleChange("part", e.target.value)}
                disabled={!form.variant} // Disable when no variant selected
              >
                {partOptions.map((part) => (
                  <MenuItem key={part.key} value={part.key}>
                    {part.label}
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
                disabled={!form.part || editMode} // Disable when no part selected or in edit mode
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
                    disabled={
                      form.image?.isAutoLoaded &&
                      tempMarkupPoints.some((point) => point.isReadOnly)
                    }
                    sx={{
                      opacity:
                        form.image?.isAutoLoaded &&
                        tempMarkupPoints.some((point) => point.isReadOnly)
                          ? 0.5
                          : 1,
                      cursor:
                        form.image?.isAutoLoaded &&
                        tempMarkupPoints.some((point) => point.isReadOnly)
                          ? "not-allowed"
                          : "pointer",
                    }}
                    title={
                      form.image?.isAutoLoaded &&
                      tempMarkupPoints.some((point) => point.isReadOnly)
                        ? "Cannot delete image with existing markup points"
                        : "Delete image"
                    }
                  >
                    <DeleteIcon
                      sx={{
                        width: 20,
                        height: 20,
                        color:
                          form.image?.isAutoLoaded &&
                          tempMarkupPoints.some((point) => point.isReadOnly)
                            ? "#999"
                            : "#363939",
                      }}
                    />
                  </IconButton>
                </Box>
              </Box>
            ) : (
              <Box
                onDrop={handleDrop}
                onDragOver={handleDragOver}
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
                            Tap the uploaded part image to place points. Once
                            placed, you can drag points to move them or click to
                            edit.
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
                    position: "relative",
                  }}
                >
                  {showNoPointsBanner && (
          <Box
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              zIndex: 25,
              backgroundColor: "#FF5252",
              color: "white",
              padding: "8px 12px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: "bold",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            No points exist for this configuration
          </Box>
        )}
                  {/* Zoom Controls */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      zIndex: 20,
                      display: "flex",
                      gap: 0.5,
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      borderRadius: "8px",
                      padding: "4px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={handleZoomIn}
                      disabled={zoomLevel >= 3}
                      sx={{
                        minWidth: 32,
                        minHeight: 32,
                        fontSize: "16px",
                        fontWeight: "bold",
                        "&:disabled": { opacity: 0.5 },
                      }}
                      title="Zoom In"
                    >
                      +
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={handleZoomOut}
                      disabled={zoomLevel <= 0.5}
                      sx={{
                        minWidth: 32,
                        minHeight: 32,
                        fontSize: "16px",
                        fontWeight: "bold",
                        "&:disabled": { opacity: 0.5 },
                      }}
                      title="Zoom Out"
                    >
                      −
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={handleResetZoom}
                      sx={{
                        minWidth: 32,
                        minHeight: 32,
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                      title="Reset Zoom"
                    >
                      ⌂
                    </IconButton>
                  </Box>

                  {/* Zoom Level Indicator */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 12,
                      right: 12,
                      zIndex: 20,
                      backgroundColor: "rgba(0, 0, 0, 0.7)",
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {Math.round(zoomLevel * 100)}%
                  </Box>

                  <Box
                    ref={containerRef}
                    sx={{
                      position: "relative",
                      width: "100%",
                      height: "400px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      cursor: getImageContainerCursor(),
                    }}
                    onClick={!editMode ? handleImageClick : undefined}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onMouseDown={(event) => {
                      // Handle panning
                      handlePanStart(event);
                    }}
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    {/* Image Container - this applies the zoom and pan transform */}
                    <Box
                      sx={{
                        position: "relative",
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transform: `scale(${zoomLevel}) translate(${
                          imagePosition.x / zoomLevel
                        }px, ${imagePosition.y / zoomLevel}px)`,
                        transformOrigin: "center center",
                        transition: isPanning ? "none" : "transform 0.2s ease",
                      }}
                    >
                      <Box
                        component="img"
                        src={form.imageUrl}
                        alt="Uploaded part"
                        ref={imageRef}
                        sx={{
                          maxWidth: "100%",
                          maxHeight: "100%",
                          objectFit: "contain",
                          display: "block",
                          borderRadius: "16px",
                          userSelect: "none",
                        }}
                        draggable={false}
                      />
                      {/* Markup Points - these are inside the transformed container so they zoom with the image */}
                      {tempMarkupPoints.map((point, index) => {
                        const isEditable = !editMode || point.isEditable;
                        const isReadOnly = point.isReadOnly;
                        const isCurrentlyDragging =
                          !editMode && dragPointIndex === index;

                        // Enhanced color coding for edit mode
                        let borderColor, backgroundColor, opacity;
                        if (editMode) {
                          if (point.isEditable) {
                            borderColor = isCurrentlyDragging
                              ? "4px solid #00C851"
                              : "3px solid #00C851";
                            backgroundColor = "white";
                            opacity = 1;
                          } else {
                            borderColor = "2px solid #999999";
                            backgroundColor = "#f5f5f5";
                            opacity = 0.7;
                          }
                        } else {
                          if (isReadOnly) {
                            borderColor = "2px solid #666666";
                            backgroundColor = "white";
                            opacity = 0.6;
                          } else if (isCurrentlyDragging) {
                            borderColor = "3px solid #3F57FF";
                            backgroundColor = "white";
                            opacity = 1;
                          } else {
                            borderColor = "2px solid #3F57FF";
                            backgroundColor = "white";
                            opacity = 1;
                          }
                        }

                        const digitLength = point.position.toString().length;
                        const circleSize =
                          digitLength === 1 ? 22 : digitLength === 2 ? 26 : 30;
                        const fontSize =
                          digitLength === 1 ? 13 : digitLength === 2 ? 12 : 11;

                        return (
                          <Box
                            key={point.img_pos_id || index}
                            sx={{
                              position: "absolute",
                              // Use percentage positioning with proper centering
                              left: `${point.x}%`,
                              top: `${point.y}%`,
                              width: `${circleSize}px`,
                              height: `${circleSize}px`,
                              backgroundColor: backgroundColor,
                              border: borderColor,
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: `${fontSize}px`,
                              fontWeight: 600,
                              color: "black",
                              textAlign: "center",
                              lineHeight: "1",
                              fontFamily: "Arial, sans-serif",
                              zIndex: 15,
                              cursor:
                                isReadOnly || !isEditable
                                  ? "default"
                                  : isDragging && dragPointIndex === index
                                  ? "grabbing"
                                  : "grab",
                              userSelect: "none",
                              transition: "all 0.2s ease",
                              opacity: opacity,
                              // This is the key fix - proper centering transform
                              transform: "translate(-50%, -50%)",
                              transformOrigin: "center center",
                              "&:hover":
                                isEditable && !isReadOnly
                                  ? {
                                      backgroundColor: editMode
                                        ? "#f0fff0"
                                        : "#f0f0f0",
                                      transform:
                                        "translate(-50%, -50%) scale(1.1)",
                                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                    }
                                  : {},
                            }}
                            title={
                              editMode
                                ? point.isEditable
                                  ? `Editable point (ID: ${point.img_pos_id}) - drag to move, click to edit`
                                  : `Read-only point from other parts (ID: ${point.img_pos_id})`
                                : isReadOnly
                                ? `Existing point (ID: ${point.img_pos_id}) - read-only`
                                : "Drag to move, click to edit"
                            }
                            onMouseDown={(e) => handlePointMouseDown(e, index)}
                            onClick={(e) => handlePointClick(e, index)}
                          >
                            {point.position}
                            {!editMode && !isReadOnly && (
                              <Box
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
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
                                  zIndex: 16,
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

                    {/* Help text for panning */}
                    {zoomLevel > 1 && (
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 40,
                          left: 12,
                          backgroundColor: "rgba(0, 0, 0, 0.7)",
                          color: "white",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "10px",
                          zIndex: 20,
                        }}
                      >
                        {editMode
                          ? "Drag to pan image"
                          : "Left-click: Add point • Middle-click: Pan"}
                      </Box>
                    )}
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
                    {tempMarkupPoints
                      .filter((point) => point.isEditable)
                      .map((editablePoint, index) => (
                        <Box key={editablePoint.img_pos_id || index}>
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
                      Green point is editable (drag and move to change the
                      position of it). Gray points are read-only.
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
        )}

        {(step === 3 || (editMode && step === 3)) && (
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
                  Model:{" "}
                  <strong>
                    {modelOptions?.find((m) => m.key === form.model)?.label ||
                      form.model}
                  </strong>
                </Typography>
                <Typography>
                  Variant:{" "}
                  <strong>
                    {variantOptions.find((v) => v.key === form.variant)
                      ?.label || form.variant}
                  </strong>
                </Typography>
                <Typography>
                  Part:{" "}
                  <strong>
                    {partOptions.find((p) => p.key === form.part)?.label ||
                      form.part}
                  </strong>
                </Typography>
                <Typography>
                  Side:{" "}
                  <strong>
                    {sideOptions.find((s) => s.key === form.side)?.label ||
                      form.side}
                  </strong>
                </Typography>
                <Typography>
                  Position Added :
                  <strong>
                    {tempMarkupPoints.filter(
                      (point) =>
                        !point.isReadOnly || (editMode && point.isEditable)
                    ).length > 0
                      ? tempMarkupPoints
                          .filter(
                            (point) =>
                              !point.isReadOnly ||
                              (editMode && point.isEditable)
                          )
                          .map((point, index) => (
                            <span key={index}>
                              {point.position}
                              {index <
                              tempMarkupPoints.filter(
                                (p) =>
                                  !p.isReadOnly || (editMode && p.isEditable)
                              ).length -
                                1
                                ? ", "
                                : ""}
                            </span>
                          ))
                      : "No points added"}
                  </strong>
                </Typography>
                <Typography>
                  Category:
                  <strong>
                    {tempMarkupPoints.filter(
                      (point) =>
                        !point.isReadOnly || (editMode && point.isEditable)
                    ).length > 0
                      ? tempMarkupPoints
                          .filter(
                            (point) =>
                              !point.isReadOnly ||
                              (editMode && point.isEditable)
                          )
                          .map((point, index) => (
                            <span key={index}>
                              {categoryOptions.find(
                                (c) => c.key === point.category
                              )?.label || point.category}
                              {index <
                              tempMarkupPoints.filter(
                                (p) =>
                                  !p.isReadOnly || (editMode && p.isEditable)
                              ).length -
                                1
                                ? ", "
                                : ""}
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
            onClick={(e) => {
              // Create a proper event object with the name
              const buttonName =
                step === 1 ? ADD_MDL?.BTN_LBL1 : ADD_MDL?.BTN_LBL3;
              const syntheticEvent = { target: { name: buttonName } };
              handleClose(syntheticEvent);
            }}
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
          title={snackbarSeverity === "error" ? "Error" : "Warning"}
          message={snackbarMessage || ADD_MDL?.IMG_INFO_ERR}
          severity={snackbarSeverity}
          sx={{
            backgroundColor:
              snackbarSeverity === "error" ? "#FF5252" : "#FFAA00",
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
            position: "fixed",
            left: modalPosition.x,
            top: modalPosition.y,
            margin: 0,
            maxWidth: "280px",
            width: "280px",
            minWidth: "280px",
          },
        }}
        BackdropProps={{
          style: {
            backgroundColor: "transparent",
          },
        }}
      >
        <DialogTitle>
          {editingPointIndex !== null
            ? "Edit Markup Point"
            : "Add Markup Point"}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {console.log(
            "Point modal rendering with pointData:",
            pointData,
            "editMode:",
            editMode
          )}
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
                {/* In edit mode or when editing existing point, include the current position even if it would normally be filtered out */}
                {(() => {
                  let availableOptions;
                  if (editMode || editingPointIndex !== null) {
                    availableOptions =
                      positionOptions[pointData.category] || [];
                    // In edit mode, ensure the current position is included even if not in predefined options
                    if (
                      editMode &&
                      pointData.position &&
                      !availableOptions.some(
                        (opt) => opt.key === pointData.position
                      )
                    ) {
                      console.log(
                        "🔧 Adding current position to dropdown:",
                        pointData.position
                      );
                      availableOptions = [
                        ...availableOptions,
                        { key: pointData.position, label: pointData.position },
                      ];
                    }
                  } else {
                    availableOptions = getAvailablePositions(
                      pointData.category
                    );
                  }

                  if (availableOptions.length === 0 && pointData.category) {
                    return (
                      <MenuItem disabled value="">
                        No available positions for this configuration
                      </MenuItem>
                    );
                  }

                  return availableOptions.map((option) => (
                    <MenuItem key={option.key} value={option.key}>
                      {option.label}
                    </MenuItem>
                  ));
                })()}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPointModal(false)}>Cancel</Button>
          <Button
            onClick={handlePointSubmit}
            variant="contained"
            disabled={
              editMode ? false : !pointData.position || !pointData.category
            } // In edit mode, always enable since values are readonly
          >
            {editMode ? "Close" : editingPointIndex !== null ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddPartModal;


// Auto-load image when configuration matches existing part
useEffect(() => {
  console.log("🔄 Auto-load useEffect triggered:", {
    editMode,
    editModePointsSet,
    formComplete: !!(form.part && form.model && form.variant && form.side),
    hasImageUrl: !!form.imageUrl,
    isManuallyUploaded,
    hasExistingPartsData: !!(existingPartsData && existingPartsData.exists)
  });

  if (
    !editMode &&
    !editModePointsSet &&
    form.part &&
    form.model &&
    form.variant &&
    form.side &&
    !form.imageUrl &&
    !isManuallyUploaded &&
    existingPartsData &&
    existingPartsData.exists
  ) {
    const existingImageData = getExistingImageData();

    if (existingImageData) {
      console.log("🔄 Auto-loading existing configuration...");
      
      // Get existing points IMMEDIATELY, not in setTimeout
      const existingPoints = getExistingPointsForImage();
      console.log("🔄 Existing points found:", existingPoints);

      handleChange("image", {
        name: existingImageData.imageName,
        size: existingImageData.imageSize,
        isAutoLoaded: true,
        partId: existingImageData.partId,
      });
      handleChange("imageUrl", existingImageData.imageUrl);
      setProgress(100);
      
      // Set points immediately with the image data
      setTempMarkupPoints(existingPoints);
    }
  }
}, [
  form.part,
  form.model,
  form.variant,
  form.side,
  editMode,
  existingPartsData?.exists, // Use .exists instead of whole object
  editModePointsSet,
  isManuallyUploaded
]);