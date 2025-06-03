import { useState } from "react";
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
    CardBody,
} from "@material-tailwind/react";
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowPathIcon,
    EllipsisVerticalIcon,
    ChevronUpDownIcon,
} from "@heroicons/react/24/outline";

const Orders = () => {
    const [activeTab, setActiveTab] = useState("positions");
    const [searchTerm, setSearchTerm] = useState("");
    const [timeFilter, setTimeFilter] = useState("1month");
    const [typeFilter, setTypeFilter] = useState("all");

    // Sample data
    const positions = [];
    const openOrders = [];
    const orderHistory = [
        {
            date: "2025-04-01",
            name: "Solana (SOL)",
            type: "MAJOR",
            position: "20K Long (Margin)",
            size: "7.23 SOL",
            orderValue: "$1258.00",
            avgOpen: "$158.94",
            oracle: "$173.999",
            pnl: "$2177.471",
            status: "open",
            result: "positive",
        },
        // More data...
    ];

    const tradeHistory = [
        {
            time: "2021-04-26 15:22:40",
            symbol: "COMPUSDT Perp",
            type: "Market",
            side: "Sell",
            average: "615.00",
            price: "-",
            executed: "234.32 USDT",
            amount: "234.32 USDT",
            status: "Filled",
        },
        // More data...
    ];

    const filteredOrders = orderHistory.filter((order) =>
        order.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4">
            <Card className="overflow-hidden">
                <CardHeader
                    floated={false}
                    shadow={false}
                    className="rounded-none bg-transparent p-6"
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <Typography variant="h5" color="blue-gray">
                            Orders
                        </Typography>
                        <div className="flex w-full md:w-72 gap-2">
                            <Input
                                label="Search orders..."
                                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Tooltip content="Filters">
                                <IconButton>
                                    <FunnelIcon className="h-5 w-5" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip content="Refresh">
                                <IconButton>
                                    <ArrowPathIcon className="h-5 w-5" />
                                </IconButton>
                            </Tooltip>
                        </div>
                    </div>
                </CardHeader>

                <CardBody className="px-0 pt-0">
                    <Tabs value={activeTab}>
                        <TabsHeader className="rounded-none border-b border-blue-gray-50 bg-transparent p-0">
                            <Tab
                                value="positions"
                                onClick={() => setActiveTab("positions")}
                                className={activeTab === "positions" ? "text-blue-500" : ""}
                            >
                                Positions ({positions.length})
                            </Tab>
                            <Tab
                                value="openOrders"
                                onClick={() => setActiveTab("openOrders")}
                                className={activeTab === "openOrders" ? "text-blue-500" : ""}
                            >
                                Open Orders ({openOrders.length})
                            </Tab>
                            <Tab
                                value="orderHistory"
                                onClick={() => setActiveTab("orderHistory")}
                                className={activeTab === "orderHistory" ? "text-blue-500" : ""}
                            >
                                Order History
                            </Tab>
                            <Tab
                                value="tradeHistory"
                                onClick={() => setActiveTab("tradeHistory")}
                                className={activeTab === "tradeHistory" ? "text-blue-500" : ""}
                            >
                                Trade History
                            </Tab>
                        </TabsHeader>

                        <div className="flex flex-wrap items-center justify-between gap-4 p-4">
                            <div className="flex gap-2">
                                <Select
                                    label="Time Period"
                                    value={timeFilter}
                                    onChange={(val) => setTimeFilter(val)}
                                    className="min-w-[120px]"
                                >
                                    <Option value="1day">1 Day</Option>
                                    <Option value="1week">1 Week</Option>
                                    <Option value="1month">1 Month</Option>
                                    <Option value="3months">3 Months</Option>
                                    <Option value="custom">Custom Range</Option>
                                </Select>

                                <Select
                                    label="Type"
                                    value={typeFilter}
                                    onChange={(val) => setTypeFilter(val)}
                                    className="min-w-[120px]"
                                >
                                    <Option value="all">All Types</Option>
                                    <Option value="major">MAJOR</Option>
                                    <Option value="meme">MEME</Option>
                                    <Option value="limit">Limit</Option>
                                    <Option value="market">Market</Option>
                                </Select>
                            </div>
                        </div>

                        <TabsBody>
                            <TabPanel value="positions" className="p-0">
                                {positions.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        No open positions
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-max table-auto text-left">
                                            <thead>
                                            <tr>
                                                {[
                                                    "Date",
                                                    "Name",
                                                    "Type",
                                                    "Position",
                                                    "Size",
                                                    "Order Value",
                                                    "Avg. Open",
                                                    "Oracle",
                                                    "P&L",
                                                    "Status",
                                                    "Action",
                                                ].map((head) => (
                                                    <th
                                                        key={head}
                                                        className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4"
                                                    >
                                                        <Typography
                                                            variant="small"
                                                            color="blue-gray"
                                                            className="flex items-center justify-between gap-2 font-normal leading-none opacity-70"
                                                        >
                                                            {head}
                                                            <ChevronUpDownIcon strokeWidth={2} className="h-4 w-4" />
                                                        </Typography>
                                                    </th>
                                                ))}
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {positions.map((pos, index) => (
                                                <tr key={index}>
                                                    <td className="p-4">{pos.date}</td>
                                                    <td className="p-4">{pos.name}</td>
                                                    <td className="p-4">
                                                        <Chip
                                                            variant="ghost"
                                                            size="sm"
                                                            value={pos.type}
                                                            color={pos.type === "MAJOR" ? "blue" : "amber"}
                                                        />
                                                    </td>
                                                    <td className="p-4">{pos.position}</td>
                                                    <td className="p-4">{pos.size}</td>
                                                    <td className="p-4">{pos.orderValue}</td>
                                                    <td className="p-4">{pos.avgOpen}</td>
                                                    <td className="p-4">{pos.oracle}</td>
                                                    <td
                                                        className={`p-4 ${
                                                            pos.pnl.startsWith("-") ? "text-red-500" : "text-green-500"
                                                        }`}
                                                    >
                                                        {pos.pnl}
                                                    </td>
                                                    <td className="p-4">
                                                        <Chip
                                                            variant="outlined"
                                                            size="sm"
                                                            value={pos.status}
                                                            color={pos.status === "open" ? "green" : "red"}
                                                        />
                                                    </td>
                                                    <td className="p-4">
                                                        <Tooltip content="More actions">
                                                            <IconButton variant="text">
                                                                <EllipsisVerticalIcon className="h-5 w-5" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </TabPanel>

                            <TabPanel value="orderHistory" className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-max table-auto text-left">
                                        <thead>
                                        <tr>
                                            {[
                                                "Date",
                                                "Name",
                                                "Type",
                                                "Position",
                                                "Size",
                                                "Order Value",
                                                "Avg. Open",
                                                "Oracle",
                                                "P&L",
                                                "Status",
                                                "Result",
                                                "Action",
                                            ].map((head) => (
                                                <th
                                                    key={head}
                                                    className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4"
                                                >
                                                    <Typography
                                                        variant="small"
                                                        color="blue-gray"
                                                        className="flex items-center justify-between gap-2 font-normal leading-none opacity-70"
                                                    >
                                                        {head}
                                                        <ChevronUpDownIcon strokeWidth={2} className="h-4 w-4" />
                                                    </Typography>
                                                </th>
                                            ))}
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {filteredOrders.map((order, index) => (
                                            <tr key={index}>
                                                <td className="p-4">{order.date}</td>
                                                <td className="p-4">{order.name}</td>
                                                <td className="p-4">
                                                    <Chip
                                                        variant="ghost"
                                                        size="sm"
                                                        value={order.type}
                                                        color={order.type === "MAJOR" ? "blue" : "amber"}
                                                    />
                                                </td>
                                                <td className="p-4">{order.position}</td>
                                                <td className="p-4">{order.size}</td>
                                                <td className="p-4">{order.orderValue}</td>
                                                <td className="p-4">{order.avgOpen}</td>
                                                <td className="p-4">{order.oracle}</td>
                                                <td
                                                    className={`p-4 ${
                                                        order.pnl.startsWith("-") ? "text-red-500" : "text-green-500"
                                                    }`}
                                                >
                                                    {order.pnl}
                                                </td>
                                                <td className="p-4">
                                                    <Chip
                                                        variant="outlined"
                                                        size="sm"
                                                        value={order.status}
                                                        color={order.status === "open" ? "green" : "red"}
                                                    />
                                                </td>
                                                <td className="p-4">
                                                    {order.result === "positive" ? (
                                                        <span className="text-green-500">✅</span>
                                                    ) : (
                                                        <span className="text-red-500">❌</span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <Tooltip content="More actions">
                                                        <IconButton variant="text">
                                                            <EllipsisVerticalIcon className="h-5 w-5" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </TabPanel>

                            {/* Similar structure for other tabs */}
                        </TabsBody>
                    </Tabs>
                </CardBody>
            </Card>
        </div>
    );
};

export default Orders;