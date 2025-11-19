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

const ItemEvent = ({ event, onView, onEdit, onDelete, noButton, onClick }) => {
    const hasImage = Boolean(event.image);
    return (
        <Card
            key={event.id}
            onClick={onClick}
            className={`h-[250px] relative border-gray-500 bg-transparent border-2`}
        >
            <CardBody className="flex flex-col justify-center w-full">
                <div className="flex flex-row w-full">
                    <Typography variant="h5" className="text-white">
                        {event.title.length > 50 ? event.title.slice(0, 50 ) + "..." : event.title}
                    </Typography>
                    {
                        !noButton && (
                            <div className="flex gap-2 flex-1">
                                <div className="w-[32px] h-[32px] rounded-full bg-[#687992] ml-auto cursor-pointer" onClick={onView}>
                                    <img
                                        src="/img/zoom.png"
                                        className="mt-2 ml-1.5"
                                    />
                                </div>
                                <div className="w-[32px] h-[32px] rounded-full bg-[#687992] cursor-pointer" onClick={onEdit}>
                                    <img
                                        src="/img/memo_off.png"
                                        className="mt-1.5 ml-1.5"
                                    />
                                </div>
                                <div className="w-[32px] h-[32px] rounded-full bg-[#687992] cursor-pointer" onClick={onDelete}>
                                    <img
                                        src="/img/delete.png"
                                        className="mt-1.5 ml-1.5"
                                    />
                                </div>
                            </div>
                        )
                    }
                </div>
                <Typography className="text-sm text-gray-400">
                    {event.happen_time}
                </Typography>
                <div className="flex flex-row w-full mt-4">
                    {hasImage && (
                        <div className="w-1/3 min-w-[120px] max-w-[160px] h-[120px] mr-4">
                            <img
                                src={event.image}
                                alt={event.title}
                                className="h-full w-full object-cover rounded-2xl"
                            />
                        </div>
                    )}
                    <Typography className="text-md text-white line-clamp-4 flex-1">
                        {event.content.length > (noButton ? 400 : 120)
                            ? event.content.slice(0, hasImage ? 180 : 300) + "..."
                            : event.content}
                    </Typography>
                </div>

            </CardBody>
        </Card>
    );
};

export default ItemEvent;
