import React, {useEffect, useRef, useState} from "react";
import {
    Tabs,
    TabsHeader,
    TabsBody,
    Tab,
    TabPanel,
    Card,
    Input,
    Select,
    Option,
    Chip,
    IconButton,
    Tooltip,
    Typography,
    CardHeader,
    CardBody, Button, DialogHeader, DialogBody, Textarea, DialogFooter, Dialog, Avatar, Spinner,
} from "@material-tailwind/react";
import {
    MagnifyingGlassIcon,
    ArrowsUpDownIcon,
    ArrowPathIcon,
    EllipsisVerticalIcon,
    ChevronUpDownIcon, BookOpenIcon, LockClosedIcon, EllipsisHorizontalCircleIcon, CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import {ChatBubbleLeftEllipsisIcon, Cog6ToothIcon, HomeIcon, XMarkIcon} from "@heroicons/react/24/solid/index.js";
import tokenService from "@/api/tokenService.jsx";
import {useNotification} from "@/context/notificationProvider.jsx";
import PortfolioService from "@/api/portfolioService.jsx";
import messages from "@/const/msg.jsx";
import memoService from "@/api/memoService.jsx";
import portfolioService from "@/api/portfolioService.jsx";
import {PencilIcon, TrashIcon} from "@heroicons/react/24/solid";
import * as sea from "node:sea";
import CompactPrice from "@/widgets/components/compact_price.jsx";
import {Pagination} from "@/widgets/components/pagination.jsx";

const Orders = () => {

    const { showNotification } = useNotification();
    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [portfolioList, setPortfolioList] = useState([]);
    const [offset, setOffset] = useState(0);
    const limit = 100;
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const [pageCount, setPageCount] = useState("8");
    const [pageTotal, setPageTotal] = useState(1);
    const [page, setPage] = useState(1);

    const [tokenList, setTokenList] = useState([]);
    const [allTokenList, setAllTokenList] = useState([]);
    const [selectedTokenIds, setSelectedTokenIds] = useState(localStorage.getItem("userToken") === "" ? [] :
        localStorage.getItem("userToken").split(","));

    const [tokenType, setTokenType] = useState("0");
    const [typeList, setTypeList] = useState([]);
    const [filterTypeList, setFilterTypeList] = useState([]);
    const [status, setStatus] = useState(-1)

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [closeModalOpen, setCloseModalOpen] = useState(false);
    const [selectedPf, setSelectedPf] = useState(null);

    const [realResult, setRealResult] = useState("");
    const [showLoading, setShowLoading] = useState(false);

    const [filterPosition, setFilterPosition] = useState("-1");
    const [sortColumn, setSortColumn] = useState("Date");
    const [sortDirection, setSortDirection] = useState(0);

    const [saving, setSaving] = useState(false);
    const [totalOrder, setTotalOrder] = useState(0);


    const [form, setForm] = useState({
        token_id: 0,
        position_type: 1,
        token_type: 0,
        leverage: 0,
        entry_price: 0,
        quantity: 0,
        trade_type: 0,
        status: 0,
        oracle: 0,
        token_name: "",
        token_symbol: "",
        token_logo: "",
        token_type_name: "",
    });

    const handleFormChange = (e) => {
        const { name, value, files } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }));
    };

    const headers = [
        "No",
        "Open Date",
        "Closed Date",
        "Name",
        "Type",
        "Position",
        "Size",
        "Order Value",
        "Avg. Open",
        "Oracle",
        "Est.P&L",
        "Status",
        "Result",
        "Action",
    ]

    const fetchPortfolioList = async (reset = false) => {
        setLoading(true);
        try {
            const params = {
                offset: (page - 1) * pageCount,
                limit: pageCount,
                search: searchTerm,
                start_date: startDate,
                end_date: endDate,
                toke_type: Number(tokenType),
                status: status,
                position_type: Number(filterPosition),
                sort_column: sortColumn,
                sort_direction: sortDirection,
            };
            setShowLoading(true);
            const response = await portfolioService.getList(params);
            let fetched = response.data.data.portfolio_list;
            setPortfolioList((prev) => (reset ? fetched : [...prev, ...fetched]));
            setTotalOrder(response.data.data.total_order)
            setPageTotal(response.data.data.page_count);
            setShowLoading(false);
        } catch (err) {
            console.error("Failed to fetch portfolio list", err);
        } finally {
            setLoading(false);
        }
    };

    const init = async () => {
        try {
            const params = { offset: 0, limit: 1000, search: "",};
            let response = await tokenService.getTokenType(params);
            const fetched = response.data.data.token_type_list;
            setTypeList(fetched);
            let tt = [{"uid": 0, name: "ALL"}].concat(fetched);
            setFilterTypeList(tt);

            response = await tokenService.getCurrentTokenList();
            let temp = response.data.data.data;
            setAllTokenList(temp);
            temp = temp.filter(item => selectedTokenIds.includes(item.id.toString()));
            setTokenList(temp);

        } catch (err) {
            showNotification("Sever error...", 'red');
        }
    }

    const handleNew = () => {
        setSelectedPf(null);
        setForm({
            token_id: 0,
            position_type: 0,
            token_type: 0,
            leverage: "",
            entry_price: "",
            quantity: "",
            trade_type: 0,
            status: 0,
            oracle: 0,
            token_name: "",
            token_symbol: "",
            token_logo: "",
            token_type_name: "",
        });

        setEditModalOpen(true);
    }

    const handleEdit = (pf) => {
        setSelectedPf(pf);
        setForm({
            token_id: pf.token_id,
            position_type: pf.position_type.toString(),
            token_type: pf.token_type,
            leverage: pf.leverage,
            entry_price: pf.entry_price,
            quantity: pf.quantity,
            trade_type: pf.trade_type,
            status: pf.status,
            token_name: pf.token_name,
            token_symbol: tokenList.filter(t => t.id === pf.token_id)[0].symbol,
            token_logo: tokenList.filter(t => t.id === pf.token_id)[0].logo,
            token_type_name: typeList.filter(t => t.uid === pf.token_type)[0].name,
        });
        setEditModalOpen(true);
    }

    const handleDelete = async () => {
        await portfolioService.delete(selectedPf.uid);
        fetchPortfolioList(true);
        showNotification(messages.portfolio_deleted, 'green');
        setDeleteModalOpen(false);
    }

    const handleClose = (pf) => {
        setSelectedPf(pf);
        setRealResult("");
        setCloseModalOpen(true);
    }

    const handleCloseSubmit = async () => {
        if (selectedPf === null) return;
        if (realResult === "") {
            showNotification(messages.input_profit_loss, "red");
            return;
        }
        const params = {
            'uid': selectedPf.uid,
            'real_result': realResult,
        }
        try {
            const response = await portfolioService.close(params);
            showNotification(messages.portfolio_closed, 'green');
            setCloseModalOpen(false);
            fetchPortfolioList(true);
        } catch (error) {
            console.log(error);
        }

    }

    const handleSubmit = async () => {
        console.log(form);
        const formData = new FormData();

        formData.append("uid", selectedPf == null ? 0 : selectedPf.uid);
        formData.append("token_id", form.token_id);
        formData.append("position_type", form.position_type);
        formData.append("token_type", form.token_type);
        formData.append("leverage", form.leverage === "" ? 0 : form.leverage);
        formData.append("entry_price", form.entry_price === "" ? 0 : form.entry_price);
        formData.append("quantity", form.quantity === "" ? 0 : form.quantity);
        formData.append("trade_type", form.trade_type);
        formData.append("status", form.status);
        formData.append("token_name", form.token_name);
        formData.append("token_symbol", form.token_symbol);

        try {
            setSaving(true);
            const response = await PortfolioService.save(formData);
            setSaving(false);
            if (response.status === 200) {
                showNotification(messages.portfolio_saved, 'green');
                setEditModalOpen(false);
                fetchPortfolioList(true);
            }
        } catch (e) {
            console.log(e);
        }
    }

    const handleApply = async () => {
        fetchPortfolioList(true);
    }

    useEffect(() => {
        init();
    }, [])

    useEffect(() => {
        fetchPortfolioList(true);
    }, [page])

    if (showLoading) {
        return <LoadingScreen />;
    }

    return (
        <div className="p-4 overflow-x-auto scrollbar">
            <Card className="bg-dark">
                <CardBody className="px-0 pt-0">
                    <div className="flex pb-2 text-right justify-end items-center">
                        <Typography variant="small" className="text-[16px] font-medium text-lBLue">Total Order:</Typography>
                        <Typography className="text-[20px] font-bold text-lBLue ml-2">{totalOrder.toLocaleString("en-US", {style:"currency", currency:"USD"})}</Typography>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
                        <div className="w-20">
                            <Select label="Select Page Count" value={pageCount}
                                    onChange={(e) => {
                                        setPage(1);
                                        setPageCount(e);
                                    }}
                                    size="lg" className="text-lBLue text-sm"
                            >
                                <Option value="8">8</Option>
                                <Option value="10">10</Option>
                                <Option value="12">12</Option>
                                <Option value="20">30</Option>
                            </Select>
                        </div>
                        <div className="w-full md:w-1/6 ml-32">
                            <Input
                                label="Search"
                                value={searchTerm}
                                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                                className="text-lBLue"
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="w-40">
                            <label className="text-sm text-gray-700 mb-1 block">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onClick={(e) => e.currentTarget.showPicker()}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-dark text-lBLue"
                            />
                        </div>

                        <div className="w-40">
                            <label className="text-sm text-gray-700 mb-1 block">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onClick={(e) => e.currentTarget.showPicker()}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-dark text-lBLue"
                            />
                        </div>
                        <div className="w-60">
                            <Select label="Select Token Type" className="text-lBLue text-xs"
                                    onChange={(value) => setTokenType(value)}
                                    selected={(element) =>
                                    {
                                        if (element) {
                                            const selectedValue = element.props.value;
                                            // console.log('Selected Value:', selectedValue);
                                            return element.props.name;
                                        }

                                    }
                            }>
                                {filterTypeList.map((option) => (
                                    <Option   key={option.uid} value={option.uid} data-id={option.uid} name={option.name}>
                                        {option.name}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                        <div className="w-40 ml-1">
                            <Select label="Select Position type" className="text-lBLue"
                                    value={filterPosition}
                                    onChange={(value) => setFilterPosition(value)}>
                                <Option value="-1">All</Option>
                                <Option value="0">Spot</Option>
                                <Option value="1">Margin</Option>
                                <Option value="2">Long</Option>
                                <Option value="3">Short</Option>
                            </Select>
                        </div>
                        <div className="w-60 ml-10">
                            <Tabs value={status.toString()}>
                                <TabsHeader>
                                    <Tab value="-1" onClick={() => setStatus(-1)}>
                                        {/*<HomeIcon className="-mt-1 mr-2 inline-block h-5 w-5" />*/}
                                        All
                                    </Tab>
                                    <Tab value="0" onClick={() => setStatus(0)}>
                                        {/*<BookOpenIcon className="-mt-0.5 mr-2 inline-block h-5 w-5" />*/}
                                        Open
                                    </Tab>
                                    <Tab value="1" onClick={() => setStatus(1)}>
                                        {/*<LockClosedIcon className="-mt-1 mr-2 inline-block h-5 w-5" />*/}
                                        Close
                                    </Tab>
                                </TabsHeader>
                            </Tabs>
                        </div>
                        <div className="w-full pr-1 flex-1">
                            <Button
                                variant="filled"
                                color="blue"
                                onClick={() => handleApply()}
                            >
                                Apply
                            </Button>
                        </div>
                        <div className="w-full text-right pr-1 flex-1">
                            <Button
                                variant="outlined"
                                color="blue"
                                onClick={() => handleNew()}
                            >
                                Add New
                            </Button>
                        </div>
                    </div>
                    <table className="w-full min-w-max table-auto text-left">
                        <thead>
                        <tr>
                            {headers.map((el, index) => (
                                <th
                                    key={el}
                                    className="py-5 px-5 text-left cursor-pointer"
                                    onClick={() => {
                                        setSortColumn(el)
                                        setSortDirection((prev) => 1 - prev)
                                    }}
                                >
                                    <Typography
                                        variant="small"
                                        className="text-[16px] font-medium text-lBLue flex"
                                    >
                                        {el} {(index === 1 || index === 6 || index === 9 || index === 11) ? <ArrowsUpDownIcon className="h-5 w-5" /> : ""}
                                    </Typography>
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {portfolioList.map((order, index) => {
                            const order_value = order.entry_price * order.quantity;
                            let est_val = 0;
                            if (order.trade_type === 1) {
                                est_val = order.position_type === 0 ? (order.entry_price - order.oracle) * order.quantity : (order.entry_price - order.oracle) * order.quantity * order.leverage;
                            } else {
                                est_val = order.position_type === 0 ? (order.oracle - order.entry_price) * order.quantity : (order.oracle - order.entry_price) * order.quantity * order.leverage;
                            }

                            let real_result = order.real_result === null ? "" : order.real_result.toLocaleString("en-US", {style:"currency", currency:"USD"});

                            return (
                                <tr key={index}>
                                    <td className="p-4 text-lBLue">{index + 1 + (page - 1) * pageCount}</td>
                                    <td className="p-4 text-lBLue">{order.date}</td>
                                    <td className="p-4 text-lBLue">{order.closed_date === '' ? <span className="text-red-500 ml-4">---</span> : order.closed_date}</td>
                                    <td className="p-4 flex items-center">
                                        <Avatar
                                            src={order.logo}
                                            alt={order.token_name}
                                            size="xs"
                                            variant="circular"
                                            className={`cursor-pointer border-2 border-white mr-2`}
                                        />
                                        <Typography variant="small" className="text-[18px] font-medium text-lBLue mt-1">{order.token_name.length > 8 ? order.token_symbol : order.token_name}</Typography>
                                    </td>
                                    <td className="p-4">
                                        <Typography variant="small" className="text-[18px] font-medium text-lGreen mb-1">{order.token_type_name}</Typography>
                                    </td>
                                    <td className="p-4">
                                        <Typography variant="small" className={`text-[16px] font-medium mb-1 ${order.trade_type === 0 ? "text-lBLue" : "text-red-500"}`}>
                                            {
                                                order.trade_type === 0
                                                    ? (order.position_type === 0 ? "Spot" : "Margin(" + order.leverage.toString() + "X Long)")
                                                    : (order.position_type === 0 ? "Spot" : "Margin(" + order.leverage.toString() + "X Short)")
                                            }
                                        </Typography>
                                    </td>
                                    <td className="p-4">
                                        <Typography variant="small" className="text-[16px] font-medium text-lBLue">{order.quantity.toString() + " " + order.token_symbol}</Typography>
                                    </td>
                                    <td className="p-4">
                                        <Typography variant="small" className="text-[16px] font-medium text-lBLue">{order_value.toLocaleString("en-US", {style:"currency", currency:"USD", minimumFractionDigits: 4})}</Typography>
                                    </td>
                                    <td className="p-4">
                                        {
                                            order.entry_price >= 0.09 ?
                                                <Typography variant="small" className="text-[16px] font-medium text-lBLue">{
                                                    order.entry_price.toLocaleString("en-US", {style:"currency", currency:"USD", minimumFractionDigits: 4})
                                                }</Typography>
                                                :
                                                <CompactPrice
                                                    price={order.entry_price}
                                                />
                                        }
                                    </td>
                                    <td className="p-4">
                                        {
                                            order.oracle >= 0.09 ?
                                                <Typography variant="small" className="text-[16px] font-medium text-lBLue">{
                                                    order.oracle.toLocaleString("en-US", {style:"currency", currency:"USD", minimumFractionDigits: 6})
                                                }</Typography>
                                                :
                                                <CompactPrice
                                                    price={order.oracle}
                                                />
                                        }
                                    </td>
                                    <td className="p-4">
                                        {
                                            order.status === 0 &&
                                            <Typography variant="small" className={`text-[16px] font-medium ${est_val < 0 ? "text-red-500" : "text-lBLue"}`}>
                                                {est_val.toLocaleString("en-US", {style:"currency", currency:"USD"})}
                                            </Typography>
                                        }
                                        {
                                            order.status === 1 &&
                                            <span className="text-red-500 ml-4">---</span>
                                        }
                                    </td>
                                    <td className="p-4">
                                        <Chip
                                            variant="filled"
                                            size="sm"
                                            value={order.status === 0 ? "Open" : "Close"}
                                            color={order.status === 0 ? "green" : "red"}
                                        />
                                    </td>
                                    <td className="p-4">
                                        {real_result !== ""  ? (
                                            <Typography variant="small" className={`text-[16px] font-medium ${order.real_result > 0 ? "text-lBLue" : "text-red-500"}`}>{real_result}</Typography>
                                        ) : (
                                            <span className="text-red-500 ml-4">---</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <IconButton variant="filled" color="white" onClick={() => handleEdit(order)}>
                                                <PencilIcon className="h-5 w-5" />
                                            </IconButton>
                                            <IconButton variant="filled" color="white" onClick={() => {
                                                setSelectedPf(order);
                                                setDeleteModalOpen(true)
                                            }}>
                                                <TrashIcon className="h-5 w-5" />
                                            </IconButton>
                                            {
                                                order.status === 0 && (
                                                    <IconButton variant="filled" color="white" onClick={() => handleClose(order)}>
                                                        <LockClosedIcon className="h-5 w-5" />
                                                    </IconButton>
                                                )
                                            }
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                    {
                        portfolioList.length === 0 && !loading &&
                        <Typography className="mt-10 text-center text-xl font-semibold text-blue-gray-600">
                            {messages.empty_content}
                        </Typography>
                    }
                </CardBody>
            </Card>
            <div className="mt-8 flex justify-center">
                <Pagination
                    page={pageTotal}
                    active={page}
                    onPageChange={(p) => {
                        setPage(p);
                    }}
                />
            </div>
            <Dialog open={editModalOpen} handler={() => setEditModalOpen(false)} size="md">
                <div className="flex justify-between items-center px-4 pt-4">
                    <DialogHeader>{selectedPf ? "Edit Portfolio" : "Create Portfolio"}</DialogHeader>
                    <IconButton variant="text" onClick={() => setEditModalOpen(false)}>
                        <XMarkIcon className="w-6 h-6" />
                    </IconButton>
                </div>
                <DialogBody className="px-6 pb-4 space-y-4">
                    <div className="flex items-center px-4 pt-4 gap-6">
                        <div className="w-80" hidden={form.position_type === "0"}>
                            <Tabs value={String(form.trade_type)}>
                                <TabsHeader>
                                    <Tab value="0" onClick={() => setForm(prev => ({...prev, ['trade_type']: 0}))}>
                                        Buy
                                    </Tab>
                                    <Tab value="1" onClick={() => setForm(prev => ({...prev, ['trade_type']: 1}))}>
                                        Sell
                                    </Tab>
                                </TabsHeader>
                            </Tabs>
                        </div>
                        <Typography
                            variant="small"
                            className="text-[16px] font-bold text-red"
                        >
                            USD Balance: {(form.entry_price * form.quantity).toLocaleString("en-US", {style:"currency", currency:"USD"})}
                        </Typography>
                    </div>
                    <div className="flex items-center px-4 pt-4 gap-3">
                        <Typography variant="small" className="text-[15px] font-bold text-black">Currency:</Typography>
                        <div className="w-40 ml-8 relative">
                            <Select label="Select Currency" className="text-white"
                                    value={form.token_id}
                                    onChange={(value) =>
                                        setForm(prev => ({...prev,
                                            ['token_id']: value,
                                            ['token_name']: tokenList.filter(t => t.id === value)[0].name,
                                            ['token_symbol']: tokenList.filter(t => t.id === value)[0].symbol,
                                            ['oracle']: tokenList.filter(t => t.id === value)[0].price,
                                            ['token_logo']: tokenList.filter(t => t.id === value)[0].logo,
                                        }))}
                            >
                                {tokenList.map((token, idx) => (
                                    <Option key={token.id} value={token.id} data-id={token.id} name={token.name}>
                                        <Avatar
                                            src={token.logo}
                                            alt={token.name}
                                            size="xs"
                                            variant="circular"
                                            className={`cursor-pointer border-2 border-white mr-2`}
                                        />
                                        {token.name.length > 8 ? token.symbol : token.name}
                                    </Option>
                                ))}
                            </Select>
                            <div className="absolute top-2.5 left-3 flex">
                                {
                                    form.token_logo !== "" &&
                                    <Avatar
                                        src={form.token_logo}
                                        alt={form.token_name}
                                        size="xs"
                                        variant="circular"
                                        className={`cursor-pointer border-2 border-white mr-2`}
                                    />
                                }
                                <Typography variant="small" className="text-[13px] font-medium text-black mt-0.5">{form.token_name.length > 8 ? form.token_symbol : form.token_name}</Typography>
                            </div>
                        </div>
                        <Typography variant="small" className="text-[15px] font-bold text-black ml-24">Token Type:</Typography>
                        <div className="w-40 relative">
                            <Select label="Select Token Type" className="text-white"
                                    value={form.token_type}
                                    onChange={(value) =>
                                        setForm(prev => ({...prev,
                                            ['token_type']: value,
                                            ['token_type_name']: typeList.filter(t => t.uid === value)[0].name,
                                        }))}
                            >
                                {typeList.map((option) => (
                                    <Option   key={option.uid} value={option.uid} data-id={option.uid} name={option.name}>
                                        {option.name}
                                    </Option>
                                ))}
                            </Select>
                            <Typography variant="small" className="text-[13px] font-medium text-black absolute top-3 left-4">{form.token_type_name}</Typography>
                        </div>
                    </div>
                    <div className="flex items-center px-4 pt-2 gap-2">
                        <Typography className="text-[15px] font-bold text-black">Position Type:</Typography>
                        <div className="w-40 ml-1">
                            <Select label="Select Position type" className="text-black"
                                    value={form.position_type}
                                    onChange={(value) => setForm(prev => ({...prev, ['position_type']: value}))}>
                                <Option value="0">Spot</Option>
                                <Option value="1">Margin</Option>
                            </Select>
                        </div>
                        {
                            form.position_type === "1" &&
                            <div className="flex items-center px-4 gap-6 ml-20">
                                <Typography variant="small" className="text-[16px] font-bold text-black">Leverage:</Typography>
                                <div className="w-40 ml-1">
                                    <Input
                                        label="Leverage"
                                        name="leverage"
                                        value={form.leverage}
                                        onChange={handleFormChange}
                                    />
                                </div>
                            </div>
                        }
                    </div>
                    <div className="flex items-center px-4 pt-2">
                        <div className="flex items-center gap-6">
                            <Typography variant="small" className="text-[16px] font-bold text-black">Entry Price:</Typography>
                            <div className="w-40">
                                <Input
                                    label="Entry Price"
                                    name="entry_price"
                                    value={form.entry_price}
                                    icon={<CurrencyDollarIcon className="h-5 w-5" />}
                                    onChange={handleFormChange}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-6 ml-28">
                            <Typography variant="small" className="text-[16px] font-bold text-black">Quantity:</Typography>
                            <div className="w-40">
                                <Input
                                    label={form.token_symbol}
                                    name="quantity"
                                    value={form.quantity}
                                    onChange={handleFormChange}
                                />
                            </div>
                        </div>
                    </div>

                </DialogBody>
                <DialogFooter>
                    <Button variant="outlined" color="gray" onClick={() => setEditModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button color="blue" onClick={handleSubmit} className="ml-2">
                        {selectedPf ? "Update" : "Create"}
                    </Button>
                </DialogFooter>
            </Dialog>
            <Dialog open={deleteModalOpen} handler={() => setDeleteModalOpen(false)}>
                <DialogHeader>Confirm Deletion</DialogHeader>
                <DialogBody>
                    Are you sure you want to delete this portfolio? This action cannot be undone.
                </DialogBody>
                <DialogFooter>
                    <Button variant="text" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
                    <Button color="red" onClick={() => handleDelete()}>Delete</Button>
                </DialogFooter>
            </Dialog>
            <Dialog open={closeModalOpen} handler={() => setCloseModalOpen(false)} size="sm">
                <div className="flex justify-between items-center px-4 pt-4">
                    <DialogHeader>{"Are you sure to close this position?"}</DialogHeader>
                    <IconButton variant="text" onClick={() => setCloseModalOpen(false)}>
                        <XMarkIcon className="w-6 h-6" />
                    </IconButton>
                </div>
                <DialogBody className="px-6 pb-4 space-y-4">
                    <div className="flex items-center px-4 gap-6">
                        <Typography variant="small" className="text-[16px] font-bold text-black">Profit or Loss:</Typography>
                        <div className="w-80 ml-1">
                            <Input
                                label="Enter the profit or loss"
                                name="real_result"
                                value={realResult}
                                icon={<CurrencyDollarIcon className="h-5 w-5" />}
                                onChange={(e) => setRealResult(e.target.value)}
                            />
                        </div>
                    </div>
                </DialogBody>
                <DialogFooter>
                    <Button variant="outlined" color="gray" onClick={() => setCloseModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button color="blue" onClick={handleCloseSubmit} className="ml-2">
                        Yes, Close it
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
};

function LoadingScreen() {
    return (
        <div className="fixed inset-0 grid h-screen w-screen place-items-center bg-gray-900 bg-opacity-75 transition-opacity">
            <div className="flex flex-col items-center gap-4">
                <Spinner color="amber" className="h-16 w-16" />
                <Typography color="white" className="text-xl font-normal">
                    Loading data...
                </Typography>
            </div>
        </div>
    );
}

export default Orders;