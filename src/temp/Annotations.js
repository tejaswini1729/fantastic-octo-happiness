// EditData
// {
//     "partData": {
//         "img_pos_id": "17598201-f0f9-4319-b6b6-34a1948abb94",
//         "position": "11",
//         "category": "All",
//         "x": 50,
//         "y": 80,
//         "id": "669c4bb3-2f34-4706-b63b-e763a5d9f2a2",
//         "model": "YGB",
//         "variant": "LxI",
//         "part": "Door",
//         "side": "Right Hand",
//         "imageUrl": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
//         "created_by": "system",
//         "created_at": "2025-07-16"
//     },
//     "markupPoint": {
//         "img_pos_id": "17598201-f0f9-4319-b6b6-34a1948abb94",
//         "position": "11",
//         "category": "All",
//         "x": 50,
//         "y": 80
//     },
//     "originalPosition": "11",
//     "originalCategory": "All"
// }
//existingPartsData
// [
//     {
//         "exists": true,
//         "id": "669c4bb3-2f34-4706-b63b-e763a5d9f2a2",
//         "message": "Part already exists",
//         "part": "Door",
//         "model": "YGB",
//         "variant": "LxI",
//         "side": "Right Hand",
//         "imageUrl": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
//         "imageName": "",
//         "imageSize": 100,
//         "s3_bucket_name": "",
//         "s3_object_key": "",
//         "markupPoints": [
//             {
//                 "img_pos_id": "17598201-f0f9-4319-b6b6-34a1948abb94",
//                 "position": "11",
//                 "category": "All",
//                 "x": 50,
//                 "y": 80
//             },
//             {
//                 "img_pos_id": "51895535-8e0c-4455-84ef-39dcb4016f80",
//                 "position": "12",
//                 "category": "All-1",
//                 "x": 150,
//                 "y": 120
//             }
//         ],
//         "positions_count": 2
//     }
// ]

import { useEffect, useState, useMemo } from "react";
import filterLatest from "../../assets/icons/filterLatest.svg";
import { HDR_CONST } from "./components/constants";
import HeaderWithSearchActions from "./components/HdrWithSrchActions";
import AddPartModal from "./components/AddPartMdl";
import PartModelTable from "./components/PartMdlTbl";
import PartVw from "./components/PartVw";
import Alert from "../../components/Alert";
import { ContentContainer } from "./styles/AnnotationStyles";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";
import { getAllAnnotData, getAnnotFilterData, checkPartExists } from "../../axios/getRequest";
import { updateAnnotMarkupPoint } from "../../axios/putRequest";
import { deleteMarkupPint } from "../../axios/deleteRequest";
import useDebounce from "../../hooks/useDebounce";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

