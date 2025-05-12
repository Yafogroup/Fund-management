import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Avatar,
  Chip,
  Tooltip,
  Progress, Checkbox, Input, Button,
} from "@material-tailwind/react";
import React, {useEffect, useRef, useState} from 'react';
import tokenService from "@/api/tokenService.jsx";
import messages from "@/const/msg.jsx";
import {useNotification} from "@/context/notificationProvider.jsx";

export function Tokens() {

  const { showNotification } = useNotification();
  const [changeList, setChangeList] = useState([]);
  const [tokenList, setTokenList] = useState([]);

  const [intervalTime, setIntervalTime] = useState(1);
  const [min, setMin] = useState("0.1");
  const [max, setMax] = useState("20");
  const [realTime, setRealTime] = useState(1);

  const headers = [
      'no', 'symbol', 'name', 'old_price', 'price', 'percent_change', 'timestamp'
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

  const applyFilter = async () => {
    try {
      const response = await tokenService.updateParam(
          intervalTime,
          min,
          max
      );
      if (response.status === 200) {
        showNotification(messages.param_updated, 'green');
        setRealTime(intervalTime)
        fetchData();
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  useEffect(() => {
    setTimeout(() => {
      fetchData();
    }, realTime * 60 * 1000);
    showNotification("The token have been updated.", 'green');
  }, [tokenList]);

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">

      <Card>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2 m-8">
          <Typography variant="h6" color="black">
            Token Filter
          </Typography>
          <div className="flex items-center gap-5 mt-6">
            <Typography variant="small" color="blue-gray" className="font-medium">
              Time
            </Typography>
            <Input
                size="lg"
                placeholder=""
                className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                value={intervalTime}
                onChange={(e) => {setIntervalTime(parseFloat(e.target.value))}}
            />
            <Typography variant="small" color="blue-gray" className="font-medium">
              Min
            </Typography>
            <Input
                size="lg"
                placeholder="name@mail.com"
                className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                value={min}
                onChange={(e) => {setMin((e.target.value))}}
            />
            <Typography variant="small" color="blue-gray" className="font-medium">
              Max
            </Typography>
            <Input
                size="lg"
                placeholder="name@mail.com"
                className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                value={max}
                onChange={(e) => {setMax((e.target.value))}}
            />
            <Button className="" style={{width:'200px'}} onClick={applyFilter}>
              Apply
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Token List
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
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
                      className="text-[11px] font-bold uppercase text-blue-gray-400"
                    >
                      {el}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {
                tokenList.length > 0 && tokenList.map(
                      ({ symbol, name, old_price, price, percent_change, timestamp }, idx) => {
                        const className = `py-3 px-5 ${
                            idx === changeList.length - 1
                                ? ""
                                : "border-b border-blue-gray-50"
                        }`;

                        return (
                            <tr key={idx}>
                              <td className={className}>
                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                  {idx + 1}
                                </Typography>
                              </td>
                              <td className={className}>
                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                  {symbol}
                                </Typography>
                              </td>
                              <td className={className}>
                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                  {name}
                                </Typography>
                              </td>
                              <td className={className}>
                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                  {old_price}
                                </Typography>
                              </td>
                              <td className={className}>
                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                  {price}
                                </Typography>
                              </td>
                              <td className={className}>
                                <Chip
                                    variant="gradient"
                                    color={percent_change > 0 ? "green" : "red"}
                                    value={percent_change}
                                    className="py-0.5 px-2 text-[11px] font-medium w-fit"
                                />
                              </td>
                              <td className={className}>
                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                  {timestamp}
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
    </div>
  );
}

export default Tokens;
