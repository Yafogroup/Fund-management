import React, {useState, useMemo, useEffect} from "react";
import {
    Button,
    Alert,
    Card,
    CardHeader,
    CardBody,
    Input,
    IconButton,
    Typography,
    DialogHeader,
    DialogBody,
    Dialog,
    Textarea,
    DialogFooter,
    Select,
    Option,
    Tooltip,
} from "@material-tailwind/react";
import ItemMemo from "@/widgets/components/item_memo.jsx";
import {EyeIcon, XMarkIcon} from "@heroicons/react/24/solid/index.js";
import memoService from "@/api/memoService.jsx";
import {useNotification} from "@/context/notificationProvider.jsx";
import messages from "@/const/msg.jsx";
import {MagnifyingGlassIcon} from "@heroicons/react/24/outline/index.js";
import {Pagination} from "@/widgets/components/pagination.jsx";
import DatePicker from "react-datepicker";

export function Memo() {

    const {showNotification} = useNotification();
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

    const [importFile, setImportFile] = useState(null);

    const fileInput = React.useRef();

    const imageInputRef = React.useRef();

    const handleImageSelect = () => {
        if (imageInputRef.current) {
            imageInputRef.current.click();
        }
    };

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

    useEffect(() => {
        handleImport();
    }, [importFile]);

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
        const {name, value, files} = e.target;
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

    const onExport = async () => {
        const result = await memoService.export();
        const filePath = result.data.data.file_path;
        const fileName = result.data.data.file_name;

        try {
            const response = await fetch(filePath); // Replace with your API endpoint
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName
            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading the file:', error);
        }
    }

    const onImport = () => {
        fileInput.current.click()
    }

    const handleImport = async () => {
        try {
            if (importFile) {
                const data = new FormData();
                data.append("import_file", importFile);
                const result = await memoService.import(data);
                showNotification("Memos are imported successfully.", "green");
                setPage(1);
            }
        } catch (e) {
            console.error('Import failed', e);
        }
    }

    return (
        <div className="p-6 bg-dark min-h-screen">
            <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6 ml-6">
                <div className="md:mr-4 md:w-56 bg-cBlue3 rounded-lg">
                    <Input
                        label="Search..."
                        className="border-none "
                        icon={<MagnifyingGlassIcon className="h-5 w-5"/>}
                        value={search}
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
                        className="w-full px-3 py-2 bg-cBlue3 rounded-md focus:outline-none text-sm text-gray-300"
                    />
                </div>

                <div className="w-full md:w-1/6">
                    <label className="text-sm text-gray-700 mb-1 block">End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onClick={(e) => e.currentTarget.showPicker()}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 bg-cBlue3 rounded-md focus:outline-none text-sm text-gray-300"
                    />
                </div>

                <div className="w-full md:w-1/4 text-right flex-1 mr-7">
                    <Button
                        className="bg-gradient-to-tr from-[#0023af] via-[#006ec1] to-[#00a0ce]"
                        color="blue"
                        onClick={() => handleNew()}
                    >
                        Add New
                    </Button>
                    <Button
                        variant="outlined"
                        className="ml-2"
                        color="white"
                        onClick={() => onExport()}
                    >
                        Export
                    </Button>
                    <Button
                        variant="outlined"
                        color="white"
                        className="ml-2"
                        onClick={() => onImport()}
                    >
                        Import
                    </Button>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-6 p-6 bg-dark">
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

            <div className="mt-8 flex justify-end pr-10">
                <Pagination
                    page={pageTotal}
                    active={page}
                    onPageChange={(p) => {
                        setPage(p);
                    }}
                />
                <div className="w-40">
                    <Select label="" value={pageCount}
                            onChange={(e) => {
                                setPage(1);
                                setPageCount(e);
                            }}
                            labelProps={{
                                // kill the notch lines + white patch behind the label
                                className:
                                    "before:!border-0 after:!border-0 " +    // no borders on the pseudo parts
                                    "before:!bg-transparent after:!bg-transparent"
                            }}
                            className="text-white bg-cBlue3 focus:outline-none border-none !border-t-transparent focus:!border-t-transparent data-[open=true]:!border-t-transparent"
                    >
                        <Option value="8">8/Page</Option>
                        <Option value="10">10/Page</Option>
                        <Option value="12">12/Page</Option>
                        <Option value="20">30/Page</Option>
                    </Select>
                </div>
            </div>


            <Dialog open={viewModalOpen} handler={() => setViewModalOpen(false)} size="md">
                <div className="flex justify-between items-center px-4 pt-4">
                    <DialogHeader>{selectedMemo?.title}</DialogHeader>
                    <IconButton variant="text" onClick={() => setViewModalOpen(false)}>
                        <div className="w-[32px] h-[32px] rounded-full bg-[#687992] text-white p-1">
                            <XMarkIcon className=""/>
                        </div>
                    </IconButton>
                </div>
                <DialogBody className="px-6 pb-4 space-y-4">
                    <div className="overflow-y-auto px-2 flex-row flex">
                        {selectedMemo?.image && (
                            <img
                                src={selectedMemo.image}
                                alt="Memo"
                                className="object-cover rounded-lg w-1/3 mr-10"
                            />
                        )}
                        <p className="text-gray-800 flex-1">
                            {selectedMemo?.content}
                        </p>
                    </div>
                </DialogBody>
            </Dialog>

            <Dialog open={editModalOpen} handler={() => setEditModalOpen(false)} size="md"
                    className="bg-opacity-80 bg-[#4b5461] text-white rounded-xl shadow-xl">
                <div className="flex justify-between items-center px-4 pt-4">
                    <DialogHeader className="text-white">{selectedMemo ? "Edit Memo" : "Create Memo"}</DialogHeader>
                    <IconButton variant="text" onClick={() => setEditModalOpen(false)}>
                        <XMarkIcon className="w-6 h-6"/>
                    </IconButton>
                </div>
                <DialogBody className="px-6 pb-4 space-y-4">
                    <div className="bg-cBlue3 rounded-lg">
                        <Input
                            name="title"
                            placeholder="Title"
                            value={form.title}
                            onChange={handleFormChange}
                            className="border-none text-white "
                        />
                    </div>
                    <div className="bg-cBlue3 rounded-lg">
                        <Textarea
                            name="content"
                            placeholder="Content"
                            className="w-full p-2 border-none rounded-md resize-none text-white"
                            value={form.content}
                            onChange={handleFormChange}
                        />
                    </div>
                    <div className="flex flex-row">
                        <Button
                            variant="outlined"
                            color="white"
                            onClick={handleImageSelect}
                            className="flex items-center gap-2 text-gray-200 border-2 border-gray-500 rounded-lg h-[40px] ml-auto"
                        >
                            <span className="text-lg">+</span> Choose image
                        </Button>
                    </div>
                </DialogBody>
                <DialogFooter>
                    <Button variant="outlined" color="gray" onClick={() => setEditModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit}
                            className="ml-2 bg-gradient-to-tr from-[#0023af] via-[#006ec1] to-[#00a0ce]">
                        {selectedMemo ? "Update" : "Create"}
                    </Button>
                </DialogFooter>
            </Dialog>

            <Dialog open={deleteModalOpen} handler={() => setDeleteModalOpen(false)} size="sm"
                    className="bg-opacity-60 bg-[#2c3040] text-white rounded-xl shadow-xl">
                <DialogHeader
                    className="text-sm font-semibold text-gray-200 border-b border-gray-700">Confirm Deletion
                </DialogHeader>
                <DialogBody className="text-white">
                    Are you sure you want to delete this toke type? This action cannot be undone.
                </DialogBody>
                <DialogFooter>
                    <Button className="text-gray-300 hover:text-white mr-4"
                            onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
                    <Button className="bg-gradient-to-tr from-[#0023af] via-[#006ec1] to-[#00a0ce]"
                            onClick={() => handleDelete()}>Delete</Button>
                </DialogFooter>
            </Dialog>
            <input
                ref={fileInput}
                type="file"
                style={{display: 'none'}}
                onChange={(e) => {
                    setImportFile(e.target.files[0]);
                }}
            />

            <input
                ref={imageInputRef}
                style={{display: 'none'}}
                type="file"
                name="image"
                onChange={handleFormChange}
                className="ml-auto min-w-[40px]"
            />
        </div>
    );
}

export default Memo;
