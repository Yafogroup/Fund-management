import React, {useState, useMemo, useEffect} from "react";
import {
  Button,
  Alert,
  Card,
  CardHeader,
  CardBody,
  Input,
  IconButton,
  Typography,
  DialogHeader,
  DialogBody,
  Dialog,
  Textarea,
  DialogFooter,
  Select,
  Option,
  Tooltip,
} from "@material-tailwind/react";
import {EyeIcon, XMarkIcon} from "@heroicons/react/24/solid/index.js";
import eventService from "@/api/eventService.jsx";
import {useNotification} from "@/context/notificationProvider.jsx";
import messages from "@/const/msg.jsx";
import {MagnifyingGlassIcon} from "@heroicons/react/24/outline/index.js";
import {Pagination} from "@/widgets/components/pagination.jsx";
import ItemEvent from "@/widgets/components/item_event.jsx";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {format, parse} from "date-fns";

export function Memo() {

  const { showNotification } = useNotification();
  const [eventList, setEventList] = useState([]);

  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [pageCount, setPageCount] = useState("8");
  const [pageTotal, setPageTotal] = useState(1);
  const [page, setPage] = useState(1);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [importFile, setImportFile] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fileInput = React.useRef();

  const fetchEvents = async () => {
    try {
      const params = {
        offset: (page - 1) * pageCount,
        limit: pageCount,
        search,
        start_date: startDate,
        end_date: endDate,
      };

      const response = await eventService.getEventList(params);
      const fetched = response.data.data.event_list;
      const tt = response.data.data.page_count;
      setPageTotal(Math.floor(tt) + 1);
      setEventList((prev) => (fetched));
    } catch (err) {
      console.error("Failed to fetch events", err);
    } finally {
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [search, startDate, endDate, page, pageCount]);

  useEffect(() => {
    handleImport();
  }, [importFile]);

  const [form, setForm] = useState({
    title: "",
    content: "",
    happen_time: "",
    image: null,
  });

  const handleView = (event) => {
    setSelectedEvent(event);
    setViewModalOpen(true);
  };

  const handleNew = () => {
    setSelectedEvent(null);
    setForm({
      title: "",
      content: "",
      happen_time: "",
      image: null,
    });
    setEditModalOpen(true);
  };

  const handleEdit = (event = null) => {
    setSelectedEvent(event);
    setForm({
      title: event?.title || "",
      content: event?.content || "",
      happen_time: event?.happen_time || "",
      image: null,
    });
    if (event !== null) {
      setSelectedDate(parse(event.happen_time, 'MM/dd/yyyy, hh:mm:ss', new Date()))
    }
    setEditModalOpen(true);
  };

  const handleDelete = async () => {
    {
      await eventService.deleteEvent(selectedEvent.uid);
      fetchEvents();
      showNotification(messages.event_deleted, 'green');
      setDeleteModalOpen(false);
    }
  }

  const confirmDeleteMemo = (event = null) => {
    setSelectedEvent(event);
    setDeleteModalOpen(true);
  }

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("content", form.content);
    formData.append("happen_time", format(selectedDate, 'yyyy-MM-dd hh:mm'));
    if (form.image) formData.append("image", form.image);

    try {
      if (selectedEvent) {
        formData.append("event_uid", selectedEvent.uid);
        await eventService.updateEvent(formData);
      } else {
        await eventService.addEvent(formData);
      }
      setEditModalOpen(false);
      fetchEvents();
      showNotification(messages.memo_saved, 'green');
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  const onExport = async () => {
    const result = await eventService.export();
    const filePath = result.data.data.file_path;
    const fileName = result.data.data.file_name;

    try {
      const response = await fetch(filePath); // Replace with your API endpoint
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading the file:', error);
    }
  }

  const onImport = () => {
    fileInput.current.click()
  }

  const handleImport = async () => {
    try {
      if (importFile) {
        const data = new FormData();
        data.append("import_file", importFile);
        const result = await eventService.import(data);
        showNotification("events are imported successfully.", "green");
        setPage(1);
      }
    } catch (e) {
      console.error('Import failed', e);
    }
  }

  return (
      <div className="p-6 bg-dark min-h-screen">
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6 ml-6">
          <div className="w-60">
            <Input
                label="Search"
                value={search}
                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="w-full md:w-1/6">
            <label className="text-sm text-gray-700 mb-1 block">Start Date</label>
            <input
                type="date"
                value={startDate}
                onClick={(e) => e.currentTarget.showPicker()}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-dark text-lBLue"
            />
          </div>

          <div className="w-full md:w-1/6">
            <label className="text-sm text-gray-700 mb-1 block">End Date</label>
            <input
                type="date"
                value={endDate}
                onClick={(e) => e.currentTarget.showPicker()}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-dark text-lBLue"
            />
          </div>
          <div className="w-40">
            <Select label="Select Page Count" value={pageCount}
                    onChange={(e) => {
                      setPage(1);
                      setPageCount(e);
                    }}
                    size="lg" className="text-lBLue text-sm"
            >
              <Option value="8">8</Option>
              <Option value="10">10</Option>
              <Option value="12">12</Option>
              <Option value="20">30</Option>
            </Select>
          </div>
          <div className="w-full md:w-1/4 text-right flex-1 mr-7">
            <Button
                variant="filled"
                color="blue"
                onClick={() => handleNew()}
            >
              Add New
            </Button>
            <Button
                variant="filled"
                className="ml-2"
                color="green"
                onClick={() => onExport()}
            >
              Export
            </Button>
            <Button
                variant="filled"
                color="pink"
                className="ml-2"
                onClick={() => onImport()}
            >
              Import
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 p-6 bg-dark">
          {
            eventList.map((event, index) => (
                <ItemEvent
                    event={event}
                    key={index}
                    onView={() => handleView(event)}
                    onEdit={() => handleEdit(event)}
                    onDelete={() => confirmDeleteMemo(event)}
                    onClick={() => {}}
                />
            ))
          }
        </div>

        <div className="mt-8 flex justify-center">
          <Pagination
            page={pageTotal}
            active={page}
            onPageChange={(p) => {
              setPage(p);
            }}
          />
        </div>


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

        <Dialog open={editModalOpen} handler={() => setEditModalOpen(false)} size="lg">
          <div className="flex justify-between items-center px-4 pt-4">
            <DialogHeader>{selectedEvent ? "Edit Event" : "Create Event"}</DialogHeader>
            <IconButton variant="text" onClick={() => setEditModalOpen(false)}>
              <XMarkIcon className="w-6 h-6" />
            </IconButton>
          </div>
          <DialogBody className="px-6 pb-4 space-y-4">
            <Input
                label="Title"
                name="title"
                value={form.title}
                onChange={handleFormChange}
            />
            <Textarea
                label="Content"
                name="content"
                className="w-full h-60 p-2 border border-gray-300 rounded-md resize-none"
                value={form.content}
                onChange={handleFormChange}
            />
            <div className="w-72">
              <label className="text-sm text-blue-gray-600 mb-1 block">Select Date & Time</label>
              <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="yyyy-MM-dd HH:mm"
                  customInput={<Input label="Date Time" />}
                  showMonthYearDropdown={false}/>
            </div>
            <Input
                label="Image"
                type="file"
                name="image"
                onChange={handleFormChange}
            />
          </DialogBody>
          <DialogFooter>
            <Button variant="outlined" color="gray" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button color="blue" onClick={handleSubmit} className="ml-2">
              {selectedEvent ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </Dialog>

        <Dialog open={deleteModalOpen} handler={() => setDeleteModalOpen(false)}>
          <DialogHeader>Confirm Deletion</DialogHeader>
          <DialogBody>
            Are you sure you want to delete this event? This action cannot be undone.
          </DialogBody>
          <DialogFooter>
            <Button variant="text" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
            <Button color="red" onClick={() => handleDelete()}>Delete</Button>
          </DialogFooter>
        </Dialog>
        <input
            ref={fileInput}
            type="file"
            style={{ display: 'none' }}
            onChange={(e) => {
              setImportFile(e.target.files[0]);
            }}
        />
      </div>
  );
}

export default Memo;
