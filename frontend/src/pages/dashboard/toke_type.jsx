import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Avatar,
    Chip,
    Tooltip,
    Progress,
    Checkbox,
    Input,
    Button,
    Select,
    Option,
    IconButton,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Dialog,
    Textarea
} from "@material-tailwind/react";
import React, {useEffect, useRef, useState} from 'react';
import messages from "@/const/msg.jsx";
import {useNotification} from "@/context/notificationProvider.jsx";
import {EyeIcon, PencilIcon, TrashIcon, XMarkIcon} from "@heroicons/react/24/solid/index.js";
import userService from "@/api/userService.jsx";
import Helper from "@/helper.jsx";
import authService from "@/api/authService.jsx";
import {useNavigate} from "react-router-dom";
import tokenService from "@/api/tokenService.jsx";
import {MagnifyingGlassIcon} from "@heroicons/react/24/outline/index.js";

export function TokenType() {

    const {showNotification} = useNotification();
    const navigate = useNavigate();
    const [tokenTypeList, setTokenTypeList] = useState([]);

    const [search, setSearch] = useState("");
    const [offset, setOffset] = useState(0);
    const limit = 6;
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedTokenType, setSelectedTokenType] = useState(null);

    const [form, setForm] = useState({
        uid: 0,
        name: "",
    });


    const headers = [
        'No', 'Name', ''
    ]

    const fetchData = async (reset = false) => {
        setLoading(true);
        try {
            const params = {
                offset: reset ? 0 : offset,
                limit,
                search,
            };
            const response = await tokenService.getTokenType(params);
            const fetched = response.data.data.token_type_list;

            setTokenTypeList((prev) => (reset ? fetched : [...prev, ...fetched]));
            setOffset((prev) => (reset ? limit : prev + limit));
            setHasMore(fetched.length === limit);
        } catch (err) {
            showNotification("Failed to fetch token types", 'red');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(true);
    }, [search]);

    const onEdit = (token_type) => {
        setSelectedTokenType(token_type);
        setForm({
            uid: token_type?.uid || 0,
            name: token_type?.name || "",
        });
        setEditModalOpen(true);
    }

    const onDelete = (token_type) => {
        setSelectedTokenType(token_type);
        setDeleteModalOpen(true)
    }

    const handleDelete = async () => {
        await tokenService.deleteTokenType(selectedTokenType.uid);
        fetchData(true);
        showNotification(messages.token_type_deleted, 'green');
        setDeleteModalOpen(false);
    }

    const handleSubmit = async () => {
        const formData = new FormData();
        if (form.name === "") {
            showNotification("Enter the valid type name", 'red');
            return;
        }
        formData.append("name", form.name);
        try {
            formData.append("uid", selectedTokenType ? selectedTokenType.uid : 0);
            await tokenService.saveTokenType(formData);
            setEditModalOpen(false);
            fetchData(true);
            showNotification(messages.token_type_saved, 'green');
        } catch (err) {
            console.error("Save failed", err);
        }
    }

    const handleNew = () => {
        setSelectedTokenType(null);
        setForm({
            uid: 0,
            name: "",
        });
        setEditModalOpen(true);
    };

    const handleFormChange = (e) => {
        const {name, value} = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <div className="mb-8 flex flex-col gap-12">
            <Typography variant="h5" color="white">
                Total token types: {tokenTypeList.length}
            </Typography>
            <Card className="bg-sidebar w-[35%]">
                <CardBody className="p-10">
                    <div className="flex items-center gap-5">
                        <div className="md:mr-4 md:w-56 bg-cBlue3 rounded-lg">
                            <Input
                                label="Search..."
                                className="border-none "
                                icon={<MagnifyingGlassIcon className="h-5 w-5"/>}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="mr-6 ml-auto">
                            <Button
                                variant="outlined"
                                color="white"
                                onClick={() => handleNew()}
                            >
                                Add New
                            </Button>
                        </div>
                    </div>
                    <table className="w-full table-auto mt-10">
                        <thead>
                        <tr>
                            {headers.map((el) => (
                                <th
                                    key={el}
                                    className="border-b border-gray-600 py-3 px-5 text-left"
                                >
                                    <Typography
                                        variant="small"
                                        className="text-[16px] text-gray-600"
                                    >
                                        {el}
                                    </Typography>
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {
                            tokenTypeList.length > 0 && tokenTypeList.map(
                                ({uid, name}, idx) => {
                                    const className = `py-3 px-5`;

                                    return (
                                        <tr key={idx}>
                                            <td className={className}>
                                                <Typography className="text-[16px] text-gray-400">
                                                    {idx + 1}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-[16px] text-gray-400">
                                                    {name}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <div className="flex gap-2 z-10 float-right">
                                                    <Button
                                                        size="sm"
                                                        color="green"
                                                        onClick={() => onEdit(tokenTypeList[idx])}>Edit</Button>
                                                    <Button
                                                        size="sm"
                                                        color="red"
                                                        onClick={() => onDelete(tokenTypeList[idx])}>Delete</Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }
                            )
                        }
                        </tbody>
                    </table>
                    {hasMore && (
                        <div className="mt-8 flex justify-center">
                            <Button
                                variant="outlined"
                                color="blue"
                                onClick={() => fetchData()}
                                disabled={loading}
                            >
                                {loading ? "Loading..." : "Load More"}
                            </Button>
                        </div>
                    )}
                    {
                        tokenTypeList.length === 0 &&
                        <Typography className="mt-10 text-center text-xl font-semibold text-blue-gray-600">
                            {messages.empty_content}
                        </Typography>
                    }
                </CardBody>
            </Card>
            <Dialog open={deleteModalOpen} handler={() => setDeleteModalOpen(false)}>
                <DialogHeader>Confirm Deletion</DialogHeader>
                <DialogBody>
                    Are you sure you want to delete this toke type? This action cannot be undone.
                </DialogBody>
                <DialogFooter>
                    <Button variant="text" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
                    <Button color="red" onClick={() => handleDelete()}>Delete</Button>
                </DialogFooter>
            </Dialog>
            <Dialog
                open={editModalOpen} handler={() => setEditModalOpen(false)} size="xs"
                className="bg-opacity-60 bg-[#2c3040] text-white rounded-xl shadow-xl">
                <DialogHeader
                    className="text-sm font-semibold text-gray-200 border-b border-gray-700">
                    {selectedTokenType ? "Edit Token Type" : "Create Token Type"}
                </DialogHeader>
                <DialogBody className="px-6 pb-4 space-y-4">
                    <div className="bg-cBlue3 rounded-lg">
                        <Input
                            placeholder="Token Type"
                            name="name"
                            className="border-none text-gray-400"
                            value={form.name}
                            onChange={handleFormChange}
                        />
                    </div>
                </DialogBody>
                <DialogFooter>
                    <Button color="gray" onClick={() => setEditModalOpen(false)} className="text-gray-300 hover:text-white">
                        Cancel
                    </Button>
                    <Button color="blue" onClick={handleSubmit} className="ml-2 bg-gradient-to-r from-[#0023af] via-[#006ec1] to-[#00a0ce] hover:opacity-90">
                        {selectedTokenType ? "Update" : "Create"}
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
}

export default TokenType;
