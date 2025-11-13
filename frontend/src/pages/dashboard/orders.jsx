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
        "Type",
        "Token",
        "Status",
        "Position",
        "Quantity",
        "Value",
        "Avg. Open",
        "Oracle",
        "Est.P&L",
        "Result",
        "",
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
    }, [page, pageCount])

    if (showLoading) {
        return <LoadingScreen />;
    }

    return (
        <div className="overflow-x-auto scrollbar">
            <div className="flex pb-2 items-center">
                <Typography variant="small" className="text-[16px] font-medium text-gray-300">Total Order:</Typography>
                <Typography className="text-[20px] font-bold text-gray-300 ml-2">{totalOrder.toLocaleString("en-US", {style:"currency", currency:"USD"})}</Typography>
            </div>
            <Card className="bg-sidebar">
                <CardBody className="p-6">
                    <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
                        <div className="w-30 bg-cBlue3 rounded-lg">
                            <Input
                                placeholder="Search"
                                value={searchTerm}
                                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                                className="text-white bg-cBlue3 focus:outline-none border-none !border-t-transparent focus:!border-t-transparent data-[open=true]:!border-t-transparent"
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="w-120 flex">
                            <label className="text-sm text-gray-700 mb-1 block mt-2">Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onClick={(e) => e.currentTarget.showPicker()}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-40 ml-2 px-3 py-2 bg-cBlue3 rounded-md focus:outline-none text-sm text-gray-300"
                            />
                            <input
                                type="date"
                                value={endDate}
                                onClick={(e) => e.currentTarget.showPicker()}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-40 ml-1 px-3 py-2 bg-cBlue3 rounded-md focus:outline-none text-sm text-gray-300"
                            />
                        </div>
                        <div className="w-120 flex">
                            <label className="text-sm text-gray-700 mb-1 block mt-3">Token Type</label>
                            <div className="w-60 ml-2">
                                <Select placeholder="Select Token Type" className="text-white bg-cBlue3 focus:outline-none border-none !border-t-transparent focus:!border-t-transparent data-[open=true]:!border-t-transparent"
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
                        </div>
                        <div className="w-80 flex">
                            <label className="text-sm text-gray-700 mb-1 block mt-3">Position Type</label>
                            <div className="w-40 ml-1">
                                <Select className="text-white bg-cBlue3 focus:outline-none border-none !border-t-transparent focus:!border-t-transparent data-[open=true]:!border-t-transparent"
                                        value={filterPosition}
                                        onChange={(value) => setFilterPosition(value)}>
                                    <Option value="-1">All</Option>
                                    <Option value="0">Spot</Option>
                                    <Option value="1">Margin</Option>
                                    <Option value="2">Long</Option>
                                    <Option value="3">Short</Option>
                                </Select>
                            </div>
                        </div>
                        <div className="w-60 ml-10">
                            <Tabs value={status.toString()}>
                                <TabsHeader className="bg-cBlue3"
                                            indicatorProps={{
                                                className: "bg-black shadow-none",
                                            }}
                                >
                                    <Tab value="-1" onClick={() => setStatus(-1)} className="text-gray-300">
                                        All
                                    </Tab>
                                    <Tab value="0" onClick={() => setStatus(0)} className="text-gray-300">
                                        Open
                                    </Tab>
                                    <Tab value="1" onClick={() => setStatus(1)} className="text-gray-300">
                                        Close
                                    </Tab>
                                </TabsHeader>
                            </Tabs>
                        </div>
                        <div className="w-full pr-1 flex-1" hidden={false}>
                            <Button
                                variant="filled"
                                color="blue"
                                className="bg-gradient-to-tr from-[#0023af] via-[#006ec1] to-[#00a0ce]"
                                onClick={() => handleApply()}
                            >
                                Apply
                            </Button>
                        </div>
                        <div className="w-full text-right pr-1 flex-1">
                            <Button
                                variant="outlined"
                                color="blue-gray"
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
                                        className="text-[16px] font-medium text-gray-600 flex"
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
                                    <td className="p-4 text-gray-300">{index + 1 + (page - 1) * pageCount}</td>
                                    <td className="p-4 text-gray-300">{order.date}</td>
                                    <td className="p-4 text-gray-300">{order.closed_date === '' ? <span className="text-red-500 ml-4">---</span> : order.closed_date}</td>
                                    <td className="p-4">
                                        <Typography variant="small" className="text-[16px] text-gray-300 mb-1">{order.token_type_name}</Typography>
                                    </td>
                                    <td className="p-4 flex items-center">
                                        <Avatar
                                            src={order.logo}
                                            alt={order.token_name}
                                            size="xs"
                                            variant="circular"
                                            className={`cursor-pointer border-2 border-white mr-2`}
                                        />
                                        <Typography variant="small" className="text-[16px] text-gray-300 mt-1">{order.token_name.length > 8 ? order.token_symbol : order.token_name}</Typography>
                                    </td>
                                    <td className="p-4">
                                        <Chip
                                            variant="outlined"
                                            size="sm"
                                            value={order.status === 0 ? "Open" : "Close"}
                                            color={order.status === 0 ? "blue" : "blue-gray"}
                                        />
                                    </td>
                                    <td className="p-4">
                                        <Typography variant="small" className={`text-[16px] mb-1 ${order.trade_type === 0 ? "text-lGreen" : "text-red-500"}`}>
                                            {
                                                order.trade_type === 0
                                                    ? (order.position_type === 0 ? "Spot" : "Margin(" + order.leverage.toString() + "X Long)")
                                                    : (order.position_type === 0 ? "Spot" : "Margin(" + order.leverage.toString() + "X Short)")
                                            }
                                        </Typography>
                                    </td>
                                    <td className="p-4">
                                        <Typography variant="small" className="text-[16px] text-gray-300">{order.quantity.toString() + " " + order.token_symbol}</Typography>
                                    </td>
                                    <td className="p-4">
                                        <Typography variant="small" className="text-[16px] text-gray-300">{order_value.toLocaleString("en-US", {style:"currency", currency:"USD", minimumFractionDigits: 4})}</Typography>
                                    </td>
                                    <td className="p-4">
                                        {
                                            order.entry_price >= 0.09 ?
                                                <Typography variant="small" className="text-[16px] text-gray-300">{
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
                                                <Typography variant="small" className="text-[16px] text-gray-300">{
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
                                            <Typography variant="small" className={`text-[16px] font-medium ${est_val < 0 ? "text-red-500" : "text-lGreen"}`}>
                                                {est_val.toLocaleString("en-US", {style:"currency", currency:"USD"})}
                                            </Typography>
                                        }
                                        {
                                            order.status === 1 &&
                                            <span className="text-red-500 ml-4">---</span>
                                        }
                                    </td>

                                    <td className="p-4">
                                        {real_result !== ""  ? (
                                            <Typography variant="small" className={`text-[16px] font-medium ${order.real_result > 0 ? "text-lGreen" : "text-red-500"}`}>{real_result}</Typography>
                                        ) : (
                                            <span className="text-red-500 ml-4">---</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                color="green"
                                                onClick={() => handleEdit(order)}>Edit</Button>
                                            <Button
                                                size="sm"
                                                color="red"
                                                onClick={() => {
                                                    setSelectedPf(order);
                                                    setDeleteModalOpen(true)
                                                }}>Delete</Button>

                                            {
                                                order.status === 0 && (
                                                    <Button
                                                        size="sm"
                                                        color="blue-gray"
                                                        onClick={() => {
                                                            setSelectedPf(order);
                                                            setCloseModalOpen(true)
                                                        }}>Close</Button>
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
            <Dialog open={editModalOpen} handler={() => setEditModalOpen(false)} size="xs"
                    className="bg-opacity-80 bg-[#4b5461] text-white rounded-xl shadow-xl">
                <div className="flex justify-between items-center px-4 pt-4 border-b-2">
                    <DialogHeader className="text-gray-300 font-normal">{selectedPf ? "Edit Portfolio" : "Create Portfolio"}</DialogHeader>
                </div>
                <DialogBody className="px-6 pb-4 space-y-4">
                    <div className="flex pt-4 gap-3">
                        <div className="w-[40%] text-end pr-10">
                            <Typography
                                variant="small"
                                className="text-[16px] text-gray-400"
                            >
                                USD Balance
                            </Typography>
                            <Typography
                                className="text-[22px] font-medium text-white"
                            >
                                {(form.entry_price * form.quantity).toLocaleString("en-US", {style:"currency", currency:"USD"})}
                            </Typography>
                        </div>
                        <div className="w-60" hidden={form.position_type === "0"}>
                            <Tabs value={String(form.trade_type)}>
                                <TabsHeader className="bg-cBlue3"
                                            indicatorProps={{
                                                className: "bg-lGreen shadow-none",
                                            }}
                                >
                                    <Tab value="0" onClick={() => setForm(prev => ({...prev, ['trade_type']: 0}))} className="text-gray-300">
                                        Buy
                                    </Tab>
                                    <Tab value="1" onClick={() => setForm(prev => ({...prev, ['trade_type']: 1}))} className="text-gray-300">
                                        Sell
                                    </Tab>
                                </TabsHeader>
                            </Tabs>
                        </div>

                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-[40%] text-end pr-10">
                            <Typography className="text-[18px] text-gray-400">Currency</Typography>
                        </div>
                        <div className="w-60 relative">
                            <Select label="Select Currency" className="text-transparent bg-cBlue3 focus:outline-none border-none !border-t-transparent focus:!border-t-transparent data-[open=true]:!border-t-transparent"
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
                                <Typography variant="small" className="text-[15px] font-medium text-white ">{form.token_name.length > 8 ? form.token_symbol : form.token_name}</Typography>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-[40%] text-end pr-10">
                            <Typography className="text-[18px] text-gray-400">Position Type</Typography>
                        </div>
                        <div className="w-60 ml-1">
                            <Select label="Select Position type" className="text-white bg-cBlue3 focus:outline-none border-none !border-t-transparent focus:!border-t-transparent data-[open=true]:!border-t-transparent"
                                    value={form.position_type}
                                    onChange={(value) => setForm(prev => ({...prev, ['position_type']: value}))}>
                                <Option value="0">Spot</Option>
                                <Option value="1">Margin</Option>
                            </Select>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-[40%] text-end pr-10">
                            <Typography className="text-[18px] text-gray-400">Entry Price</Typography>
                        </div>
                        <div className="w-60 bg-cBlue3 rounded-md">
                            <Input
                                label="Entry Price"
                                name="entry_price"
                                value={form.entry_price}
                                onChange={handleFormChange}
                                className="text-white focus:outline-none border-none !border-t-transparent focus:!border-t-transparent data-[open=true]:!border-t-transparent"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-[40%] text-end pr-10">
                            <Typography className="text-[18px] text-gray-400">Token Type</Typography>
                        </div>
                        <div className="w-60 relative">
                            <Select label="Select Token Type" className="text-transparent bg-cBlue3 focus:outline-none border-none !border-t-transparent focus:!border-t-transparent data-[open=true]:!border-t-transparent"
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
                            <Typography variant="small" className="text-[15px] text-gray-300 absolute top-2 left-3">{form.token_type_name}</Typography>
                        </div>
                    </div>

                    {
                        form.position_type === "1" &&
                        <div className="flex items-center gap-2">
                            <div className="w-[40%] text-end pr-10">
                                <Typography className="text-[18px] text-gray-400">Leverage</Typography>
                            </div>
                            <div className="w-60 ml-1 bg-cBlue3 rounded-md">
                                <Input
                                    label="Leverage"
                                    name="leverage"
                                    value={form.leverage}
                                    onChange={handleFormChange}
                                    className="text-white focus:outline-none border-none !border-t-transparent focus:!border-t-transparent data-[open=true]:!border-t-transparent"
                                />
                            </div>
                        </div>
                    }

                    <div className="flex items-center gap-3">
                        <div className="w-[40%] text-end pr-10">
                            <Typography className="text-[18px] text-gray-400">Quantity</Typography>
                        </div>
                        <div className="w-60 bg-cBlue3 rounded-md">
                            <Input
                                label={form.token_symbol}
                                name="quantity"
                                value={form.quantity}
                                onChange={handleFormChange}
                                className="text-white focus:outline-none border-none !border-t-transparent focus:!border-t-transparent data-[open=true]:!border-t-transparent"
                            />
                        </div>
                    </div>

                </DialogBody>
                <DialogFooter>
                    <Button variant="text" color="white" onClick={() => setEditModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button color="blue" onClick={handleSubmit} className="ml-2 bg-gradient-to-tr from-[#0023af] via-[#006ec1] to-[#00a0ce]">
                        {selectedPf ? "Update" : "Create"}
                    </Button>
                </DialogFooter>
            </Dialog>
            <Dialog open={deleteModalOpen} handler={() => setDeleteModalOpen(false)} size="xs"
                    className="bg-opacity-60 bg-[#2c3040] text-white rounded-xl shadow-xl">
                <DialogHeader
                    className="text-sm font-semibold text-gray-200 border-b border-gray-700">Confirm Deletion
                </DialogHeader>
                <DialogBody className="text-white">
                    Are you sure you want to delete this portfolio? This action cannot be undone.
                </DialogBody>
                <DialogFooter>
                    <Button className="text-gray-300 hover:text-white mr-4" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
                    <Button className="bg-gradient-to-tr from-[#0023af] via-[#006ec1] to-[#00a0ce]" onClick={() => handleDelete()}>Delete</Button>
                </DialogFooter>
            </Dialog>
            <Dialog open={closeModalOpen} handler={() => setCloseModalOpen(false)} size="xs"
                    className="bg-opacity-60 bg-[#2c3040] text-white rounded-xl shadow-xl">
                <DialogHeader
                    className="text-[16px] text-gray-300 border-b border-gray-700">Are you sure to close this position?
                </DialogHeader>
                <DialogBody className="px-6 pb-4 space-y-4">
                    <div className="flex items-center px-4 bg-sidebar rounded-md">
                        <Typography variant="small" className="text-[16px] text-lBLue">Profit</Typography>
                        <Typography variant="small" className="ml-4 text-[16px]  text-gray-300">Loss:</Typography>
                        <Typography variant="small" className=" ml-auto text-[16px] text-white">$</Typography>
                        <div className="w-20 mr-4 bg-sidebar">
                            <Input
                                placeholder="profit or loss"
                                name="real_result"
                                value={realResult}
                                className="border-none bg-sidebar text-gray-300"
                                onChange={(e) => setRealResult(e.target.value)}
                            />
                        </div>
                    </div>
                </DialogBody>
                <DialogFooter>
                    <Button className="text-gray-300 hover:text-white mr-4" onClick={() => setCloseModalOpen(false)}>Cancel</Button>
                    <Button className="bg-gradient-to-tr from-[#0023af] via-[#006ec1] to-[#00a0ce]" onClick={handleCloseSubmit}>Yes, Close it</Button>
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