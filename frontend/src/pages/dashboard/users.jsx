import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Avatar,
  Chip,
  Tooltip,
  Progress,
  Checkbox,
  Input,
  Button,
  Select,
  Option,
  IconButton,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Dialog,
  Textarea
} from "@material-tailwind/react";
import React, {useEffect, useRef, useState} from 'react';
import messages from "@/const/msg.jsx";
import {useNotification} from "@/context/notificationProvider.jsx";
import {EyeIcon, PencilIcon, TrashIcon, XMarkIcon} from "@heroicons/react/24/solid/index.js";
import userService from "@/api/userService.jsx";
import Helper from "@/helper.jsx";
import authService from "@/api/authService.jsx";
import {useNavigate} from "react-router-dom";

export function Users() {

  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [userList, setUserList] = useState([]);

  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const limit = 6;
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [form, setForm] = useState({
    email: "",
    password: "",
    pwd_confirm: "",
  });


  const headers = [
      'No', 'Email', 'Register time', 'Last login time', 'User Type', ''
  ]

  const fetchData = async (reset = false) => {
    setLoading(true);
    try {
      const params = {
        offset: reset ? 0 : offset,
        limit,
        search,
      };
      const response = await userService.getUserList(params);
      const fetched = response.data.data.user_list;

      setUserList((prev) => (reset ? fetched : [...prev, ...fetched]));
      setOffset((prev) => (reset ? limit : prev + limit));
      setHasMore(fetched.length === limit);
    } catch (err) {
      showNotification("Failed to fetch users", 'red');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(true);
  }, [search]);

  const onEdit = (user) => {
    setSelectedUser(user);
    setForm({
      email: user?.email || "",
    });
    setEditModalOpen(true);
  }

  const onDelete = (user) => {
    if (user.is_admin === 1) {
      showNotification("You can not delete the admin user", 'red');
    } else {
      setSelectedUser(user);
      setDeleteModalOpen(true)
    }

  }

  const handleDelete = async () => {
    await userService.deleteUser(selectedUser.uid);
    fetchData(true);
    showNotification(messages.memo_deleted, 'green');
    setDeleteModalOpen(false);
  }

  const handleSubmit = async () => {
    const formData = new FormData();
    if (form.email === "" || !Helper.isValidEmail(form.email)) {
      showNotification("Enter the valid email address", 'red');
      return;
    }
    formData.append("email", form.email);
    if (form.pwd !== "") {
      if (form.pwd_confirm === form.pwd) {
        formData.append("pwd", form.pwd);
      } else {
        showNotification("Password should be matched", 'red');
        return;
      }
    }

    try {
      if (selectedUser) {
        formData.append("user_uid", selectedUser.uid);
        await userService.updateUser(formData);
      } else {
        if (form.pwd === "") {
          showNotification("Password should not be empty", 'red');
          return;
        } else {
          await authService.signup(form.email, form.pwd);
        }
      }
      setEditModalOpen(false);
      fetchData(true);
      showNotification(messages.user_saved, 'green');
    } catch (err) {
      console.error("Save failed", err);
    }
  }

  const handleNew = () => {
    setSelectedUser(null);
    setForm({
      email: "",
      pwd: "",
      pwd_confirm: "",
    });
    setEditModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value} = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <div className="flex items-center gap-5">
        <div className="md:mr-4 md:w-56">
          <Input label="Search"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="mr-6 ml-auto">
          <Button
              variant="filled"
              color="blue"
              onClick={() => handleNew()}
          >
            Add New
          </Button>
        </div>
      </div>
      <Card className="bg-dark">
        <CardBody className="px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {headers.map((el) => (
                  <th
                    key={el}
                    className="border-b border-blue-gray-50 py-3 px-5 text-left"
                  >
                    <Typography
                      variant="small"
                      className="text-[18px] font-medium text-lBLue"
                    >
                      {el}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {
                userList.length > 0 && userList.map(
                      ({ uid, email, registered_on, last_logged_in, is_admin}, idx) => {
                        const className = `py-3 px-5 ${
                            idx === userList.length - 1
                                ? ""
                                : "border-b border-blue-gray-50"
                        }`;

                        return (
                            <tr key={idx}>
                              <td className={className}>
                                <Typography className="font-semibold text-lBLue">
                                  {idx + 1}
                                </Typography>
                              </td>
                              <td className={className}>
                                <Typography className="font-semibold text-lBLue">
                                  {email}
                                </Typography>
                              </td>
                              <td className={className}>
                                <Typography className="font-semibold text-lBLue">
                                  {registered_on}
                                </Typography>
                              </td>
                              <td className={className}>
                                <Typography className="font-semibold text-lBLue">
                                  {last_logged_in}
                                </Typography>
                              </td>
                              <td className={className}>
                                <Chip
                                    variant="gradient"
                                    color={is_admin > 0 ? "blue" : "grey"}
                                    value={is_admin > 0 ? "admin" : "user"}
                                    className="py-0.5 px-2 text-[11px] font-medium w-fit"
                                />
                              </td>
                              <td className={className}>
                                <div className="flex gap-2 z-10">
                                  <Tooltip content="Edit">
                                    <IconButton
                                        size="sm"
                                        color="green"
                                        onClick={() => onEdit(userList[idx])}
                                    >
                                      <PencilIcon className="h-4 w-4" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip content="Edit">
                                    <IconButton
                                        size="sm"
                                        color="red"
                                        onClick={() => onDelete(userList[idx])}
                                    >
                                      <TrashIcon className="h-4 w-4" />
                                    </IconButton>
                                  </Tooltip>
                                </div>
                              </td>
                            </tr>
                        );
                      }
                  )
              }
            </tbody>
          </table>
          {hasMore && (
              <div className="mt-8 flex justify-center">
                <Button
                    variant="outlined"
                    color="blue"
                    onClick={() => fetchData()}
                    disabled={loading}
                >
                  {loading ? "Loading..." : "Load More"}
                </Button>
              </div>
          )}
          {
            userList.length === 0 &&
              <Typography className="mt-10 text-center text-xl font-semibold text-blue-gray-600">
                {messages.empty_content}
              </Typography>
          }
        </CardBody>
      </Card>
      <Dialog open={deleteModalOpen} handler={() => setDeleteModalOpen(false)}>
        <DialogHeader>Confirm Deletion</DialogHeader>
        <DialogBody>
          Are you sure you want to delete this user? This action cannot be undone.
        </DialogBody>
        <DialogFooter>
          <Button variant="text" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
          <Button color="red" onClick={() => handleDelete()}>Delete</Button>
        </DialogFooter>
      </Dialog>
      <Dialog open={editModalOpen} handler={() => setEditModalOpen(false)} size="xs">
        <div className="flex justify-between items-center px-4 pt-4">
          <DialogHeader>{selectedUser ? "Edit User" : "Create User"}</DialogHeader>
          <IconButton variant="text" onClick={() => setEditModalOpen(false)}>
            <XMarkIcon className="w-6 h-6" />
          </IconButton>
        </div>
        <DialogBody className="px-6 pb-4 space-y-4">
          <Input
              label="Email"
              name="email"
              value={form.email}
              onChange={handleFormChange}
          />
          <Input
              label="New Password"
              name="pwd"
              type={"password"}
              value={form.pwd}
              onChange={handleFormChange}
          />
          <Input
              label="Confirm Password"
              name="pwd_confirm"
              type={"password"}
              value={form.pwd_confirm}
              onChange={handleFormChange}
          />
        </DialogBody>
        <DialogFooter>
          <Button variant="outlined" color="gray" onClick={() => setEditModalOpen(false)}>
            Cancel
          </Button>
          <Button color="blue" onClick={handleSubmit} className="ml-2">
            {selectedUser ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default Users;
