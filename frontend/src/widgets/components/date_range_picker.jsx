import React, {useState, useRef, useEffect} from 'react';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DateRangePicker = () => {
    const [showDatepicker, setShowDatepicker] = useState(false);
    const [dateFromYmd, setDateFromYmd] = useState('');
    const [dateToYmd, setDateToYmd] = useState('');
    const [outputDateFromValue, setOutputDateFromValue] = useState('');
    const [outputDateToValue, setOutputDateToValue] = useState('');
    const [dateFrom, setDateFrom] = useState(null);
    const [dateTo, setDateTo] = useState(null);
    const [endToShow, setEndToShow] = useState('');
    const [selecting, setSelecting] = useState(false);
    const [month, setMonth] = useState(new Date().getMonth());
    const [year, setYear] = useState(new Date().getFullYear());
    const [noOfDays, setNoOfDays] = useState([]);
    const [blankdays, setBlankdays] = useState([]);

    const datepickerRef = useRef(null);

    const convertFromYmd = (dateYmd) => {
        if (!dateYmd) return null;
        const year = Number(dateYmd.substr(0, 4));
        const month = Number(dateYmd.substr(5, 2)) - 1;
        const date = Number(dateYmd.substr(8, 2));
        return new Date(year, month, date);
    };

    const convertToYmd = (dateObject) => {
        if (!dateObject) return '';
        const year = dateObject.getFullYear();
        const month = dateObject.getMonth() + 1;
        const date = dateObject.getDate();
        return `${year}-${('0' + month).slice(-2)}-${('0' + date).slice(-2)}`;
    };

    const isToday = (date) => {
        const today = new Date();
        const d = new Date(year, month, date);
        return today.toDateString() === d.toDateString();
    };

    const isDateFrom = (date) => {
        const d = new Date(year, month, date);
        if (!dateFrom) return false;
        return d.getTime() === dateFrom.getTime();
    };

    const isDateTo = (date) => {
        const d = new Date(year, month, date);
        if (!dateTo) return false;
        return d.getTime() === dateTo.getTime();
    };

    const isInRange = (date) => {
        const d = new Date(year, month, date);
        return dateFrom && dateTo && d > dateFrom && d < dateTo;
    };

    const outputDateValues = () => {
        if (dateFrom) {
            setOutputDateFromValue(dateFrom.toDateString());
            setDateFromYmd(convertToYmd(dateFrom));
        }
        if (dateTo) {
            setOutputDateToValue(dateTo.toDateString());
            setDateToYmd(convertToYmd(dateTo));
        }
    };

    const getNoOfDays = () => {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const dayOfWeek = new Date(year, month).getDay();

        const blankdaysArray = [];
        for (let i = 1; i <= dayOfWeek; i++) {
            blankdaysArray.push(i);
        }

        const daysArray = [];
        for (let i = 1; i <= daysInMonth; i++) {
            daysArray.push(i);
        }

        setBlankdays(blankdaysArray);
        setNoOfDays(daysArray);
    };

    const getDateValue = (date, temp = false) => {
        if (temp && !selecting) return;

        const selectedDate = new Date(year, month, date);

        if (endToShow === 'from') {
            setDateFrom(selectedDate);
            if (!dateTo) {
                setDateTo(selectedDate);
            } else if (selectedDate > dateTo) {
                setEndToShow('to');
                setDateFrom(dateTo);
                setDateTo(selectedDate);
            }
        } else if (endToShow === 'to') {
            setDateTo(selectedDate);
            if (!dateFrom) {
                setDateFrom(selectedDate);
            } else if (selectedDate < dateFrom) {
                setEndToShow('from');
                setDateTo(dateFrom);
                setDateFrom(selectedDate);
            }
        }

        if (!temp) {
            if (selecting) {
                outputDateValues();
                closeDatepicker();
            }
            setSelecting(!selecting);
        }
    };

    const init = () => {
        setSelecting((endToShow === 'to' && dateTo) || (endToShow === 'from' && dateFrom));

        let currentDate;
        if (endToShow === 'from' && dateFrom) {
            currentDate = dateFrom;
        } else if (endToShow === 'to' && dateTo) {
            currentDate = dateTo;
        } else {
            currentDate = new Date();
        }

        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        if (month !== currentMonth || year !== currentYear) {
            setMonth(currentMonth);
            setYear(currentYear);
        }

        getNoOfDays();
    };

    const closeDatepicker = () => {
        setEndToShow('');
        setShowDatepicker(false);
    };

    const handlePreviousMonth = () => {
        if (month === 0) {
            setYear(year - 1);
            setMonth(11);
        } else {
            setMonth(month - 1);
        }
        getNoOfDays();
    };

    const handleNextMonth = () => {
        if (month === 11) {
            setYear(year + 1);
            setMonth(0);
        } else {
            setMonth(month + 1);
        }
        getNoOfDays();
    };

    const handleFromClick = () => {
        setEndToShow('from');
        init();
        setShowDatepicker(true);
    };

    const handleToClick = () => {
        setEndToShow('to');
        init();
        setShowDatepicker(true);
    };

    // Close datepicker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (datepickerRef.current && !datepickerRef.current.contains(event.target)) {
                closeDatepicker();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                closeDatepicker();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    // Initialize on mount
    useEffect(() => {
        getNoOfDays();
    }, [month, year]);

    return (
        <div className="bg-blue-100">
            <div className="antialiased sans-serif">
                <div className="container mx-auto">
                    <div>
                        {/*<span className="font-bold my-1 text-gray-700 block">Results (would normally be hidden)</span>*/}
                        {/*<input type="text" name="date_from" value={dateFromYmd} readOnly />*/}
                        {/*<input type="text" name="date_to" value={dateToYmd} readOnly />*/}

                        {/*<label htmlFor="datepicker" className="font-bold mt-3 mb-1 text-gray-700 block">*/}
                        {/*    Select Date Range*/}
                        {/*</label>*/}

                        <div className="relative" ref={datepickerRef}>
                            <div className="inline-flex items-center border rounded-md mt-3 bg-gray-200">
                                <input
                                    type="text"
                                    onClick={handleFromClick}
                                    value={outputDateFromValue}
                                    className={`focus:outline-none border-0 p-2 w-40 rounded-l-md border-r border-gray-300 ${
                                        endToShow === 'from' ? 'font-semibold' : ''
                                    }`}
                                    readOnly
                                />
                                <div className="inline-block px-2 h-full">to</div>
                                <input
                                    type="text"
                                    onClick={handleToClick}
                                    value={outputDateToValue}
                                    className={`focus:outline-none border-0 p-2 w-40 rounded-r-md border-l border-gray-300 ${
                                        endToShow === 'to' ? 'font-semibold' : ''
                                    }`}
                                    readOnly
                                />
                            </div>

                            {showDatepicker && (
                                <div
                                    className="bg-white mt-2 rounded-lg shadow p-4 absolute"
                                    style={{width: '17rem'}}
                                >
                                    <div className="flex flex-col items-center">
                                        <div className="w-full flex justify-between items-center mb-2">
                                            <div>
                        <span className="text-lg font-bold text-gray-800">
                          {MONTH_NAMES[month]}
                        </span>
                                                <span className="ml-1 text-lg text-gray-600 font-normal">
                          {year}
                        </span>
                                            </div>
                                            <div>
                                                <button
                                                    type="button"
                                                    className="transition ease-in-out duration-100 inline-flex cursor-pointer hover:bg-gray-200 p-1 rounded-full"
                                                    onClick={handlePreviousMonth}
                                                >
                                                    <svg
                                                        className="h-6 w-6 text-gray-500 inline-flex"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M15 19l-7-7 7-7"
                                                        />
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    className="transition ease-in-out duration-100 inline-flex cursor-pointer hover:bg-gray-200 p-1 rounded-full"
                                                    onClick={handleNextMonth}
                                                >
                                                    <svg
                                                        className="h-6 w-6 text-gray-500 inline-flex"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M9 5l7 7-7 7"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="w-full flex flex-wrap mb-3 -mx-1">
                                            {DAYS.map((day, index) => (
                                                <div key={index} style={{width: '14.26%'}} className="px-1">
                                                    <div className="text-gray-800 font-medium text-center text-xs">
                                                        {day}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex flex-wrap -mx-1">
                                            {blankdays.map((blankday, index) => (
                                                <div
                                                    key={index}
                                                    style={{width: '14.28%'}}
                                                    className="text-center border p-1 border-transparent text-sm"
                                                ></div>
                                            ))}

                                            {noOfDays.map((date, dateIndex) => (
                                                <div key={dateIndex} style={{width: '14.28%'}}>
                                                    <div
                                                        onClick={() => getDateValue(date, false)}
                                                        onMouseOver={() => getDateValue(date, true)}
                                                        className={`p-1 cursor-pointer text-center text-sm leading-none leading-loose transition ease-in-out duration-100 ${
                                                            isToday(date)
                                                                ? 'font-bold'
                                                                : isDateFrom(date)
                                                                    ? 'bg-blue-800 text-white rounded-l-full'
                                                                    : isDateTo(date)
                                                                        ? 'bg-blue-800 text-white rounded-r-full'
                                                                        : isInRange(date)
                                                                            ? 'bg-blue-200'
                                                                            : ''
                                                        }`}
                                                    >
                                                        {date}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DateRangePicker;