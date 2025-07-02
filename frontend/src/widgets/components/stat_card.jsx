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

const StatCard = ({ title, value, change, isPositive }) => {
    return (
        <Card className="bg-white/5 backdrop-blur-sm shadow-lg rounded-xl text-white">
            <CardBody>
                <div className="flex justify-between items-center mb-2">
                    <Typography variant="small" color="blue-gray" className="text-lBLue font-bold text-lg ">
                        {title}
                    </Typography>
                    <InformationCircleIcon className="w-8 h-8 text-gray-500" />
                </div>
                <Typography variant="h4" className="text-white">
                    {value.toLocaleString("en-US", {style:"currency", currency:"USD"})}
                </Typography>
                <div className="flex items-center mt-2">
                    {isPositive ? (
                        <ArrowUpIcon className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                        <ArrowDownIcon className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <Typography
                        variant="small"
                        className={isPositive ? "text-green-500" : "text-red-500"}
                    >
                        {Math.abs(change)} %
                    </Typography>
                </div>
            </CardBody>
        </Card>
    );
};

export default StatCard;
