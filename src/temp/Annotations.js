import { useState } from "react";
import filterLatest from "../../assets/icons/filterLatest.svg";
import { HDR_CONST } from "./components/constants";
import HeaderWithSearchActions from "./components/HdrWithSrchActions";
import AddPartModal from "./components/AddPartMdl";
import PartModelTable from "./components/PartMdlTbl";
import PartVw from "./components/PartVw";
import Alert from "../../components/Alert";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";
import {ContentContainer} from "./styles/AnnotationStyles";

const Annotations = () => {
  const [isDataAdded,setIsDataAdded] = useState(false)
  const [partsData,setFormData] = useState([
    {
      id: 1,
      part: 'Door',
      model: 'YGB',
      variant: 'LxI',
      side: 'Right Hand',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      markupPoints: [
        {
          x: 50,
          y: 80,
          position: 11,
          category: 'All',
        },
        {
          x: 150,
          y: 120,
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
          x: 75,
          y: 60,
          position: 13,
          category: 'LD Gap',
        },
        {
          x: 200,
          y: 180,
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
          x: 120,
          y: 90,
          position: 15,
          category: 'Supplier Part',
        },
        {
          x: 180,
          y: 150,
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
          x: 90,
          y: 110,
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
          x: 60,
          y: 70,
          position: 18,
          category: 'CMM',
        },
        {
          x: 140,
          y: 140,
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
          x: 100,
          y: 50,
          position: 20,
          category: 'CMM',
        },
        {
          x: 80,
          y: 160,
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
          x: 130,
          y: 100,
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
          x: 110,
          y: 80,
          position: 23,
          category: 'All',
        },
        {
          x: 170,
          y: 120,
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
          x: 85,
          y: 95,
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
          x: 95,
          y: 75,
          position: 26,
          category: 'LD Gap',
        },
        {
          x: 160,
          y: 130,
          position: 27,
          category: 'LD Gap-All',
        }
      ]
    }
  ]);

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    type: '',
    data: null,
    message: ''
  });

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const onNext = (partData) => {
    const randomId = Math.floor(Math.random() * 1_000_000)+ 101;
    const newPartData = { ...partData, id: randomId };
    setFormData((prev)=>[...prev,newPartData])
    setModalOpen(false);
    setIsDataAdded(true)
  }

  const handleEdit = (itemData) => {
    const partData = partsData.find(part => part.id === itemData.id);
    if (partData) {
      setEditingData(partData);
      setModalOpen(true);
    }
  };

  const handleEditSubmit = (updatedData) => {
    setConfirmDialog({
      open: true,
      type: 'edit',
      data: updatedData,
      message: 'Are you sure you want to edit this part?'
    });
  };

  const handleDelete = (itemData) => {
    setConfirmDialog({
      open: true,
      type: 'delete',
      data: itemData,
      message: 'Are you sure you want to delete this point?'
    });
  };

  const handleConfirmAction = () => {
    if (confirmDialog.type === 'edit') {
      setFormData(prev => prev.map(part => 
        part.id === confirmDialog.data.id ? confirmDialog.data : part
      ));
      setModalOpen(false);
      setEditingData(null);
      setIsDataAdded(true);
    } else if (confirmDialog.type === 'delete') {
      const { id, position, category } = confirmDialog.data;
      setFormData(prev => prev.map(part => {
        if (part.id === id) {
          return {
            ...part,
            markupPoints: part.markupPoints.filter(point => 
              !(point.position === position && point.category === category)
            )
          };
        }
        return part;
      }));
    }
    
    setConfirmDialog({ open: false, type: '', data: null, message: '' });
  };

  const handleCancelAction = () => {
    setConfirmDialog({ open: false, type: '', data: null, message: '' });
  };

  return (
    <>
      <HeaderWithSearchActions
        search={search}
        onSearchChange={(e) => setSearch(e.target.value)}
        searchPlaceholder={HDR_CONST?.SRRH_BX_PH}
        filterIcon={filterLatest}
        onFilterClick={() => console.log("Filter Clicked")}
        filterLabel={HDR_CONST?.FTR_BTN_LBL}
        onAddClick={() => {
          setEditingData(null);
          setModalOpen(true);
        }}
        addLabel={HDR_CONST?.ADD_BTN_LBL}
      />

      <AddPartModal
        open={modalOpen}
        onClose={(fn) => {
          fn();
          setModalOpen(false);
          setEditingData(null);
        }}
        onNext={editingData ? handleEditSubmit : onNext}
        editingData={editingData}
      />

      <Alert
        open={isDataAdded}
        onClose={() => setIsDataAdded(false)}
        title="Successful"
        message={"Image Uploaded for SIZE STOPPER 2 UP/DN"}
        severity={"success"}
        sx={{
          backgroundColor: "#308242",
          color: "white",
          "& .MuiAlert-icon": {
            color: "white",
          },
        }}
      />

      <Dialog
        open={confirmDialog.open}
        onClose={handleCancelAction}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelAction}>No</Button>
          <Button onClick={handleConfirmAction} variant="contained" color="primary">
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      <ContentContainer>
        <PartModelTable
          setSelectedPart={setSelectedPart}
          partsData={partsData}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        <PartVw selectedPart={selectedPart} />
      </ContentContainer>
    </>
  );
};

export default Annotations;