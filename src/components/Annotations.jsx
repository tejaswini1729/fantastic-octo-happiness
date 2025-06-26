import { useState } from "react";
import filterLatest from "../../assets/icons/filterLatest.svg";
import { HDR_CONST } from "./components/constants";
import HeaderWithSearchActions from "./components/HdrWithSrchActions";
import AddPartModal from "./components/AddPartMdl";
import PartModelTable from "./components/PartMdlTbl";
import PartVw from "./components/PartVw";
import Alert from "../../components/Alert";
import { ContentContainer } from "./styles/AnnotationStyles";

const Annotations = () => {
  const [isDataAdded, setIsDataAdded] = useState(false);
  const [partsData, setFormData] = useState([
    {
      id: 1,
      part: 'Door',
      model: 'YGB',
      variant: 'LxI',
      side: 'Right Hand',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      markupPoints: [
        {
          x: 25,
          y: 30,
          position: 11,
          category: 'All',
        },
        {
          x: 75,
          y: 60,
          position: 12,
          category: 'All-1',
        }
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
        {
          x: 35,
          y: 25,
          position: 13,
          category: 'LD Gap',
        },
        {
          x: 80,
          y: 70,
          position: 14,
          category: 'All',
        }
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
        {
          x: 45,
          y: 35,
          position: 15,
          category: 'Supplier Part',
        },
        {
          x: 65,
          y: 55,
          position: 16,
          category: 'All',
        }
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
        {
          x: 40,
          y: 45,
          position: 17,
          category: 'All',
        }
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
        {
          x: 30,
          y: 40,
          position: 18,
          category: 'CMM',
        },
        {
          x: 70,
          y: 65,
          position: 19,
          category: 'All',
        }
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
        {
          x: 50,
          y: 20,
          position: 20,
          category: 'CMM',
        },
        {
          x: 35,
          y: 75,
          position: 21,
          category: 'All',
        }
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
        {
          x: 55,
          y: 50,
          position: 22,
          category: 'CMM',
        }
      ]
    },
    {
      id: 8,
      part: 'Door',
      model: 'YGB',
      variant: 'ZxI',
      side: 'Right Hand',
      category: 'All',
      imageUrl: 'https://images.unsplash.com/photo-1605711285791-0219e80e43a3?w=400&h=300&fit=crop',
      markupPoints: [
        {
          x: 45,
          y: 30,
          position: 23,
          category: 'All',
        },
        {
          x: 75,
          y: 55,
          position: 24,
          category: 'All - testing',
        }
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
        {
          x: 40,
          y: 40,
          position: 25,
          category: 'All',
        }
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
        {
          x: 42,
          y: 28,
          position: 26,
          category: 'LD Gap',
        },
        {
          x: 68,
          y: 62,
          position: 27,
          category: 'LD Gap-All',
        }
      ]
    }
  ]);

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);
  const [editData, setEditData] = useState(null);
  const [alertMessage, setAlertMessage] = useState("Image Uploaded for SIZE STOPPER 2 UP/DN");

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  // Handle adding new parts
  const onNext = (partData) => {
    const randomId = Math.floor(Math.random() * 1_000_000) + 101;
    const newPartData = { ...partData, id: randomId };
    setFormData((prev) => [...prev, newPartData]);
    setModalOpen(false);
    setAlertMessage(`Image uploaded successfully for ${partData.part}`);
    setIsDataAdded(true);
  };

  // Handle opening edit modal
  const handleEditMarkupPoint = (editInfo) => {
    setEditData(editInfo);
    setModalOpen(true);
  };

  // Handle submitting edit changes
  const handleEditSubmit = (editInfo) => {
    const { partData, updatedData } = editInfo;
    
    setFormData(prev => prev.map(part => {
      if (part.id === partData.id) {
        return {
          ...part,
          ...updatedData,
          markupPoints: updatedData.markupPoints
        };
      }
      return part;
    }));

    // Update selected part if it's currently being viewed
    if (selectedPart && selectedPart.id === partData.id) {
      const updatedPart = {
        ...updatedData,
        id: partData.id,
        markupPoints: updatedData.markupPoints
      };
      setSelectedPart(updatedPart);
    }

    setEditData(null);
    setModalOpen(false);
    setAlertMessage(`Markup points updated successfully for ${partData.part}`);
    setIsDataAdded(true);
  };

  // Handle deleting markup points
  const handleDeleteMarkupPoint = (itemToDelete) => {
    setFormData(prev => prev.map(part => {
      if (part.id === itemToDelete.id) {
        const updatedMarkupPoints = part.markupPoints.filter(
          point => !(point.position === itemToDelete.position && point.category === itemToDelete.category)
        );
        return {
          ...part,
          markupPoints: updatedMarkupPoints
        };
      }
      return part;
    }));

    // Clear selected part if the deleted point was selected
    if (selectedPart && 
        selectedPart.id === itemToDelete.id && 
        selectedPart.selectedMarkupPoint?.[0]?.position === itemToDelete.position &&
        selectedPart.selectedMarkupPoint?.[0]?.category === itemToDelete.category) {
      setSelectedPart(null);
    }
    
    setAlertMessage(`Markup point #${itemToDelete.position} deleted successfully`);
    setIsDataAdded(true);
  };

  // Handle closing modal with proper cleanup
  const handleCloseModal = (resetFn) => {
    if (resetFn) resetFn();
    setModalOpen(false);
    setEditData(null);
  };

  // Handle filter functionality (you can implement actual filtering logic here)
  const handleFilterClick = () => {
    console.log("Filter Clicked - Current search:", search);
    // Add your filter logic here
    // For example, you could filter partsData based on search term
  };

  // Filter parts data based on search term
  const filteredPartsData = partsData.filter(part => {
    if (!search) return true;
    
    const searchLower = search.toLowerCase();
    return (
      part.part.toLowerCase().includes(searchLower) ||
      part.model.toLowerCase().includes(searchLower) ||
      part.variant.toLowerCase().includes(searchLower) ||
      part.side.toLowerCase().includes(searchLower) ||
      part.markupPoints.some(point => 
        point.category.toLowerCase().includes(searchLower) ||
        point.position.toString().includes(searchLower)
      )
    );
  });

  return (
    <>
      <HeaderWithSearchActions
        search={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder={HDR_CONST?.SRRH_BX_PH}
        filterIcon={filterLatest}
        onFilterClick={handleFilterClick}
        filterLabel={HDR_CONST?.FTR_BTN_LBL}
        onAddClick={() => setModalOpen(true)}
        addLabel={HDR_CONST?.ADD_BTN_LBL}
      />

      <AddPartModal
        open={modalOpen}
        onClose={handleCloseModal}
        onNext={onNext}
        editData={editData}
        onEditSubmit={handleEditSubmit}
      />

      <Alert
        open={isDataAdded}
        onClose={() => setIsDataAdded(false)}
        title="Successful"
        message={alertMessage}
        severity="success"
        sx={{
          backgroundColor: "#308242",
          color: "white",
          "& .MuiAlert-icon": {
            color: "white",
          },
        }}
      />

      <ContentContainer>
        <PartModelTable
          setSelectedPart={setSelectedPart}
          partsData={filteredPartsData}
          onEditMarkupPoint={handleEditMarkupPoint}
          onDeleteMarkupPoint={handleDeleteMarkupPoint}
          setPartsData={setFormData}
        />
        <PartVw selectedPart={selectedPart} />
      </ContentContainer>
    </>
  );
};

export default Annotations;