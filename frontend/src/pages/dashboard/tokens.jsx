import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Avatar,
  Chip,
  Tooltip,
  Progress, Checkbox, Input, Button, Select, Option, DialogHeader, IconButton, DialogBody, Dialog, Switch
} from "@material-tailwind/react";
import React, {useEffect, useRef, useState} from 'react';
import tokenService from "@/api/tokenService.jsx";
import messages from "@/const/msg.jsx";
import {useNotification} from "@/context/notificationProvider.jsx";
import {XMarkIcon} from "@heroicons/react/24/solid/index.js";
import {MagnifyingGlassIcon} from "@heroicons/react/24/outline/index.js";

export function Tokens() {

  const { showNotification } = useNotification();
  const [changeList, setChangeList] = useState([]);
  const [tokenList, setTokenList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [intervalTime, setIntervalTime] = useState(localStorage.getItem('time_interval') ?? "1");
  const [min, setMin] = useState(localStorage.getItem('min_change') ?? "0.1");
  const [max, setMax] = useState(localStorage.getItem('max_change') ?? "20");
  const [realTime, setRealTime] = useState(parseInt(localStorage.getItem('time_interval') ?? "1"));

  const timerRef = useRef(null);

  const [viewSelectModal, setViewSelectModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState(localStorage.getItem("userToken") === "" ? [] :
      localStorage.getItem("userToken").split(","));
  const [searchModal, setSearchModal] = useState("");

  const headers = [
      'No', 'Token', 'Price', 'Change', '24h', '7d', '30d', 'Timestamp'
  ]

  const fetchData = async () => {
    try {
      const response = await tokenService.getTokenList();
      setChangeList(response.data.data.data[0]);
      setTokenList(response.data.data.data[1]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const filteredTokens = tokenList.filter(token =>
      token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTokensModal = changeList.filter(token =>
      token.name.toLowerCase().includes(searchModal.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchModal.toLowerCase())
  );

  const applyFilter = async () => {
    try {
      if (min === '' || max === '') {
        showNotification(messages.param_incorrect, "red");
        return;
      }
      const response = await tokenService.updateParam(
          intervalTime,
          min,
          max
      );
      if (response.status === 200) {
        showNotification(messages.param_updated, 'green');
        setRealTime(parseInt(intervalTime))
        localStorage.setItem('time_interval', intervalTime);
        localStorage.setItem('min_change', min);
        localStorage.setItem('max_change', max);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (tokenList.length > 0) {
      showNotification("The token have been updated.", 'green');
    }
  }, [tokenList]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      fetchData();
    }, realTime * 60 * 1000);
    return () => clearInterval(timerRef.current);
  }, [realTime]);

  const updateUserToken = async () => {
    try {
      const info = selectedIds.length === 0 ? "" : selectedIds.join(",");
      const response = await tokenService.updateUserToken(
          info
      );
      if (response.status === 200) {
        localStorage.setItem('userToken',info);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  useEffect(() => {
    updateUserToken();
  }, [selectedIds]);

  return (
    <div className="mt-4 mb-8 flex flex-col gap-1">

      <Card className="bg-dark">
        <CardBody className="px-0 pt-0 pb-2 m-8">
          <div className="flex items-center gap-5 mt-6">
            <Typography variant="small" color="white" className="font-medium text-[16px]">
              Time
            </Typography>
            <div className="w-70">
              <Select label="Select an option" value={intervalTime}
                      onChange={(e) => setIntervalTime(e)}
                      size="lg" className="text-lBLue"
              >
                <Option value="1">1 min</Option>
                <Option value="5">5 min</Option>
                <Option value="15">15 min</Option>
                <Option value="30">30 min</Option>
                <Option value="60">1 hour</Option>
                <Option value="240">4 hour</Option>
                <Option value="1440">1 day</Option>
                <Option value="2880">2 day</Option>
                <Option value="7200">5 day</Option>
                <Option value="10080">a week</Option>
                <Option value="43200">a month</Option>
              </Select>
            </div>
            <Typography variant="small" color="white" className="font-medium text-[16px]">
              Min
            </Typography>
            <div className="relative">
              <Input
                  size="lg"
                  placeholder="Min %"
                  value={min}
                  onChange={(e) => setMin(e.target.value)}
                  className="pr-8 !border-t-blue-gray-200 focus:!border-t-gray-900 text-lBLue"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">%</span>
            </div>
            <Typography variant="small" color="white" className="font-medium text-[16px]">
              Max
            </Typography>
            <div className="relative">
              <Input
                  size="lg"
                  placeholder="Min %"
                  value={max}
                  onChange={(e) => setMax(e.target.value)}
                  className="pr-8 !border-t-blue-gray-200 focus:!border-t-gray-900 text-lBLue"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">%</span>
            </div>
            <Button color="blue" style={{width:'100px'}} onClick={applyFilter}>
              Apply
            </Button>
            <Button color="light-green" onClick={() => {setViewSelectModal(true)}}>
              Token Select
            </Button>
            <div className="ml-auto md:mr-4 md:w-56">
              <Input
                  label="Search..."
                  icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="bg-dark">
        <CardBody className="px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {headers.map((el) => (
                  <th
                    key={el}
                    className="py-5 px-5 text-left"
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
                  filteredTokens.length > 0 && filteredTokens.map(
                      (token, idx) => {
                        const className = `py-3 px-5 ${
                            idx === changeList.length - 1
                                ? ""
                                : ""
                        }`;

                        return (
                            <tr key={idx}>
                              <td className={className}>
                                <Typography className="font-semibold text-blue-gray-600">
                                  {idx + 1}
                                </Typography>
                              </td>
                              <td className={className && "w-1/5"}>
                                <div className="flex">
                                  <Avatar
                                      src={token.logo}
                                      alt={token.name}
                                      variant="rounded"
                                      size="sm"
                                  />
                                  <Typography className="text-lBLue font-sans mt-1 ml-6 text-[16px]">
                                    {token.name}({token.symbol})
                                  </Typography>
                                </div>
                              </td>
                              <td className={className}>
                                <Typography className="font-bold text-lBLue text-[18px]">
                                  $ {token.price.toFixed(4)}
                                </Typography>
                              </td>
                              <td className={className}>
                                <Chip
                                    variant="gradient"
                                    color={token.percent_change > 0 ? "green" : "red"}
                                    value={token.percent_change.toFixed(2) + " %"}
                                    className="py-0.5 px-2 text-[14px] font-bold w-fit"
                                />
                              </td>
                              <td className={className}>
                                <Chip
                                    variant="gradient"
                                    color={token.percent_change_24h > 0 ? "green" : "red"}
                                    value={token.percent_change_24h.toFixed(2) + " %"}
                                    className="py-0.5 px-2 text-[14px] font-bold w-fit"
                                />
                              </td>
                              <td className={className}>
                                <Chip
                                    variant="gradient"
                                    color={token.percent_change_7d > 0 ? "green" : "red"}
                                    value={token.percent_change_7d.toFixed(2) + " %"}
                                    className="py-0.5 px-2 text-[14px] font-bold w-fit"
                                />
                              </td>
                              <td className={className}>
                                <Chip
                                    variant="gradient"
                                    color={token.percent_change_30d > 0 ? "green" : "red"}
                                    value={token.percent_change_30d.toFixed(2) + " %"}
                                    className="py-0.5 px-2 text-[14px] font-bold w-fit"
                                />
                              </td>
                              <td className={className}>
                                <Typography className="font-semibold text-blue-gray-600">
                                  {token.timestamp}
                                </Typography>
                              </td>
                            </tr>
                        );
                      }
                  )
              }
            </tbody>
          </table>
          {
            tokenList.length === 0 &&
              <Typography className="mt-10 text-center text-xl font-semibold text-blue-gray-600">
                {messages.empty_content}
              </Typography>
          }
        </CardBody>
      </Card>

      <Dialog open={viewSelectModal} handler={() => setViewSelectModal(false)} size="lg" className="overflow-y-auto z-10">
        <div className="flex justify-between items-center px-4 pt-4">
          <DialogHeader>Select Tokens for position</DialogHeader>
          <IconButton variant="text" onClick={() => setViewSelectModal(false)}>
            <XMarkIcon className="w-6 h-6" />
          </IconButton>
        </div>
        <DialogBody className="px-6 pb-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="ml-auto md:mr-4 md:w-56">
            <Input label="Search"
                   value={searchModal}
                   icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                   onChange={(e) => setSearchModal(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card className="">
              <CardBody className="px-0 pt-0 pb-2">
                <table className="w-full min-w-[640px] table-auto">
                  <thead>
                  <tr>
                    {["No", "Token", ""].map((el) => (
                        <th
                            key={el}
                            className="py-5 px-5 text-left"
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
                      filteredTokensModal.length > 0 && filteredTokensModal.map(
                          (token, idx) => {
                            const className = `py-3 px-5 ${
                                idx === changeList.length - 1
                                    ? ""
                                    : ""
                            }`;

                            return (
                                <tr key={idx}>
                                  <td className={className}>
                                    <Typography className="font-semibold text-blue-gray-600">
                                      {idx + 1}
                                    </Typography>
                                  </td>
                                  <td className={className && "w-1/2"}>
                                    <div className="flex">
                                      <Avatar
                                          src={token.logo}
                                          alt={token.name}
                                          variant="rounded"
                                          size="sm"
                                      />
                                      <Typography className="text-blue-gray-500 font-sans mt-1 ml-6 text-[16px]">
                                        {token.name}({token.symbol})
                                      </Typography>
                                    </div>
                                  </td>
                                  <td className={className}>
                                    <Switch
                                        checked={selectedIds.includes(String(token.id))}
                                        labelProps={{
                                          className: "text-sm font-normal text-blue-gray-500",
                                        }}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedIds(prev => [...prev, String(token.id)]);
                                          } else {
                                            setSelectedIds(prev => prev.filter(item => item !== String(token.id)))
                                          }
                                        }}
                                    />
                                  </td>
                                </tr>
                            );
                          }
                      )
                  }
                  </tbody>
                </table>
                {
                    filteredTokensModal.length === 0 &&
                    <Typography className="mt-10 text-center text-[15px] font-semibold text-blue-gray-600">
                      {messages.empty_content}
                    </Typography>
                }
              </CardBody>
            </Card>
            <Card className="">
              <CardBody>
                {
                  changeList.map((token, idx) => {
                    return (
                        selectedIds.includes(String(token.id)) &&
                        <CardHeader key={idx} className="mt-4">
                          <div className="flex p-4 bg-dark">
                            <Avatar
                                src={token.logo}
                                alt={token.name}
                                variant="rounded"
                                size="sm"
                            />
                            <Typography className="text-blue-gray-500 font-sans mt-2 ml-6 text-[16px] flex-1">
                              {token.name}({token.symbol})
                            </Typography>
                            <IconButton variant="text" onClick={() => {
                              setSelectedIds(prev => prev.filter(item => item !== String(token.id)))
                            }} className="bg-blue-gray-400">
                              <XMarkIcon className="w-6 h-6" />
                            </IconButton>
                          </div>
                        </CardHeader>
                    )
                  })
                }
              </CardBody>
            </Card>
          </div>
        </DialogBody>
      </Dialog>
    </div>
  );
}

export default Tokens;
