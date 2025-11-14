import {
    Accordion, AccordionBody, AccordionHeader, Alert,
    Button,
    Card,
    CardBody, Carousel, Checkbox, Dialog, DialogBody, DialogFooter, DialogHeader, IconButton,
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
import {ArrowDownIcon, ArrowUpIcon, XMarkIcon} from "@heroicons/react/24/solid/index.js";
import eventService from "@/api/eventService.jsx";

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
    const [pieName, setPieName] = useState("Margin");

    const [yearData, setYearData] = useState([]);
    const [todayInfo, setTodayInfo] = useState({})

    const [pieData1, setPieData1] = useState({})
    const [pieData2, setPieData2] = useState({})
    const [pieData3, setPieData3] = useState({})
    const [pieData4, setPieData4] = useState({})
    const [pieData5, setPieData5] = useState({})

    const [evList, setEvList] = useState([]);
    const [open, setOpen] = React.useState(0);
    const handleOpen = (value) => setOpen(open === value ? -1 : value);

    const [eventShow, setEventShow] = useState(null);

    const showSetting = localStorage.getItem('show_setting');
    let va = true;
    if (showSetting !== null && showSetting !== "") {
        const v = showSetting.split('#')[0]
        const da = showSetting.split('#')[1]
        if (da === format(new Date(), 'yyyy-MM-dd')) {
            va = v === '1';
        } else {
            va = false;
        }
    } else {
        va = false;
    }
    const [showAgain, setShowAgain] = useState(va);
    const [eventModalOpen, setEventModalOpen] = useState(!va);

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
                stacked: false,
            },
            title: {
                show: "",
            },
            dataLabels: {
                enabled: false,
            },
            colors: ["#7c39c8", "#2de3f8", "#088de4", "#294d85"],
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
                        show: false,
                    },
                },
                yaxis: {
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
                name: "Total P&L",
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
            colors: ["#44e6f9"],
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
                        show: false,
                    },
                },
                yaxis: {
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
        setEvList(result.data.data.upcoming_event);
        if (result.data.data.upcoming_event.length > 0) {
            setEventShow(result.data.data.upcoming_event[result.data.data.upcoming_event.length - 1]);
        }

        makePieData(result.data.data.pie_chart_info);
        setPieTitle(-1, "All");

        setIsLoading(false);
    }

    const setPieTitle = (type, value) => {
        setPieType(type);
        if (type > 0) setPieName(value);
    }

    const get_upcoming_events = async () => {
        const result = await eventService.upcoming();

    }

    const makePieData = (data) => {
        setPieData1({
            type: "donut",
            width: 400,
            height: 280,
            series: Object.values(data.all).map(value => Math.abs(value)),
            options: {
                chart: {
                    toolbar: { show: false },
                },
                labels: Object.keys(data.all),
                colors: ["#00E8FF", "#9C27B0"], // cyan & purple
                stroke: {
                    show: false,       // ✅ hides borders
                    width: 0,          // ✅ no border width
                },
                dataLabels: {
                    enabled: true,
                    formatter: function (val) {
                        return val.toFixed(0) + " %";
                    },
                    style: {
                        fontSize: "16px",
                        fontWeight: "bold",
                        colors: ["#fff"],
                    },
                    dropShadow: { enabled: false },
                },
                legend: {
                    show: true,
                    position: "right",
                    fontSize: "16px",
                    labels: {
                        colors: "#fff",
                    },
                    markers: {
                        width: 10,
                        height: 24,
                        radius: 12,
                    },
                    itemMargin: {
                        horizontal: 10,
                        vertical: 20,
                    },
                    formatter: function (seriesName) {
                        return seriesName.charAt(0).toUpperCase() + seriesName.slice(1);
                    },
                },
                fill: {
                    type: "gradient",
                },
                plotOptions: {
                    pie: {
                        donut: {
                            size: "70%",
                        },
                    },
                },
                tooltip: {
                    y: {
                        formatter: function (val, opts) {
                            const init = Object.values(data.all);
                            const originalValue = init[opts.seriesIndex];
                            return originalValue.toFixed(2).toString();
                        },
                        title: {
                            formatter: function (seriesName, opts) {
                                const labels = Object.keys(data.all);
                                return labels[opts.seriesIndex];
                            },
                        },
                    },
                },
            },
        });

        setPieData2({
            type: "donut",
            width: 400,
            height: 280,
            series: Object.values(data.list_spot).map(value => Math.abs(value)),
            options: {
                chart: {
                    toolbar: {
                        show: false,
                    },
                },
                labels: Object.keys(data.list_spot),
                stroke: {
                    show: false,       // ✅ hides borders
                    width: 0,          // ✅ no border width
                },
                dataLabels: {
                    enabled: true,
                    formatter: function (val) {
                        return val.toFixed(0) + " %";
                    },
                    style: {
                        fontSize: "16px",
                        fontWeight: "bold",
                        colors: ["#fff"],
                    },
                    dropShadow: { enabled: false },
                },
                title: {
                    show: "",
                },
                legend: {
                    show: true,
                    position: "right",
                    fontSize: "14px",
                    labels: {
                        colors: "#fff",
                    },
                    markers: {
                        width: 10,
                        height: 15,
                        radius: 12,
                    },
                    itemMargin: {
                        horizontal: 10,
                        vertical: 4,
                    },
                    formatter: function (seriesName) {
                        return seriesName.charAt(0).toUpperCase() + seriesName.slice(1);
                    },
                },
                fill: {
                    type: "gradient",
                },
                plotOptions: {
                    pie: {
                        donut: {
                            size: "70%",
                        },
                    },
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
            type: "donut",
            width: 400,
            height: 280,
            series: Object.values(data.list_margin).map(value => Math.abs(value)),
            options: {
                chart: {
                    toolbar: {
                        show: false,
                    },
                },
                labels: Object.keys(data.list_margin),
                stroke: {
                    show: false,       // ✅ hides borders
                    width: 0,          // ✅ no border width
                },
                dataLabels: {
                    enabled: true,
                    formatter: function (val) {
                        return val.toFixed(0) + " %";
                    },
                    style: {
                        fontSize: "16px",
                        fontWeight: "bold",
                        colors: ["#fff"],
                    },
                    dropShadow: { enabled: false },
                },
                title: {
                    show: "",
                },
                legend: {
                    show: true,
                    position: "right",
                    fontSize: "14px",
                    labels: {
                        colors: "#fff",
                    },
                    markers: {
                        width: 12,
                        height: 24,
                        radius: 12,
                    },
                    itemMargin: {
                        horizontal: 10,
                        vertical: 20,
                    },
                    formatter: function (seriesName) {
                        return seriesName.charAt(0).toUpperCase() + seriesName.slice(1);
                    },
                },
                fill: {
                    type: "gradient",
                },
                plotOptions: {
                    pie: {
                        donut: {
                            size: "70%",
                        },
                    },
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
            type: "donut",
            width: 400,
            height: 280,
            series: Object.values(data.list_margin_long).map(value => Math.abs(value)),
            options: {
                chart: {
                    toolbar: {
                        show: false,
                    },
                },
                labels: Object.keys(data.list_margin_long),
                stroke: {
                    show: false,       // ✅ hides borders
                    width: 0,          // ✅ no border width
                },
                title: {
                    show: "",
                },
                dataLabels: {
                    enabled: true,
                    formatter: function (val) {
                        return val.toFixed(0) + " %";
                    },
                    style: {
                        fontSize: "16px",
                        fontWeight: "bold",
                        colors: ["#fff"],
                    },
                    dropShadow: { enabled: false },
                },
                legend: {
                    show: true,
                    position: "right",
                    fontSize: "14px",
                    labels: {
                        colors: "#fff",
                    },
                    markers: {
                        width: 12,
                        height: 12,
                        radius: 12,
                    },
                    itemMargin: {
                        horizontal: 10,
                        vertical: 4,
                    },
                    formatter: function (seriesName) {
                        return seriesName.charAt(0).toUpperCase() + seriesName.slice(1);
                    },
                },
                fill: {
                    type: "gradient",
                },
                plotOptions: {
                    pie: {
                        donut: {
                            size: "70%",
                        },
                    },
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
            type: "donut",
            width: 400,
            height: 280,
            series: Object.values(data.list_margin_short).map(value => Math.abs(value)),
            options: {
                chart: {
                    toolbar: {
                        show: false,
                    },
                },
                labels: Object.keys(data.list_margin_short),
                stroke: {
                    show: false,       // ✅ hides borders
                    width: 0,          // ✅ no border width
                },
                title: {
                    show: "",
                },
                dataLabels: {
                    enabled: true,
                    formatter: function (val) {
                        return val.toFixed(0) + " %";
                    },
                    style: {
                        fontSize: "16px",
                        fontWeight: "bold",
                        colors: ["#fff"],
                    },
                    dropShadow: { enabled: false },
                },
                legend: {
                    show: true,
                    position: "right",
                    fontSize: "14px",
                    labels: {
                        colors: "#fff",
                    },
                    markers: {
                        width: 12,
                        height: 12,
                        radius: 12,
                    },
                    itemMargin: {
                        horizontal: 10,
                        vertical: 4,
                    },
                    formatter: function (seriesName) {
                        return seriesName.charAt(0).toUpperCase() + seriesName.slice(1);
                    },
                },
                fill: {
                    type: "gradient",
                },
                plotOptions: {
                    pie: {
                        donut: {
                            size: "70%",
                        },
                    },
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
            <div className="flex">
                <Card className="shadow-lg rounded-xl bg-transparent w-1/3">
                    <CardBody>
                        <div className="flex justify-between items-center mb-2">
                            <Typography color="blue-gray" className="text-white text-[20px] ">
                                {"Total Volume"}
                            </Typography>
                        </div>
                        <Typography className="text-white font-bold text-[40px] ">
                            {todayInfo.total_order.toLocaleString("en-US", {style:"currency", currency:"USD"})}
                        </Typography>
                        <div className="flex items-center mt-2">
                            {todayInfo.percent_total_order > 0 ? (
                                <ArrowUpIcon className="w-4 h-4 text-green-500 mr-1" />
                            ) : (
                                <ArrowDownIcon className="w-4 h-4 text-red-500 mr-1" />
                            )}
                            <Typography
                                className={`text-[20px] ${todayInfo.percent_total_order > 0 ? "text-green-500" : "text-red-500"}`}
                            >
                                {Math.abs(todayInfo.percent_total_order)} %
                            </Typography>
                        </div>
                    </CardBody>
                </Card>
                <div className="grid grid-cols-4 gap-4 flex-1">
                    <StatCard title="Realized Profit" type={1} value={todayInfo.real_profit} change={todayInfo.percent_real_profit} isPositive={todayInfo.percent_real_profit > 0} />
                    <StatCard title="Total P&L" type={1} value={todayInfo.real_total_profit} change={todayInfo.percent_real_total_profit} isPositive={todayInfo.percent_real_total_profit > 0} />
                    <StatCard title="Unrealized Profit" type={2} value={todayInfo.unreal_profit} change={todayInfo.percent_unreal_profit} isPositive={todayInfo.percent_unreal_profit > 0} />
                    <StatCard title="Total Unrealized P&L" type={2} value={todayInfo.unreal_total_profit} change={todayInfo.percent_unreal_total_profit} isPositive={todayInfo.percent_unreal_total_profit > 0} />
                </div>
            </div>
            <div className="flex mt-4 gap-4">
                <div className="w-2/3 ">
                    <Card className="bg-sidebar backdrop-blur-sm shadow-lg rounded-xl">
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
                                                className="w-full px-3 py-2 bg-cBlue3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-lBLue"
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
                                                className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-cBlue3 text-lBLue"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 gap-20 rounded-none md:flex-row md:items-center px-2">
                                    <div>
                                        <Typography variant="small" color="dark" className="font-medium text-[16px]">
                                            Granularity
                                        </Typography>
                                        <Select label=""
                                                size="md" className="text-lBLue bg-cBlue3 focus:outline-none border-none !border-t-transparent focus:!border-t-transparent data-[open=true]:!border-t-transparent"
                                                onChange={(value) => setPeriodType(value)}
                                                value={periodConfig}
                                                labelProps={{
                                                    // kill the notch lines + white patch behind the label
                                                    className:
                                                        "before:!border-0 after:!border-0 " +    // no borders on the pseudo parts
                                                        "before:!bg-transparent after:!bg-transparent"
                                                }}
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
                                        <Select label=""
                                                size="md" className="text-lBLue bg-cBlue3 focus:outline-none border-none !border-t-transparent focus:!border-t-transparent data-[open=true]:!border-t-transparent"
                                                value={plType}
                                                onChange={(value) => setPlType(value)}
                                                labelProps={{
                                                    // kill the notch lines + white patch behind the label
                                                    className:
                                                        "before:!border-0 after:!border-0 " +    // no borders on the pseudo parts
                                                        "before:!bg-transparent after:!bg-transparent"
                                                }}
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
                                        <Select label=""
                                                size="md" className="text-lBLue bg-cBlue3 focus:outline-none border-none !border-t-transparent focus:!border-t-transparent data-[open=true]:!border-t-transparent"
                                                value={status}
                                                onChange={(value) => setStatus(value)}
                                                labelProps={{
                                                    // kill the notch lines + white patch behind the label
                                                    className:
                                                        "before:!border-0 after:!border-0 " +    // no borders on the pseudo parts
                                                        "before:!bg-transparent after:!bg-transparent"
                                                }}
                                        >
                                            <Option value="-1">All</Option>
                                            <Option value="0">Open</Option>
                                            <Option value="1">Close</Option>
                                        </Select>
                                    </div>
                                    <Button style={{width:'100px'}} onClick={applyFilter} className="mt-6 bg-gradient-to-br from-[#0023af] via-[#006ec1] to-[#00a0ce] " hidden={false}>
                                        Apply
                                    </Button>
                                </div>
                            </div>
                            <Chart {...chartConfig} />
                        </CardBody>
                    </Card>
                    <Card className="bg-sidebar backdrop-blur-sm shadow-lg rounded-xl mt-4">
                        <CardBody className="px-2 pb-0">
                            <Chart {...lchartConfig} />
                        </CardBody>
                    </Card>
                </div>
                <div className="w-1/3 grid grid-rows-2 gap-4 max-h-[1000px]">
                    <Card className="bg-sidebar backdrop-blur-sm shadow-lg rounded-xl">
                        <CardBody>
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <Typography className="text-gray-300 text-[20px]">
                                        Spot & Margin Rate
                                    </Typography>
                                </div>
                                <Button onClick={() => setPieTitle(-1, "All")} color={pieType === -1 ? 'light-blue' : 'black'}>All</Button>
                                <Button onClick={() => setPieTitle(0, "Spot")} color={pieType === 0 ? 'light-blue' : 'black'}>Spot</Button>
                                <Menu>
                                    <MenuHandler>
                                        <Button color={pieType > 0 ? 'light-blue' : 'black'}>{pieName}</Button>
                                    </MenuHandler>
                                    <MenuList>
                                        <MenuItem onClick={() => setPieTitle(1, "Margin")}>Margin</MenuItem>
                                        <MenuItem onClick={() => setPieTitle(2, "Long")}>Long</MenuItem>
                                        <MenuItem onClick={() => setPieTitle(3, "Short")}>Short</MenuItem>
                                    </MenuList>
                                </Menu>
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
                    <Card className="bg-sidebar backdrop-blur-sm shadow-lg rounded-xl scrollbar relative">
                        <CardBody>
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <Typography className="text-gray-300 text-[20px]">
                                        Return profit per month
                                    </Typography>
                                    <Typography variant="small" className="text-lBLue1 mt-2">
                                        (Calculated from closed positions)
                                    </Typography>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 text-gray-400 text-[20px] pb-1 mb-2">
                                <span>Month</span>
                                <span>% Month</span>
                                <span className="text-right">$ Returned</span>
                            </div>

                            {yearData.map((item, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-3 items-center text-[17px] py-1 text-gray-300"
                                >
                                    <span>{item.month}</span>
                                    <div className="flex items-center gap-1">
                                        <span>{item.percent}%</span>
                                        {/*{item.is_positive ? (*/}
                                        {/*    <CheckCircleIcon className="w-4 h-4 text-green-500" />*/}
                                        {/*) : (*/}
                                        {/*    <ExclamationCircleIcon className="w-4 h-4 text-red-500" />*/}
                                        {/*)}*/}
                                    </div>
                                    <span className="text-right">{item.profit.toLocaleString("en-US", {style:"currency", currency:"USD"})}</span>
                                </div>
                            ))}
                        </CardBody>
                        {
                            eventShow !== null &&
                            <div className="absolute right-0 bottom-0 w-2/3 h-[150px] bg-[#1169f3] rounded-xl px-4 py-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-400 text-[16px] mt-2">{eventShow.happen_time}</span>
                                    <IconButton variant="text" onClick={() => setEventShow(null)}>
                                        <div className="w-[32px] h-[32px] rounded-full text-white p-1">
                                            <XMarkIcon className=""/>
                                        </div>
                                    </IconButton>
                                </div>
                                <Typography
                                    color="white"
                                    className="mb-1 text-[20px]"
                                >
                                    {
                                        eventShow.content.length > 400
                                            ? eventShow.content.slice(0, 120) + "..."
                                            : eventShow.content
                                    }
                                </Typography>
                            </div>
                        }
                    </Card>
                    {/*<Dialog open={viewModalOpen} handler={() => setViewModalOpen(false)} size="lg">*/}
                    {/*    <div className="flex justify-between items-center px-4 pt-4">*/}
                    {/*        <DialogHeader>{selectedEvent?.title}</DialogHeader>*/}
                    {/*        <IconButton variant="text" onClick={() => setViewModalOpen(false)}>*/}
                    {/*            <XMarkIcon className="w-6 h-6" />*/}
                    {/*        </IconButton>*/}
                    {/*    </div>*/}
                    {/*    <DialogBody className="px-6 pb-4 space-y-4">*/}
                    {/*        <div className="max-h-[80vh] overflow-y-auto px-4">*/}
                    {/*            {selectedEvent?.image && (*/}
                    {/*                <img*/}
                    {/*                    src={selectedEvent.image}*/}
                    {/*                    alt="Memo"*/}
                    {/*                    className="max-w-full rounded-lg"*/}
                    {/*                />*/}
                    {/*            )}*/}
                    {/*            <p className="text-gray-800 whitespace-pre-wrap">*/}
                    {/*                {selectedEvent?.content}*/}
                    {/*            </p>*/}
                    {/*        </div>*/}
                    {/*    </DialogBody>*/}
                    {/*</Dialog>*/}
                </div>
            </div>

            {/*<Dialog open={eventModalOpen} handler={() => setEventModalOpen(false)}>*/}
            {/*    <DialogHeader>Upcoming Events</DialogHeader>*/}
            {/*    <DialogBody className="max-h-[70vh] overflow-y-auto">*/}
            {/*    {*/}
            {/*        evList.map((event, index) => (*/}
            {/*            <Accordion open={open === index} className="mb-2 rounded-lg border border-blue-gray-100 px-4">*/}
            {/*                <AccordionHeader*/}
            {/*                    onClick={() => handleOpen(index)}*/}
            {/*                    className={`border-b-0 transition-colors ${*/}
            {/*                        open === index ? "text-blue-500 hover:!text-blue-700" : ""*/}
            {/*                    }`}*/}
            {/*                >*/}
            {/*                    {event.title}*/}
            {/*                </AccordionHeader>*/}
            {/*                <AccordionBody className="pt-0 text-base font-normal">*/}
            {/*                    <div className="max-h-[80vh] overflow-y-auto px-4">*/}
            {/*                        {event?.image && (*/}
            {/*                            <img*/}
            {/*                                src={event.image}*/}
            {/*                                alt="Memo"*/}
            {/*                                className="max-w-full rounded-lg"*/}
            {/*                            />*/}
            {/*                        )}*/}
            {/*                        <p className="text-gray-800 whitespace-pre-wrap">*/}
            {/*                            {event?.content}*/}
            {/*                        </p>*/}
            {/*                    </div>*/}
            {/*                </AccordionBody>*/}
            {/*            </Accordion>*/}
            {/*        ))*/}
            {/*    }*/}
            {/*        {*/}
            {/*            evList.length === 0 &&*/}
            {/*            <Typography*/}
            {/*                variant="h4"*/}
            {/*                color="gray"*/}
            {/*                className="flex items-center justify-start font-medium"*/}
            {/*            >*/}
            {/*                There are no events yet within 3 days.*/}
            {/*            </Typography>*/}
            {/*        }*/}
            {/*    </DialogBody>*/}
            {/*    <DialogFooter>*/}
            {/*        <Checkbox*/}
            {/*            label={*/}
            {/*                <Typography*/}
            {/*                    variant="small"*/}
            {/*                    color="gray"*/}
            {/*                    className="flex items-center justify-start font-medium"*/}
            {/*                >*/}
            {/*                    Don't show this again today.*/}
            {/*                </Typography>*/}
            {/*            }*/}
            {/*            value={showAgain}*/}
            {/*            onChange={(e) => setShowAgain(e.currentTarget.checked)}*/}
            {/*            containerProps={{ className: "-ml-2.5" }}*/}
            {/*        />*/}
            {/*        <Button className="ml-auto" variant="filled" onClick={() => {*/}
            {/*            if (showAgain) {*/}
            {/*                localStorage.setItem("show_setting", "1#" + format(new Date(), 'yyyy-MM-dd'))*/}
            {/*            }*/}
            {/*            setEventModalOpen(false)*/}
            {/*        }}>Close</Button>*/}
            {/*    </DialogFooter>*/}
            {/*</Dialog>*/}
        </div>
    );
}