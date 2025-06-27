import {
    Button,
    Card,
    CardBody,
    Menu,
    MenuHandler,
    MenuItem,
    MenuList,
    Option,
    Select,
    Spinner,
    Typography,
} from "@material-tailwind/react";
import Chart from "react-apexcharts";
import {CheckCircleIcon, ChevronUpIcon, ExclamationCircleIcon, InformationCircleIcon} from "@heroicons/react/24/solid";
import StatCard from "@/widgets/components/stat_card.jsx";
import React, {useEffect, useState} from "react";
import dashboardService from "@/api/dashboardService.jsx";
import {format, subMonths, subWeeks, subYears} from 'date-fns';

// If you're using Next.js please use the dynamic import for react-apexcharts and remove the import from the top for the react-apexcharts
// import dynamic from "next/dynamic";
// const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

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


export default function Dashboard() {

    const [openMenu, setOpenMenu] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [periodConfig, setPeriodConfig] = useState("3")
    const [plType, setPlType] = useState("-1");
    const [status, setStatus] = useState("-1");

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
        'real_profit': 0,
        'real_profit_total': 0,
        'unreal_profit': 0,
        'unreal_profit_total': 0,
    });

    const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    const [pieType, setPieType] = useState(-1);
    const [pieName, setPieName] = useState("All");

    const [yearData, setYearData] = useState([]);
    const [todayInfo, setTodayInfo] = useState({})

    const [pieData, setPieData] = useState({
        initData: [],
        Series: [],
        Labels: []
    })
    const [pieFirst, setPieFirst] = useState(false);

    const chartConfig = {
        type: "bar",
        height: 480,
        series:
            plType === "-1" ?
                (status === "-1" ? [
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
                ] : status === "0" ? [
                    {
                        name: "Opened Profit",
                        data: barChartInfo.open_profit,
                    },
                    {
                        name: "Opened Loss",
                        data: barChartInfo.open_loss,
                    },
                ] : [
                    {
                        name: "Closed Profit",
                        data: barChartInfo.closed_profit,
                    },
                    {
                        name: "Closed Loss",
                        data: barChartInfo.closed_loss,
                    }
                ]) : plType === "0" ? (status === "-1" ? [
                        {
                            name: "Closed Profit",
                            data: barChartInfo.closed_profit,
                        },
                        {
                            name: "Opened Profit",
                            data: barChartInfo.open_profit,
                        }
                    ] : status === "0" ? [
                        {
                            name: "Opened Profit",
                            data: barChartInfo.open_profit,
                        }
                    ] : [
                        {
                            name: "Closed Profit",
                            data: barChartInfo.closed_profit,
                        }
                    ]) : (status === "-1" ? [
                    {
                        name: "Closed Loss",
                        data: barChartInfo.closed_loss,
                    },
                    {
                        name: "Opened Loss",
                        data: barChartInfo.open_loss,
                    },
                ] : status === "0" ? [
                    {
                        name: "Opened Loss",
                        data: barChartInfo.open_loss,
                    },
                ] : [
                    {
                        name: "Closed Loss",
                        data: barChartInfo.closed_loss,
                    },
                ]),
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
        width: 280,
        height: 280,
        labels: pieData.Labels,
        series: pieData.Series,
        options: {
            chart: {
                toolbar: {
                    show: false,
                },
            },
            title: {
                show: "",
            },
            legend: {
                show: false,
            },
            // dataLabels: {
            //     enabled: true,
            //     formatter: function (val, opts) {
            //         // return pieData.initData[opts.seriesIndex].toString();
            //         return val.toString();
            //     },
            // },
            tooltip: {
                y: {
                    formatter: function (val, opts) {
                        // const originalValue = pieData.initData[opts.seriesIndex];
                        return val.toFixed(2).toString();
                    },
                    title: {
                        formatter: function(seriesName) {
                            // This removes the "series-1" title completely
                            return pieData.Labels[Number(seriesName.substring(seriesName.length - 1))];
                        }
                    }
                }
            },
        },
    };

    const init = async () => {
        setIsLoading(true);
        const result = await dashboardService.get_info({
            "start_date": startDate,
            "end_date": endDate,
            "pl": plType,
            "status": status,
            "period_type": periodConfig,
        });
        console.log(result.data.data.bar_chart_info);
        console.log(result.data.data.pie_chart_info);

        setBarChartInfo(result.data.data.bar_chart_info)
        setPieChartInfo(result.data.data.pie_chart_info)
        setYearData(result.data.data.year_info)
        setTodayInfo(result.data.data.today_info)

        if (!pieFirst) {
            setPieData({
                initData: [result.data.data.pie_chart_info.total_margin, result.data.data.pie_chart_info.total_spot],
                Series: [result.data.data.pie_chart_info.total_margin, result.data.data.pie_chart_info.total_spot].map(value => Math.abs(value)),
                Labels: ["Margin", "Spot"]
            })
            setPieFirst(false)
        }

        setIsLoading(false);
    }

    const setPieTitle = (type, value) => {
        setPieType(type);
        setPieName(value);


    }

    const makePieData = () => {

        setPieData({
            initData: pieType === -1 ? [pieChartInfo.total_margin, pieChartInfo.total_spot]
                : pieType === 0 ? Object.values(pieChartInfo.list_spot)
                    : pieType === 1 ? Object.values(pieChartInfo.list_margin)
                        : pieType === 2 ? Object.values(pieChartInfo.list_margin_long)
                            : Object.values(pieChartInfo.list_margin_short),
            Series: pieType === -1 ? [pieChartInfo.total_margin, pieChartInfo.total_spot].map(value => Math.abs(value))
                : pieType === 0 ? Object.values(pieChartInfo.list_spot).map(value => Math.abs(value))
                    : pieType === 1 ? Object.values(pieChartInfo.list_margin).map(value => Math.abs(value))
                        : pieType === 2 ? Object.values(pieChartInfo.list_margin_long).map(value => Math.abs(value))
                            : Object.values(pieChartInfo.list_margin_short).map(value => Math.abs(value)),
            Labels: pieType === -1 ? ["Margin", "Spot"]
                : pieType === 0 ? Object.keys(pieChartInfo.list_spot)
                    : pieType === 1 ? Object.keys(pieChartInfo.list_margin)
                        : pieType === 2 ? Object.keys(pieChartInfo.list_margin_long)
                            : Object.keys(pieChartInfo.list_margin_short)
        })
    }

    const setPeriodType = (type) => {
        const end = new Date();
        let start = new Date();
        if (type === "0") {
            start = subMonths(end, 1);
        } else if (type === "1") {
            start = subWeeks(end, 1);
        } else {
            start = subYears(start, 1);
        }

        setPeriodConfig(type);

        setEndDate(format(end, 'yyyy-MM-dd'));
        setStartDate(format(start, 'yyyy-MM-dd'));
    }

    useEffect(() => {
        init();
    }, [startDate, endDate, plType, status, periodConfig]);

    useEffect(() => {
        makePieData();
    }, [pieType]);

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <div>
            <div className="grid grid-cols-4 gap-8">
                <StatCard title="Realized Profit (CP)" value={todayInfo.real_profit} change={todayInfo.percent_real_profit} isPositive={todayInfo.percent_real_profit > 0} />
                <StatCard title="Total P&L (CP + CL)" value={todayInfo.real_total_profit} change={todayInfo.percent_real_total_profit} isPositive={todayInfo.percent_real_total_profit > 0} />
                <StatCard title="Unrealized Profit (OP)" value={todayInfo.unreal_profit} change={todayInfo.percent_unreal_profit} isPositive={todayInfo.percent_unreal_profit > 0} />
                <StatCard title="Total Unrealized P&L (OP + OL)" value={todayInfo.unreal_total_profit} change={todayInfo.percent_unreal_total_profit} isPositive={todayInfo.percent_unreal_total_profit > 0} />
            </div>
            <div className="flex mt-4 gap-4">
                <Card className="w-2/3 bg-white/5 backdrop-blur-sm shadow-lg rounded-xl">
                    <CardBody className="px-2 pb-0">
                        <div className="flex">
                            <div className="w-1/3">
                                <Typography variant="small" color="dark" className="font-medium text-[16px]">
                                    Period
                                </Typography>
                                <div className="flex">
                                    <div className="w-full">
                                        <input
                                            type="date"
                                            value={startDate}
                                            onClick={(e) => e.currentTarget.showPicker()}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-transparent text-lBLue"
                                        />
                                    </div>
                                    <Typography variant="small" color="white" className="font-medium text-[16px] pt-2 pl-4">
                                        to
                                    </Typography>
                                    <div className="w-full ml-4">
                                        <input
                                            type="date"
                                            value={endDate}
                                            onClick={(e) => e.currentTarget.showPicker()}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-transparent text-lBLue"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 rounded-none md:flex-row md:items-center px-8">
                                <div>
                                    <Typography variant="small" color="dark" className="font-medium text-[16px]">
                                        Granularity
                                    </Typography>
                                    <Select label="Select an option"
                                            size="lg" className="text-lBLue"
                                            onChange={(value) => setPeriodType(value)}
                                            value={periodConfig}
                                    >
                                        <Option value="0">Monthly</Option>
                                        <Option value="1">Weekly</Option>
                                        <Option value="2">Yearly</Option>
                                        <Option value="3">Daily</Option>
                                    </Select>
                                </div>
                                <div>
                                    <Typography variant="small" color="dark" className="font-medium text-[16px]">
                                        P&L
                                    </Typography>
                                    <Select label="Select an option"
                                            size="lg" className="text-lBLue"
                                            value={plType}
                                            onChange={(value) => setPlType(value)}
                                    >
                                        <Option value="-1">All</Option>
                                        <Option value="0">Profit</Option>
                                        <Option value="1">Loss</Option>
                                    </Select>
                                </div>
                                <div>
                                    <Typography variant="small" color="dark" className="font-medium text-[16px]">
                                        Status
                                    </Typography>
                                    <Select label="Select an option"
                                            size="lg" className="text-lBLue"
                                            value={status}
                                            onChange={(value) => setStatus(value)}
                                    >
                                        <Option value="-1">All</Option>
                                        <Option value="0">Open</Option>
                                        <Option value="1">Close</Option>
                                    </Select>
                                </div>
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
                                        Return profit per month
                                    </Typography>
                                    <Typography variant="small" className="text-sm text-gray-500">
                                        (Calculated from closed positions)
                                    </Typography>
                                </div>
                                <InformationCircleIcon className="w-4 h-4 text-gray-500" />
                            </div>

                            <div className="grid grid-cols-3 text-gray-400 text-sm border-b border-gray-700 pb-1 mb-2">
                                <span>Month</span>
                                <span>% Return</span>
                                <span className="text-right">$ Returned</span>
                            </div>

                            {yearData.map((item, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-3 items-center text-sm py-1 text-white"
                                >
                                    <span>{item.month}</span>
                                    <div className="flex items-center gap-1">
                                        <span>{item.percent}%</span>
                                        {item.is_positive ? (
                                            <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <ExclamationCircleIcon className="w-4 h-4 text-red-500" />
                                        )}
                                    </div>
                                    <span className="text-right">{item.profit.toLocaleString("en-US", {style:"currency", currency:"USD"})}</span>
                                </div>
                            ))}
                        </CardBody>
                    </Card>
                    <Card className="bg-white/5 backdrop-blur-sm shadow-lg rounded-xl">
                        <CardBody>
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <Typography variant="small" className="text-gray-300 font-medium">
                                        Return profit per token type
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
                                <Chart {...pchartConfig}/>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
}