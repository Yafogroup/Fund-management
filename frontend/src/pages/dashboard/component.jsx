import {
    Card,
    CardBody,
    CardHeader, Option, Select,
    Typography,
    Menu,
    MenuHandler,
    MenuList,
    MenuItem, Button,
} from "@material-tailwind/react";
import Chart from "react-apexcharts";
import {
    ExclamationCircleIcon,
    CheckCircleIcon,
    InformationCircleIcon,
    ChevronUpIcon
} from "@heroicons/react/24/solid";
import StatCard from "@/widgets/components/stat_card.jsx";
import React, {useEffect, useState} from "react";
import dashboardService from "@/api/dashboardService.jsx";
import {data} from "autoprefixer";

// If you're using Next.js please use the dynamic import for react-apexcharts and remove the import from the top for the react-apexcharts
// import dynamic from "next/dynamic";
// const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });



export default function Dashboard() {

    const [openMenu, setOpenMenu] = useState(false);

    const [barChartInfo, setBarChartInfo] = useState({
        'chart_categories': [],
        'closed_loss': [],
        'closed_profit': [],
        'open_loss': [],
        'open_profit': [],
        'total_profit': [],
    });

    const [pieChartInfo, setPieChartInfo] = useState({
        'list_margin': [],
        'list_margin_long': [],
        'list_margin_short': [],
        'list_spot': [],
        'total_margin': 0,
        'total_spot': 0,
    });

    const [startDate, setStartDate] = useState("2025-02-01");
    const [endDate, setEndDate] = useState("2025-07-01");

    const [pieType, setPieType] = useState(-1);
    const [pieName, setPieName] = useState("All");

    const chartConfig = {
        type: "bar",
        height: 480,
        series: [
            {
                name: "Closed Profit",
                data: barChartInfo.closed_profit,
            },
            {
                name: "Closed Loss",
                data: barChartInfo.closed_loss,
            },
            {
                name: "Opened Profit",
                data: barChartInfo.open_profit,
            },
            {
                name: "Opened Loss",
                data: barChartInfo.open_loss,
            },
        ],
        options: {
            chart: {
                toolbar: {
                    show: false,
                },
                stacked: true,
            },
            title: {
                show: "",
            },
            dataLabels: {
                enabled: false,
            },
            colors: ["#3b82f6", "#e80519", "#7dd3fc", "#72e60c"],
            plotOptions: {
                bar: {
                    columnWidth: "40%",
                    borderRadius: 2,
                },
            },
            xaxis: {
                axisTicks: {
                    show: false,
                },
                axisBorder: {
                    show: false,
                },
                labels: {
                    style: {
                        colors: "#616161",
                        fontSize: "12px",
                        fontFamily: "inherit",
                        fontWeight: 400,
                    },
                },
                categories: barChartInfo.chart_categories,
            },
            yaxis: {
                labels: {
                    style: {
                        colors: "#616161",
                        fontSize: "12px",
                        fontFamily: "inherit",
                        fontWeight: 400,
                    },
                },
            },
            grid: {
                show: true,
                borderColor: "#dddddd",
                strokeDashArray: 5,
                xaxis: {
                    lines: {
                        show: true,
                    },
                },
                padding: {
                    top: 5,
                    right: 20,
                },
            },
            fill: {
                opacity: 0.8,
            },
            tooltip: {
                theme: "dark",
            },
        },
    };
    const lchartConfig = {
        type: "line",
        height: 360,
        series: [
            {
                name: "Sales",
                data: barChartInfo.total_profit,
            },
        ],
        options: {
            chart: {
                toolbar: {
                    show: false,
                },
            },
            title: {
                show: "",
            },
            dataLabels: {
                enabled: false,
            },
            colors: ["#17f109"],
            stroke: {
                lineCap: "round",
                curve: "smooth",
            },
            markers: {
                size: 0,
            },
            xaxis: {
                axisTicks: {
                    show: false,
                },
                axisBorder: {
                    show: false,
                },
                labels: {
                    style: {
                        colors: "#616161",
                        fontSize: "12px",
                        fontFamily: "inherit",
                        fontWeight: 400,
                    },
                },
                categories: barChartInfo.chart_categories,
            },
            yaxis: {
                labels: {
                    style: {
                        colors: "#616161",
                        fontSize: "12px",
                        fontFamily: "inherit",
                        fontWeight: 400,
                    },
                },
            },
            grid: {
                show: true,
                borderColor: "#dddddd",
                strokeDashArray: 5,
                xaxis: {
                    lines: {
                        show: true,
                    },
                },
                padding: {
                    top: 5,
                    right: 20,
                },
            },
            fill: {
                opacity: 0.8,
            },
            tooltip: {
                theme: "dark",
            },
        },
    };
    const pchartConfig = {
        type: "pie",
        width: 320,
        height: 320,
        options: {
            chart: {
                toolbar: {
                    show: false,
                },
            },
            labels: pieType === -1 ? ["margin", "spot"]
                : pieType === 0 ? Object.keys(pieChartInfo.list_spot)
                    : pieType === 1 ? Object.keys(pieChartInfo.list_margin)
                        : pieType === 2 ? Object.keys(pieChartInfo.list_margin_long)
                            : Object.keys(pieChartInfo.list_margin_short),
            title: {
                show: "",
            },
            dataLabels: {
                enabled: false,
            },
            colors: ["#020617", "#ff8f00", "#00897b", "#1e88e5", "#d81b60"],
            legend: {
                show: false,
            },
        },
    };

    const returnData = [
        { month: "Mar 2022", percent: "0.00%", amount: "$0.00", isPositive: false },
        { month: "Feb 2022", percent: "0.75%", amount: "$598.00", isPositive: false },
        { month: "Jan 2022", percent: "1.32%", amount: "$1,058.00", isPositive: true },
        { month: "Jan 2022", percent: "1.32%", amount: "$1,058.00", isPositive: true },
        { month: "Jan 2022", percent: "1.32%", amount: "$1,058.00", isPositive: true },
        { month: "Jan 2022", percent: "1.32%", amount: "$1,058.00", isPositive: true },
        { month: "Jan 2022", percent: "1.32%", amount: "$1,058.00", isPositive: true },
        { month: "Jan 2022", percent: "1.32%", amount: "$1,058.00", isPositive: true },
        { month: "Jan 2022", percent: "1.32%", amount: "$1,058.00", isPositive: true },
        { month: "Jan 2022", percent: "1.32%", amount: "$1,058.00", isPositive: true },
        { month: "Jan 2022", percent: "1.32%", amount: "$1,058.00", isPositive: true },
        { month: "Jan 2022", percent: "1.32%", amount: "$1,058.00", isPositive: true },
        { month: "Jan 2022", percent: "1.32%", amount: "$1,058.00", isPositive: true },
        { month: "Dec 2022", percent: "1.23%", amount: "$987.00", isPositive: false },
        { month: "Dec 2022", percent: "1.23%", amount: "$987.00", isPositive: false },
        { month: "Dec 2022", percent: "1.23%", amount: "$987.00", isPositive: false },
        { month: "Dec 2022", percent: "1.23%", amount: "$987.00", isPositive: false },
        { month: "Dec 2022", percent: "1.23%", amount: "$987.00", isPositive: false },
        { month: "Dec 2022", percent: "1.23%", amount: "$987.00", isPositive: false },
    ];

    const init = async () => {
        const result = await dashboardService.get_info({
            "start_date": startDate,
            "end_date": endDate,
        });
        console.log(result.data.data.bar_chart_info);
        console.log(result.data.data.pie_chart_info);

        setBarChartInfo(result.data.data.bar_chart_info)
        setPieChartInfo(result.data.data.pie_chart_info)

    }

    const setPieTitle = (type, value) => {
        setPieType(type);
        setPieName(value);
    }

    useEffect(() => {
        init();
    }, []);

    return (
        <div>
            <div className="grid grid-cols-4 gap-8">
                <StatCard title="Realized Profit" value="$10,770.84" change="13.46%" isPositive={true} />
                <StatCard title="Total Profit" value="$5,946.32" change="2.44%" isPositive={true} />
                <StatCard title="Unrealized P&L" value="$4,823.00" change="13.46%" isPositive={false} />
                <StatCard title="Outstanding premium" value="$274.00" change="6.82%" isPositive={true} />
            </div>
            <div className="flex mt-4 gap-4">
                <Card className="w-2/3 bg-white/5 backdrop-blur-sm shadow-lg rounded-xl">
                    <CardBody className="px-2 pb-0">
                        <div className="grid grid-cols-4 gap-4 rounded-none md:flex-row md:items-center px-8">
                            <div>
                                <Typography variant="small" color="dark" className="font-medium text-[16px]">
                                    Period
                                </Typography>
                                <Select label="Select an option" size="lg" className="text-lBLue">
                                    <Option value="1">1 year</Option>
                                    <Option value="5">1 month</Option>
                                    <Option value="15">1 week</Option>
                                </Select>
                            </div>
                            <div>
                                <Typography variant="small" color="dark" className="font-medium text-[16px]">
                                    Granularity
                                </Typography>
                                <Select label="Select an option"
                                        size="lg" className="text-lBLue"
                                >
                                    <Option value="1">Monthly</Option>
                                    <Option value="5">Weekly</Option>
                                    <Option value="15">Daily</Option>
                                </Select>
                            </div>
                            <div>
                                <Typography variant="small" color="dark" className="font-medium text-[16px]">
                                    P&L
                                </Typography>
                                <Select label="Select an option"
                                        size="lg" className="text-lBLue"
                                >
                                    <Option value="1">All</Option>
                                    <Option value="5">Profit</Option>
                                    <Option value="15">Loss</Option>
                                </Select>
                            </div>
                            <div>
                                <Typography variant="small" color="dark" className="font-medium text-[16px]">
                                    Status
                                </Typography>
                                <Select label="Select an option"
                                        size="lg" className="text-lBLue"
                                >
                                    <Option value="1">All</Option>
                                    <Option value="5">Open</Option>
                                    <Option value="15">Close</Option>
                                </Select>
                            </div>
                        </div>
                        <Chart {...chartConfig} />
                        <Chart {...lchartConfig} />
                    </CardBody>
                </Card>
                <div className="w-1/3 grid grid-rows-2 gap-4 max-h-[960px]">
                    <Card className="bg-white/5 backdrop-blur-sm shadow-lg rounded-xl scrollbar">
                        <CardBody>
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <Typography variant="small" className="text-gray-300 font-medium">
                                        Return % per month
                                    </Typography>
                                    <Typography variant="small" className="text-sm text-gray-500">
                                        (Calculated from closed trades)
                                    </Typography>
                                </div>
                                <InformationCircleIcon className="w-4 h-4 text-gray-500" />
                            </div>

                            <div className="grid grid-cols-3 text-gray-400 text-sm border-b border-gray-700 pb-1 mb-2">
                                <span>Month</span>
                                <span>% Return</span>
                                <span className="text-right">$ Returned</span>
                            </div>

                            {returnData.map((item, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-3 items-center text-sm py-1 text-white"
                                >
                                    <span>{item.month}</span>
                                    <div className="flex items-center gap-1">
                                        <span>{item.percent}</span>
                                        {item.isPositive ? (
                                            <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <ExclamationCircleIcon className="w-4 h-4 text-red-500" />
                                        )}
                                    </div>
                                    <span className="text-right">{item.amount}</span>
                                </div>
                            ))}
                        </CardBody>
                    </Card>
                    <Card className="bg-white/5 backdrop-blur-sm shadow-lg rounded-xl">
                        <CardBody>
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <Typography variant="small" className="text-gray-300 font-medium">
                                        Return % per token type
                                    </Typography>
                                    <Typography variant="small" className="text-sm text-gray-500">
                                        (Calculated from closed trades)
                                    </Typography>
                                </div>
                                <Menu>
                                    <MenuHandler>
                                        <Button>{pieName}</Button>
                                    </MenuHandler>
                                    <MenuList>
                                        <MenuItem onClick={() => setPieTitle(-1, "All")}>All</MenuItem>
                                        <MenuItem onClick={() => setPieTitle(0, "Spot")}>Spot</MenuItem>
                                        <Menu
                                            placement="right-start"
                                            open={openMenu}
                                            handler={setOpenMenu}
                                            allowHover
                                            offset={15}
                                        >
                                            <MenuHandler className="flex items-center justify-between">
                                                <MenuItem>
                                                    Margin
                                                    <ChevronUpIcon
                                                        strokeWidth={2.5}
                                                        className={`h-3.5 w-3.5 transition-transform ${
                                                            openMenu ? "rotate-90" : ""
                                                        }`}
                                                    />
                                                </MenuItem>
                                            </MenuHandler>
                                            <MenuList>
                                                <MenuItem onClick={() => setPieTitle(1, "Margin")}>All</MenuItem>
                                                <MenuItem onClick={() => setPieTitle(2, "Long")}>Long</MenuItem>
                                                <MenuItem onClick={() => setPieTitle(3, "Short")}>Short</MenuItem>
                                            </MenuList>
                                        </Menu>
                                    </MenuList>
                                </Menu>
                                <InformationCircleIcon className="w-4 h-4 text-gray-500" />
                            </div>
                            <div className="mt-8 grid place-items-center px-2">
                                <Chart {...pchartConfig}
                                       series={
                                    pieType === -1 ? [pieChartInfo.total_margin, pieChartInfo.total_spot]
                                        : pieType === 0 ? Object.values(pieChartInfo.list_spot)
                                            : pieType === 1 ? Object.values(pieChartInfo.list_margin)
                                                : pieType === 2 ? Object.values(pieChartInfo.list_margin_long)
                                                    : Object.values(pieChartInfo.list_margin_short)
                                } />
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
}