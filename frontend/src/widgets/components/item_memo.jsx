import React from "react";
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Tooltip,
    IconButton,
} from "@material-tailwind/react";
import {PencilIcon, EyeIcon, TrashIcon} from "@heroicons/react/24/solid";

const ItemMemo = ({ memo, onView, onEdit, onDelete }) => {
    const hasImage = Boolean(memo.image);
    return (
        <Card
            key={memo.id}
            className={`relative shadow-md hover:shadow-lg transition-shadow duration-300 ${
                hasImage ? "flex flex-row" : "flex flex-col"
            }`}
        >
            {hasImage && (
                <div className="w-1/3 min-w-[120px] max-w-[160px] h-full">
                    <img
                        src={memo.image}
                        alt={memo.title}
                        className="h-full w-full object-cover rounded-l-md"
                    />
                </div>
            )}

            {/* Buttons in top-right */}
            <div className="absolute top-2 right-2 flex gap-2 z-10">
                <Tooltip content="View">
                    <IconButton
                        size="sm"
                        color="blue"
                        onClick={onView}
                    >
                        <EyeIcon className="h-4 w-4" />
                    </IconButton>
                </Tooltip>
                <Tooltip content="Edit">
                    <IconButton
                        size="sm"
                        color="green"
                        onClick={onEdit}
                    >
                        <PencilIcon className="h-4 w-4" />
                    </IconButton>
                </Tooltip>
                <Tooltip content="Edit">
                    <IconButton
                        size="sm"
                        color="red"
                        onClick={onDelete}
                    >
                        <TrashIcon className="h-4 w-4" />
                    </IconButton>
                </Tooltip>
            </div>

            <CardBody className="flex flex-col justify-center w-full p-4">
                <Typography variant="h6" className="mb-1 text-blue-gray-900">
                    {memo.title}
                </Typography>
                <Typography className="text-sm text-gray-700 line-clamp-3">
                    {memo.content.length > 120
                        ? memo.content.slice(0, 120) + "..."
                        : memo.content}
                </Typography>
                <Typography className="text-sm text-gray-700 text-right absolute bottom-2 right-4">
                    {memo.created_at}
                </Typography>
            </CardBody>
        </Card>
    );
};

export default ItemMemo;
