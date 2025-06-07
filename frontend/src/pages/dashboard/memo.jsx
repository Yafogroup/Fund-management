import React, {useState, useMemo, useEffect} from "react";
import {
  Button,
  Alert,
  Card,
  CardHeader,
  CardBody, Input, IconButton, Typography, DialogHeader, DialogBody, Dialog, Textarea, DialogFooter, Select, Option,
} from "@material-tailwind/react";
import ItemMemo from "@/widgets/components/item_memo.jsx";
import {XMarkIcon} from "@heroicons/react/24/solid/index.js";
import memoService from "@/api/memoService.jsx";
import {useNotification} from "@/context/notificationProvider.jsx";
import messages from "@/const/msg.jsx";
import {MagnifyingGlassIcon} from "@heroicons/react/24/outline/index.js";
import {Pagination} from "@/widgets/components/pagination.jsx";

export function Memo() {

  const { showNotification } = useNotification();
  const [memoList, setMemoList] = useState([]);

  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [pageCount, setPageCount] = useState("8");
  const [pageTotal, setPageTotal] = useState(1);
  const [page, setPage] = useState(1);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedMemo, setSelectedMemo] = useState(null);

  const fetchMemos = async () => {
    try {
      const params = {
        offset: (page - 1) * pageCount,
        limit: pageCount,
        search,
        start_date: startDate,
        end_date: endDate,
      };

      const response = await memoService.getMemoList(params);
      const fetched = response.data.data.memo_list;
      const tt = response.data.data.page_count;
      setPageTotal(Math.floor(tt) + 1);
      setMemoList((prev) => (fetched));
    } catch (err) {
      console.error("Failed to fetch memos", err);
    } finally {
    }
  };

  useEffect(() => {
    fetchMemos();
  }, [search, startDate, endDate, page, pageCount]);



  const [form, setForm] = useState({
    title: "",
    content: "",
    image: null,
  });

  const handleView = (memo) => {
    setSelectedMemo(memo);
    setViewModalOpen(true);
  };

  const handleNew = () => {
    setSelectedMemo(null);
    setForm({
      title: "",
      content: "",
      image: null,
    });
    setEditModalOpen(true);
  };

  const handleEdit = (memo = null) => {
    setSelectedMemo(memo);
    setForm({
      title: memo?.title || "",
      content: memo?.content || "",
      image: null,
    });
    setEditModalOpen(true);
  };

  const handleDelete = async () => {
    {
      await memoService.deleteMemo(selectedMemo.uid);
      fetchMemos();
      showNotification(messages.memo_deleted, 'green');
      setDeleteModalOpen(false);
    }
  }

  const confirmDeleteMemo = (memo = null) => {
    setSelectedMemo(memo);
    setDeleteModalOpen(true);
  }

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("content", form.content);
    if (form.image) formData.append("image", form.image);

    try {
      if (selectedMemo) {
        formData.append("memo_uid", selectedMemo.uid);
        await memoService.updateMemo(formData);
      } else {
        await memoService.addMemo(formData);
      }
      setEditModalOpen(false);
      fetchMemos();
      showNotification(messages.memo_saved, 'green');
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  return (
      <div className="p-6 bg-dark min-h-screen">
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6 ml-6">
          <div className="w-full md:w-1/4">
            <Input
                label="Search"
                value={search}
                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="w-full md:w-1/6">
            <label className="text-sm text-gray-700 mb-1 block">Start Date</label>
            <input
                type="date"
                value={startDate}
                onClick={(e) => e.currentTarget.showPicker()}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-dark text-lBLue"
            />
          </div>

          <div className="w-full md:w-1/6">
            <label className="text-sm text-gray-700 mb-1 block">End Date</label>
            <input
                type="date"
                value={endDate}
                onClick={(e) => e.currentTarget.showPicker()}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-dark text-lBLue"
            />
          </div>
          <div className="w-40">
            <Select label="Select Page Count" value={pageCount}
                    onChange={(e) => setPageCount(e)}
                    size="lg" className="text-lBLue text-sm"
            >
              <Option value="8">8</Option>
              <Option value="10">10</Option>
              <Option value="12">12</Option>
              <Option value="20">30</Option>
            </Select>
          </div>
          <div className="w-full md:w-1/4 text-right flex-1 mr-7">
            <Button
                variant="filled"
                color="blue"
                onClick={() => handleNew()}
            >
              Add New
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 p-6 bg-dark">
          {
            memoList.map((memo, index) => (
                <ItemMemo
                    memo={memo}
                    key={index}
                    onView={() => handleView(memo)}
                    onEdit={() => handleEdit(memo)}
                    onDelete={() => confirmDeleteMemo(memo)}
                />
            ))
          }
        </div>

        <div className="mt-8 flex justify-center">
          <Pagination
            page={pageTotal}
            onPageChange={(p) => {
              setPage(p);
            }}
          />
        </div>


        <Dialog open={viewModalOpen} handler={() => setViewModalOpen(false)} size="lg">
          <div className="flex justify-between items-center px-4 pt-4">
            <DialogHeader>{selectedMemo?.title}</DialogHeader>
            <IconButton variant="text" onClick={() => setViewModalOpen(false)}>
              <XMarkIcon className="w-6 h-6" />
            </IconButton>
          </div>
          <DialogBody className="px-6 pb-4 space-y-4">
            <div className="max-h-[80vh] overflow-y-auto px-4">
              {selectedMemo?.image && (
                  <img
                      src={selectedMemo.image}
                      alt="Memo"
                      className="max-w-full rounded-lg"
                  />
              )}
              <p className="text-gray-800 whitespace-pre-wrap">
                {selectedMemo?.content}
              </p>
            </div>
          </DialogBody>
        </Dialog>

        <Dialog open={editModalOpen} handler={() => setEditModalOpen(false)} size="lg">
          <div className="flex justify-between items-center px-4 pt-4">
            <DialogHeader>{selectedMemo ? "Edit Memo" : "Create Memo"}</DialogHeader>
            <IconButton variant="text" onClick={() => setEditModalOpen(false)}>
              <XMarkIcon className="w-6 h-6" />
            </IconButton>
          </div>
          <DialogBody className="px-6 pb-4 space-y-4">
            <Input
                label="Title"
                name="title"
                value={form.title}
                onChange={handleFormChange}
            />
            <Textarea
                label="Content"
                name="content"
                className="w-full h-60 p-2 border border-gray-300 rounded-md resize-none"
                value={form.content}
                onChange={handleFormChange}
            />
            <Input
                label="Image"
                type="file"
                name="image"
                onChange={handleFormChange}
            />
          </DialogBody>
          <DialogFooter>
            <Button variant="outlined" color="gray" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button color="blue" onClick={handleSubmit} className="ml-2">
              {selectedMemo ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </Dialog>

        <Dialog open={deleteModalOpen} handler={() => setDeleteModalOpen(false)}>
          <DialogHeader>Confirm Deletion</DialogHeader>
          <DialogBody>
            Are you sure you want to delete this memo? This action cannot be undone.
          </DialogBody>
          <DialogFooter>
            <Button variant="text" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
            <Button color="red" onClick={() => handleDelete()}>Delete</Button>
          </DialogFooter>
        </Dialog>
      </div>
  );
}

export default Memo;
