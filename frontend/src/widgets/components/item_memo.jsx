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
            className={`h-[250px] border-gray-500 bg-transparent border-2`}
        >
            <CardBody className="flex flex-col justify-center w-full">
                <div className="flex flex-row w-full">
                    <Typography variant="h5" className="text-white">
                        {memo.title.length > 50 ? memo.title.slice(0, 50 ) + "..." : memo.title}
                    </Typography>
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
                </div>
                <Typography className="text-sm text-gray-400">
                    {memo.created_at}
                </Typography>
                <div className="flex flex-row w-full mt-4">
                    {hasImage && (
                        <div className="w-1/3 min-w-[120px] max-w-[160px] h-[120px] mr-4">
                            <img
                                src={memo.image}
                                alt={memo.title}
                                className="h-full w-full object-cover rounded-2xl"
                            />
                        </div>
                    )}
                    <Typography className="text-sm text-white line-clamp-4 flex-1">
                        {memo.content.slice(0, hasImage ? 250 : 400) + "..."}
                    </Typography>
                </div>

            </CardBody>
        </Card>
    );
};

export default ItemMemo;