const Annotations = () => {
  const queryClient = useQueryClient();
  const intialDataAdded = {status:false,message:"",messageStatus:""}
  const [isDataAdded, setIsDataAdded] = useState(intialDataAdded);

  const [shopId, setShopId] = useState(1)
  const limit = 2
  const [partsData, setFormData] = useState([
    {
      id: 1,
      part: "Door",
      model: "YGB",
      variant: "LxI",
      side: "Right Hand",
      imageUrl:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
      markupPoints: [
        {
          x: 50,
          y: 80,
          position: 11,
          category: "All",
        },
        {
          x: 150,
          y: 120,
          position: 12,
          category: "All-1",
        },
      ],
    },
    {
      id: 2,
      part: "Door",
      model: "YGB",
      variant: "LxI",
      side: "Right Hand",
      imageUrl:
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
      markupPoints: [
        {
          x: 75,
          y: 60,
          position: 13,
          category: "LD Gap",
        },
        {
          x: 200,
          y: 180,
          position: 14,
          category: "All",
        },
      ],
    },
    {
      id: 3,
      part: "Door",
      model: "YGB",
      variant: "LxI",
      side: "Right Hand",
      imageUrl:
        "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop",
      markupPoints: [
        {
          x: 120,
          y: 90,
          position: 15,
          category: "Supplier Part",
        },
        {
          x: 180,
          y: 150,
          position: 16,
          category: "All",
        },
      ],
    },
    {
      id: 4,
      part: "Door",
      model: "YGB",
      variant: "VxI",
      side: "Right Hand",
      imageUrl:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
      markupPoints: [
        {
          x: 90,
          y: 110,
          position: 17,
          category: "All",
        },
      ],
    },
    {
      id: 5,
      part: "Door",
      model: "YGB",
      variant: "VxI",
      side: "Right Hand",
      imageUrl:
        "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop",
      markupPoints: [
        {
          x: 60,
          y: 70,
          position: 18,
          category: "CMM",
        },
        {
          x: 140,
          y: 140,
          position: 19,
          category: "All",
        },
      ],
    },
    {
      id: 6,
      part: "Door",
      model: "YGB",
      variant: "VxI",
      side: "Right Hand",
      imageUrl:
        "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop",
      markupPoints: [
        {
          x: 100,
          y: 50,
          position: 20,
          category: "CMM",
        },
        {
          x: 80,
          y: 160,
          position: 21,
          category: "All",
        },
      ],
    },
    {
      id: 7,
      part: "Door",
      model: "YGB",
      variant: "ZxI",
      side: "Right Hand",
      imageUrl:
        "https://images.unsplash.com/photo-1493663284031-b7e3aaa4c4ae?w=400&h=300&fit=crop",
      markupPoints: [
        {
          x: 130,
          y: 100,
          position: 22,
          category: "CMM",
        },
      ],
    },
    {
      id: 8,
      part: "Door",
      model: "YGB",
      variant: "ZxI",
      side: "Right Hand",
      category: "All",
      imageUrl:
        "https://images.unsplash.com/photo-1605711285791-0219e80e43a3?w=400&h=300&fit=crop",
      markupPoints: [
        {
          x: 110,
          y: 80,
          position: 23,
          category: "All",
        },
        {
          x: 170,
          y: 120,
          position: 24,
          category: "All - testing",
        },
      ],
    },
    {
      id: 9,
      part: "Door",
      model: "YGB",
      variant: "ZxI",
      side: "Right Hand",
      imageUrl:
        "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop",
      markupPoints: [
        {
          x: 85,
          y: 95,
          position: 25,
          category: "All",
        },
      ],
    },
    {
      id: 10,
      part: "Door",
      model: "YGB",
      variant: "ZxI",
      side: "Right Hand",
      imageUrl:
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
      markupPoints: [
        {
          x: 95,
          y: 75,
          position: 26,
          category: "LD Gap",
        },
        {
          x: 160,
          y: 130,
          position: 27,
          category: "LD Gap-All",
        },
      ],
    },
  ]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);
  // Search functionality States
  const [search, setSearch] = useState("");
  const debouncedSearchTerm = useDebounce(search, 500); 
  // Edit functionality states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [editConfirmOpen, setEditConfirmOpen] = useState(false);
  const [pendingEditData, setPendingEditData] = useState(null);

  // Delete functionality states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteData, setDeleteData] = useState(null);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const onNext = (partData) => {
    // const randomId = Math.floor(Math.random() * 1_000_000) + 101;
    // const newPartData = { ...partData, id: randomId };
    // setFormData((prev) => [...prev, newPartData]);
    setModalOpen(false);
    // Need to implement this
    // setIsDataAdded(true);
  };

  // Edit functionality handlers
  const handleEdit = (imgId, id) => {
    const partToEdit = pagedItems.find((part) => part.img_pos_id === imgId && part.id === id);
    const markupPointToEdit = {
      img_pos_id : partToEdit?.img_pos_id,
      position : partToEdit?.position,
      category : partToEdit?.category,
      x : partToEdit?.x,
      y : partToEdit?.y
    }
    if (partToEdit && markupPointToEdit) {
      setEditData({
        partData: partToEdit,
        markupPoint: markupPointToEdit,
        originalPosition: partToEdit?.position,
        originalCategory: partToEdit?.category,
      });
      setEditModalOpen(true);
    }
  };

  const onEditNext = (updatedPartData) => {
    setPendingEditData(updatedPartData);
    setEditModalOpen(false);
    setEditConfirmOpen(true);
  };

  const confirmEdit = () => {
    if (pendingEditData && editData) {
      mutationUpdatePosition.mutate({ shopId:12, payload:pendingEditData });
    }
  };

  const cancelEdit = () => {
    setEditConfirmOpen(false);
    setPendingEditData(null);
  };

  // Delete functionality handlers
  const handleDelete = (img_pos_id, id) => {
    setDeleteData({ img_pos_id, id });
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (deleteData) {
      //call Mutation
      if(deleteData){
         mutationDeletePosition.mutate({ shopId:shopId, id: deleteData?.id, img_pos_id: deleteData?.img_pos_id });
      }
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setDeleteData(null);
  };

  useEffect(()=>{
    console.log("Checking is data added",isDataAdded)
  },[isDataAdded?.status])

  // API Integration Part
  // List API with Pagination
   const {
    data: annotPPData,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    isSuccess,
    isLoading: isInfiniteLoading,
  } = useInfiniteQuery({
    queryKey: ["annot_pp", shopId, debouncedSearchTerm],
    queryFn: ({ pageParam = 1 }) => getAllAnnotData(pageParam, limit, shopId, debouncedSearchTerm),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      // Check if the last page has more data
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
  });
  const pagedItems = annotPPData?.pages?.flatMap((page) => page?.data?.body?.data) || [];
  //Filter Data
   const {
    data: filterData,
    refetch: refetchFilterData,
    status: filterApiQueryStatus,
  } = useQuery({
    queryKey: ["filter"], 
    queryFn: () => getAnnotFilterData(12), 
    keepPreviousData: true, // Optional: Keeps previous data while new data is being fetched
  });
  //Is Data Exists
  const {
      data: isPartExists,
      isLoading,
      isError,
      error,
      refetch: refetchIsPartExists,
      status: isPartExistsQueryStatus,
    } = useQuery({
      queryKey: ["partExists", shopId, editData?.partData?.part, editData?.partData?.model, editData?.partData?.variant, editData?.partData?.side ], 
      queryFn: () => checkPartExists(shopId, editData?.partData?.part, editData?.partData?.model, editData?.partData?.variant, editData?.partData?.side),
      enabled:
      !!shopId &&
      !!editData?.partData?.part &&
      !!editData?.partData?.model &&
      !!editData?.partData?.variant &&
      !!editData?.partData?.side,
      keepPreviousData: true, // Optional: Keeps previous data while new data is being fetched
    });
    const existingPartsData = useMemo(() => {
    if (
      isPartExistsQueryStatus === "success" &&
      isPartExists?.data?.body
    ) {
      return isPartExists.data.body;
    }
    return {};
  }, [isPartExistsQueryStatus, isPartExists]);
  // Mutation for updating markup point
  // This mutation will be used to update the markup point when the user confirms the edit
  const mutationUpdatePosition = useMutation({
    mutationFn: ({ shopId, payload }) => updateAnnotMarkupPoint(shopId, payload), // Set the mutation function here
    onSuccess: (result) => {
      if (result) {
        if (result?.data?.statusCode === 200) {
          queryClient.invalidateQueries({ queryKey: ["annot_pp"] });
          setEditConfirmOpen(false);
          setPendingEditData(null);
          setEditData(null);
          setIsDataAdded({status:true,message:result?.data?.message,messageStatus:"success"});
        }
      }
    },
    onError: (error) => {
          console.log("Checking error123")
          setIsDataAdded({status:true,message:result?.data?.message,messageStatus:"error"});

      // setModalState({ ...modalState, saveConfirmModal: false });
      // setVerticalModalState({
      //   ...verticalModalState,
      //   isEditBOMModal: true,
      // });
      // showErrorToast(error?.response?.data?.message);
    },
  });


  // Mutation for deleting markup point
  const mutationDeletePosition = useMutation({
    mutationFn: ({ shopId, id, img_pos_id }) => deleteMarkupPint(shopId,id,img_pos_id), // Set the mutation function here
    onSuccess: (result) => {
      if (result) {
        if (result?.data?.statusCode === 200) {
          queryClient.invalidateQueries({ queryKey: ["annot_pp"] });
          setDeleteConfirmOpen(false);
          setDeleteData(null);
          setIsDataAdded({status:true,message:result?.data?.message,messageStatus:"success"});
        }
      }
    },
    onError: (error) => {
      console.log("Checking error124")
      setIsDataAdded({status:true,message:result?.data?.message,messageStatus:"error"});
      // setModalState({ ...modalState, rmvConfirmModal: false });
      // showErrorToast(error?.response?.data?.message);
    },
  });



  return (
    <>
      <HeaderWithSearchActions
        search={search}
        onSearchChange={(e) => setSearch(e.target.value)}
        searchPlaceholder={HDR_CONST?.SRRH_BX_PH}
        filterIcon={filterLatest}
        onFilterClick={() => console.log("Filter Clicked")}
        filterLabel={HDR_CONST?.FTR_BTN_LBL}
        onAddClick={() => setModalOpen(true)}
        addLabel={HDR_CONST?.ADD_BTN_LBL}
      />

      <AddPartModal
        open={modalOpen}
        onClose={(fn) => {
          fn();
          setModalOpen(false);
        }}
        onNext={onNext}
        existingPartsData={existingPartsData}
        dropdownData = {filterData?.data?.filters}
      />

      <AddPartModal
        open={editModalOpen}
        onClose={(fn) => {
          fn();
          setEditModalOpen(false);
          setEditData(null);
        }}
        onNext={onEditNext}
        editMode={true}
        editData={editData}
        existingPartsData={existingPartsData}
        dropdownData = {filterData?.data?.filters}
      />

      <Alert
        open={isDataAdded?.status===true}
        onClose={() => setIsDataAdded(intialDataAdded)}
        title={isDataAdded?.messageStatus==="success"?"Successful":"Error13256465645"}
        message={isDataAdded?.message}
        severity={isDataAdded?.messageStatus}
        sx={{
          backgroundColor: isDataAdded?.messageStatus==="success"?"#308242":"purple",
          color: "white",
          "& .MuiAlert-icon": {
            color: "white",
          },
        }}
      />

      {/* Edit Confirmation Dialog */}
      <Dialog open={editConfirmOpen} onClose={cancelEdit}>
        <DialogTitle>Confirm Edit</DialogTitle>
        <DialogContent>
          <Typography>Do you really want to edit this markup point?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelEdit}>No</Button>
          <Button onClick={confirmEdit} variant="contained">
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={cancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Do you really want to delete this markup point?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete}>No</Button>
          <Button onClick={confirmDelete} variant="contained" color="error">
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      <ContentContainer>
        <PartModelTable
          setSelectedPart={setSelectedPart}
          partsData={pagedItems}
          // partsData={
          //   annotPPData
          //     ? annotPPData.pages.flatMap((page) => page.data) // or page.data.data if your API nests it
          //     : []
          // }
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        <PartVw selectedPart={selectedPart} />
      </ContentContainer>
    </>
  );
};

export default Annotations;