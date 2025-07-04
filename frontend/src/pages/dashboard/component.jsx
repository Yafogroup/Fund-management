import {
    Button,
    Card,
    CardBody, Carousel, Dialog, DialogBody, DialogHeader, IconButton,
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
import ItemEvent from "@/widgets/components/item_event.jsx";
import {XMarkIcon} from "@heroicons/react/24/solid/index.js";

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
    const [periodConfig, setPeriodConfig] = useState("0")
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

    const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    const [pieType, setPieType] = useState(-1);
    const [pieName, setPieName] = useState("All");

    const [yearData, setYearData] = useState([]);
    const [todayInfo, setTodayInfo] = useState({})

    const [pieData1, setPieData1] = useState({})
    const [pieData2, setPieData2] = useState({})
    const [pieData3, setPieData3] = useState({})
    const [pieData4, setPieData4] = useState({})
    const [pieData5, setPieData5] = useState({})

    const [eventList, setEventList] = useState([])
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const handleView = (event) => {
        setSelectedEvent(event);
        setViewModalOpen(true);
    };

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

    const init = async () => {
        setIsLoading(true);
        const result = await dashboardService.get_info({
            "start_date": startDate,
            "end_date": endDate,
            "pl": plType,
            "status": status,
            "period_type": periodConfig,
        });
        console.log(result.data.data.event_list);

        setBarChartInfo(result.data.data.bar_chart_info);
        setYearData(result.data.data.year_info);
        setTodayInfo(result.data.data.today_info);
        setEventList(result.data.data.event_list);

        makePieData(result.data.data.pie_chart_info);
        setPieTitle(-1, "All");

        setIsLoading(false);
    }

    const setPieTitle = (type, value) => {
        setPieType(type);
        setPieName(value);


    }

    const makePieData = (data) => {
        setPieData1({
            type: "pie",
            width: 280,
            height: 280,
            labels: Object.keys(data.all),
            series: Object.values(data.all).map(value => Math.abs(value)),
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
                tooltip: {
                    y: {
                        formatter: function (val, opts) {
                            const init = Object.values(data.all);
                            const originalValue = init[opts.seriesIndex];
                            return originalValue.toFixed(2).toString();
                        },
                        title: {
                            formatter: function(seriesName) {
                                const labels = Object.keys(data.all);
                                return labels[Number(seriesName.substring(seriesName.length - 1)) - 1];
                            }
                        }
                    }
                },
            },
        });
        setPieData2({
            type: "pie",
            width: 280,
            height: 280,
            labels: Object.keys(data.list_spot),
            series: Object.values(data.list_spot).map(value => Math.abs(value)),
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
                tooltip: {
                    y: {
                        formatter: function (val, opts) {
                            const init = Object.values(data.list_spot);
                            const originalValue = init[opts.seriesIndex];
                            return originalValue.toFixed(2).toString();
                        },
                        title: {
                            formatter: function(seriesName) {
                                const labels = Object.keys(data.list_spot);
                                return labels[Number(seriesName.substring(seriesName.length - 1)) - 1];
                            }
                        }
                    }
                },
            },
        });
        setPieData3({
            type: "pie",
            width: 280,
            height: 280,
            labels: Object.keys(data.list_margin),
            series: Object.values(data.list_margin).map(value => Math.abs(value)),
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
                tooltip: {
                    y: {
                        formatter: function (val, opts) {
                            const init = Object.values(data.list_margin);
                            const originalValue = init[opts.seriesIndex];
                            return originalValue.toFixed(2).toString();
                        },
                        title: {
                            formatter: function(seriesName) {
                                const labels = Object.keys(data.list_margin);
                                return labels[Number(seriesName.substring(seriesName.length - 1)) - 1];
                            }
                        }
                    }
                },
            },
        })
        setPieData4({
            type: "pie",
            width: 280,
            height: 280,
            labels: Object.keys(data.list_margin_long),
            series: Object.values(data.list_margin_long).map(value => Math.abs(value)),
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
                tooltip: {
                    y: {
                        formatter: function (val, opts) {
                            const init = Object.values(data.list_margin_long);
                            const originalValue = init[opts.seriesIndex];
                            return originalValue.toFixed(2).toString();
                        },
                        title: {
                            formatter: function(seriesName) {
                                const labels = Object.keys(data.list_margin_long);
                                return labels[Number(seriesName.substring(seriesName.length - 1)) - 1];
                            }
                        }
                    }
                },
            },
        })
        setPieData5({
            type: "pie",
            width: 280,
            height: 280,
            labels: Object.keys(data.list_margin_short),
            series: Object.values(data.list_margin_short).map(value => Math.abs(value)),
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
                tooltip: {
                    y: {
                        formatter: function (val, opts) {
                            const init = Object.values(data.list_margin_short);
                            const originalValue = init[opts.seriesIndex];
                            return originalValue.toFixed(2).toString();
                        },
                        title: {
                            formatter: function(seriesName) {
                                const labels = Object.keys(data.list_margin_short);
                                return labels[Number(seriesName.substring(seriesName.length - 1)) - 1];
                            }
                        }
                    }
                },
            },
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

    const setCustomDataRage = (value, type) => {
        if (type === 0) {
            setStartDate(value);
        } else {
            setEndDate(value);
        }
        setPeriodConfig("-1");
        setPlType("-1")
        setStatus("-1")
    }

    const applyFilter = () => {
        init();
    }

    useEffect(() => {
        init();
    }, []);


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
                                            onChange={(e) => setCustomDataRage(e.target.value, 0)}
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
                                            onChange={(e) => setCustomDataRage(e.target.value, 1)}
                                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-transparent text-lBLue"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 gap-20 rounded-none md:flex-row md:items-center px-8">
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
                                <Button color="blue" style={{width:'100px'}} onClick={applyFilter} className="mt-6">
                                    Apply
                                </Button>
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
                            <div className="mt-8 grid place-items-center px-2 relative">
                                <div className="absolute top-4" hidden={pieType !== -1}>
                                    <Chart {...pieData1}/>
                                </div>
                                <div className="absolute top-4" hidden={pieType !== 0}>
                                    <Chart {...pieData2}/>
                                </div>
                                <div className="absolute top-4" hidden={pieType !== 1}>
                                    <Chart {...pieData3}/>
                                </div>
                                <div className="absolute top-4" hidden={pieType !== 2}>
                                    <Chart {...pieData4}/>
                                </div>
                                <div className="absolute top-4" hidden={pieType !== 3}>
                                    <Chart {...pieData5}/>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                    <Dialog open={viewModalOpen} handler={() => setViewModalOpen(false)} size="lg">
                        <div className="flex justify-between items-center px-4 pt-4">
                            <DialogHeader>{selectedEvent?.title}</DialogHeader>
                            <IconButton variant="text" onClick={() => setViewModalOpen(false)}>
                                <XMarkIcon className="w-6 h-6" />
                            </IconButton>
                        </div>
                        <DialogBody className="px-6 pb-4 space-y-4">
                            <div className="max-h-[80vh] overflow-y-auto px-4">
                                {selectedEvent?.image && (
                                    <img
                                        src={selectedEvent.image}
                                        alt="Memo"
                                        className="max-w-full rounded-lg"
                                    />
                                )}
                                <p className="text-gray-800 whitespace-pre-wrap">
                                    {selectedEvent?.content}
                                </p>
                            </div>
                        </DialogBody>
                    </Dialog>
                </div>
            </div>
            <Carousel className="rounded-xl mt-4"
                  autoplay={true}
                  loop={true}
                  prevArrow={({ handlePrev }) => (
                      <IconButton
                          variant="text"
                          color="light-blue"
                          size="lg"
                          onClick={handlePrev}
                          className="!absolute top-2/4 left-4 -translate-y-2/4"
                      >
                          <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              className="h-6 w-6"
                          >
                              <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                              />
                          </svg>
                      </IconButton>
                  )}
                  nextArrow={({ handleNext }) => (
                      <IconButton
                          variant="text"
                          color="light-blue"
                          size="lg"
                          onClick={handleNext}
                          className="!absolute top-2/4 !right-4 -translate-y-2/4"
                      >
                          <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              className="h-6 w-6"
                          >
                              <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                              />
                          </svg>
                      </IconButton>
                  )}
                  navigation={({ setActiveIndex, activeIndex, length }) => (
                      <div className="absolute bottom-4 left-2/4 z-50 flex -translate-x-2/4 gap-2">
                          {new Array(length).fill("").map((_, i) => (
                              <span
                                  key={i}
                                  className={`block h-1 cursor-pointer rounded-2xl transition-all content-[''] ${
                                      activeIndex === i ? "w-8 bg-black" : "w-4 bg-black/50"
                                  }`}
                                  onClick={() => setActiveIndex(i)}
                              />
                          ))}
                      </div>
                  )}
            >
                {
                    eventList.map((event, index) => (
                        <ItemEvent
                            event={event}
                            key={index}
                            onClick={() => handleView(event)}
                            noButton={true}
                        />
                    ))
                }
            </Carousel>
        </div>
    );
}