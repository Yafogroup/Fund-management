// components/StatCard.tsx
import {
    Card,
    CardBody,
    Typography,
} from "@material-tailwind/react";
import {
    ArrowUpIcon,
    ArrowDownIcon,
    InformationCircleIcon,
} from "@heroicons/react/24/solid";

const StatCard = ({ title, value, change, isPositive, type }) => {
    return (
        <Card className={`backdrop-blur-sm shadow-lg rounded-xl text-white ${type === 1 ? "bg-gradient-to-br from-[#0d1726] via-[#0d1826] to-[#10511e] " : "bg-gradient-to-br from-[#0d1726] via-[#181b29] to-[#471520] "}`}>
            <CardBody className="">
                <div className="flex justify-between items-center">
                    <Typography color="blue-gray" className="text-white text-[18px] ">
                        {title}
                    </Typography>
                </div>
                <Typography className="text-white text-[28px] font-bold">
                    {value.toLocaleString("en-US", {style:"currency", currency:"USD"})}
                </Typography>
                <div className="flex items-center">
                    {isPositive ? (
                        <ArrowUpIcon className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                        <ArrowDownIcon className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <Typography
                        className={isPositive ? "text-green-500 font-bold text-[20px]" : "text-red-500 font-bold text-[20px]"}
                    >
                        {Math.abs(change)} %
                    </Typography>
                </div>
            </CardBody>
        </Card>
    );
};

export default StatCard;
