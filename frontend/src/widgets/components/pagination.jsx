import React from "react";
import { Button, IconButton } from "@material-tailwind/react";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import {any} from "prop-types";

export function Pagination({page, onPageChange}) {
    const [active, setActive] = React.useState(1);

    const getItemProps = (index) =>
        ({
            variant: active === index ? "filled" : "text",
            color: "blue",
            onClick: () => {
                setActive(index);
                onPageChange(index);
            },
            className: "rounded-full",
        });

    const next = () => {
        if (active === page) return;

        setActive(active + 1);
        onPageChange(active + 1);
    };

    const prev = () => {
        if (active === 1) return;

        setActive(active - 1);
        onPageChange(active - 1);
    };

    return (
        <div className="flex items-center gap-4">
            <Button
                variant="text"
                className="flex items-center gap-2 rounded-full text-lBLue"
                onClick={prev}
                disabled={active === 1}
            >
                <ArrowLeftIcon strokeWidth={2} className="h-4 w-4" /> Previous
            </Button>
            <div className="flex items-center gap-2">
                {
                    [...Array(page)].map((x, i) =>
                        <IconButton {...getItemProps(i+1)}>{i+1}</IconButton>
                    )
                }
            </div>
            <Button
                variant="text"
                className="flex items-center gap-2 rounded-full text-lBLue"
                onClick={next}
                disabled={active === page}
            >
                Next
                <ArrowRightIcon strokeWidth={2} className="h-4 w-4" />
            </Button>
        </div>
    );
}