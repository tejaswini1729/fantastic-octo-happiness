import {
  PartViewPanel,
  PartViewHeader,
  ImageContainer,
  MarkupPoint,
} from "../styles/AnnotationStyles";
import { Box, Card, CardMedia, Typography, Tooltip } from "@mui/material";
import { Visibility as VisibilityIcon } from "@mui/icons-material";
import { PART_VW } from "./constants";
import { useState, useEffect, useRef } from "react";

const PartVw = ({ selectedPart }) => {
  const [imageMetadata, setImageMetadata] = useState({
    naturalWidth: 0,
    naturalHeight: 0,
    displayWidth: 0,
    displayHeight: 0,
    isLoaded: false,
  });
  
  const imageRefDisplay = useRef(null);
  const imageContainerRef = useRef(null);

  const handleImageLoad = () => {
    if (imageRefDisplay.current) {
      const img = imageRefDisplay.current;
      const rect = img.getBoundingClientRect();
      
      setImageMetadata({
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        displayWidth: rect.width,
        displayHeight: rect.height,
        isLoaded: true,
      });
    }
  };

  const updateDisplaySize = () => {
    if (imageRefDisplay.current && imageMetadata.isLoaded) {
      const rect = imageRefDisplay.current.getBoundingClientRect();
      setImageMetadata(prev => ({
        ...prev,
        displayWidth: rect.width,
        displayHeight: rect.height,
      }));
    }
  };

  useEffect(() => {
    let resizeTimer;
    
    const debouncedResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateDisplaySize, 100);
    };

    window.addEventListener("resize", debouncedResize);
    return () => {
      window.removeEventListener("resize", debouncedResize);
      clearTimeout(resizeTimer);
    };
  }, [imageMetadata.isLoaded]);

  // Fixed positioning calculation
  const getMarkupPointPosition = (point) => {
    if (!imageRefDisplay.current || !imageContainerRef.current) {
      return { left: 0, top: 0 };
    }

    const img = imageRefDisplay.current;
    const container = imageContainerRef.current;
    
    const imgRect = img.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    // Calculate the position relative to the container
    const relativeLeft = imgRect.left - containerRect.left;
    const relativeTop = imgRect.top - containerRect.top;
    
    // Calculate the actual pixel position on the image
    const pixelX = (point.x / 100) * imgRect.width;
    const pixelY = (point.y / 100) * imgRect.height;
    
    // Final position relative to the container
    const finalLeft = relativeLeft + pixelX;
    const finalTop = relativeTop + pixelY;
    
    return {
      left: finalLeft,
      top: finalTop
    };
  };

  const ScaleInvariantMarkupPoint = ({ point, index }) => {
    const position = getMarkupPointPosition(point);
    
    return (
      <Tooltip
        key={index}
        title={`${point.category} - Position ${point.position}`}
        arrow
        placement="top"
      >
        <Box
          sx={{
            position: "absolute",
            left: `${position.left}px`,
            top: `${position.top}px`,
            transform: "translate(-50%, -50%)",
            width: 24,
            height: 24,
            backgroundColor: "white",
            border: "2px solid #1976d2",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 600,
            color: "#1976d2",
            zIndex: 10,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              transform: "translate(-50%, -50%) scale(1.15)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
              borderColor: "#1565c0",
              backgroundColor: "#f8faff",
            },
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {point.position}
        </Box>
      </Tooltip>
    );
  };

  return (
    <PartViewPanel>
      <PartViewHeader>
        <Typography
          sx={{
            color: "#000000",
            fontWeight: 600,
            fontSize: "16px",
            lineHeight: "100%",
            letterSpacing: "0%",
          }}
        >
          {PART_VW?.ttl}
        </Typography>
      </PartViewHeader>

      <Box
        flex={1}
        p={2}
        display="flex"
        sx={{
          border: "1px solid #E3E3F1",
          borderRadius: "16px",
          backgroundColor: "#FFFFFF",
        }}
      >
        {selectedPart ? (
          <Box width="100%" display="flex" flexDirection="column">
            <Card
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                border: "none",
                overflow: "visible",
              }}
            >
              <Box
                ref={imageContainerRef}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  lineHeight: 0,
                }}
              >
                <Box
                  component="img"
                  src={selectedPart.imageUrl}
                  alt={`${selectedPart.part} - ${selectedPart.model}`}
                  ref={imageRefDisplay}
                  onLoad={handleImageLoad}
                  sx={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    borderRadius: "16px",
                    display: "block",
                    userSelect: "none",
                    verticalAlign: "top",
                  }}
                />

                {selectedPart.selectedMarkupPoint && 
                 selectedPart.selectedMarkupPoint.length > 0 &&
                 imageMetadata.isLoaded && (
                  <>
                    {selectedPart.selectedMarkupPoint.map((point, index) => (
                      <ScaleInvariantMarkupPoint 
                        key={point.id || index} 
                        point={point} 
                        index={index} 
                      />
                    ))}
                  </>
                )}

                {!imageMetadata.isLoaded && selectedPart.imageUrl && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      backgroundColor: "rgba(255,255,255,0.9)",
                      padding: 2,
                      borderRadius: 1,
                      zIndex: 5,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Loading image...
                    </Typography>
                  </Box>
                )}
              </Box>
            </Card>

            {selectedPart.selectedMarkupPoint && selectedPart.selectedMarkupPoint.length > 0 && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: "#f8faff", borderRadius: 1 }}>
                <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
                  Markup Points ({selectedPart.selectedMarkupPoint.length}):
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {selectedPart.selectedMarkupPoint.map((point, index) => (
                    <Typography
                      key={index}
                      variant="caption"
                      sx={{
                        backgroundColor: "#e3f2fd",
                        padding: "2px 8px",
                        borderRadius: 1,
                        fontFamily: "monospace",
                        fontSize: "10px",
                      }}
                    >
                      #{point.position}: {point.category}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        ) : (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            width="100%"
            color="text.secondary"
            sx={{
              minHeight: 200,
              backgroundColor: "#fafafa",
              borderRadius: 2,
              border: "2px dashed #e0e0e0",
            }}
          >
            <VisibilityIcon sx={{ fontSize: 48, mb: 2, color: "#bdbdbd" }} />
            <Typography
              sx={{
                fontWeight: 400,
                fontSize: "14px",
                lineHeight: "150%",
                letterSpacing: "0%",
                textAlign: "center",
                color: "#757575",
                maxWidth: 300,
              }}
            >
              {PART_VW?.info || "Select a part to view its image and markup points"}
            </Typography>
          </Box>
        )}
      </Box>
    </PartViewPanel>
  );
};

export default PartVw;