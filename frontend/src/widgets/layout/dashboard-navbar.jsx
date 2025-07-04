import { useLocation, Link } from "react-router-dom";
import {
  Navbar,
  Typography,
  Button,
  IconButton,
  Breadcrumbs,
  Input,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar, Badge,
} from "@material-tailwind/react";
import {
  UserCircleIcon,
  Cog6ToothIcon,
  BellIcon,
  ClockIcon,
  CreditCardIcon,
  Bars3Icon,
} from "@heroicons/react/24/solid";
import {
  useMaterialTailwindController,
  setOpenConfigurator,
  setOpenSidenav,
} from "@/context";
import {format} from "date-fns";

export function DashboardNavbar({logout}) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { fixedNavbar, openSidenav } = controller;
  const { pathname } = useLocation();
  const [layout, page] = pathname.split("/").filter((el) => el !== "");
  const events = localStorage.getItem('events');
  const eventList = events === null || events === "" ? [] : JSON.parse(events);

  return (
    <Navbar
      color={fixedNavbar ? "white" : "transparent"}
      className={`rounded-xl transition-all ${
        fixedNavbar
          ? "sticky top-4 z-40 py-3 shadow-md shadow-blue-gray-500/5"
          : "px-0 py-1"
      }`}
      fullWidth
      blurred={fixedNavbar}
    >
      <div className="flex flex-col-reverse justify-between gap-6 md:flex-row md:items-center">
        <div className="capitalize">
          <Breadcrumbs
            className={`bg-transparent p-0 transition-all ${
              fixedNavbar ? "mt-1" : ""
            }`}
          >
            <Link to={`/${layout}`}>
              <Typography
                variant="small"
                color="blue-gray"
                className="font-normal opacity-50 transition-all hover:text-blue-500 hover:opacity-100"
              >
                {layout}
              </Typography>
            </Link>
            <Typography
              variant="small"
              color="blue-gray"
              className="font-normal"
            >
              {page}
            </Typography>
          </Breadcrumbs>
          <Typography variant="h6" color="blue-gray">
            {page}
          </Typography>
        </div>
        <div className="flex items-center">
          {/*<div className="mr-auto md:mr-4 md:w-56">*/}
          {/*  <Input label="Search" />*/}
          {/*</div>*/}
          <IconButton
            variant="text"
            color="blue-gray"
            className="grid xl:hidden"
            onClick={() => setOpenSidenav(dispatch, !openSidenav)}
          >
            <Bars3Icon strokeWidth={3} className="h-6 w-6 text-blue-gray-500" />
          </IconButton>
          <div >
            <Button
              variant="text"
              color="blue-gray"
              className="hidden items-center gap-1 px-4 xl:flex normal-case"
              onClick={() => logout()}
            >
              <UserCircleIcon className="h-5 w-5 text-blue-gray-500" />
              Sign Out
            </Button>
            <IconButton
              variant="text"
              color="blue-gray"
              className="grid xl:hidden"
            >
              <UserCircleIcon className="h-5 w-5 text-blue-gray-500" />
            </IconButton>
          </div>
          <Menu>
            <MenuHandler>
              <IconButton variant="text" color="blue-gray">
                <Badge color={eventList.length > 0 ? "red" : "green"}>
                  <BellIcon className="h-5 w-5 text-blue-gray-500" />
                </Badge>
              </IconButton>
            </MenuHandler>
            <MenuList className="w-max border-0">
              {
                eventList.map((item) => (
                    <MenuItem className="flex items-center gap-3">
                      {
                        item.image &&
                          <Avatar
                              src={item.image}
                              alt="item-1"
                              size="sm"
                              variant="circular"
                          />
                      }
                      <div>
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="mb-1 font-normal"
                        >
                          {item.title}
                        </Typography>
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="flex items-center gap-1 text-xs font-normal opacity-60"
                        >
                          <ClockIcon className="h-3.5 w-3.5" /> {item.happen_time}
                        </Typography>
                      </div>
                    </MenuItem>
                ))
              }
              {
                eventList.length === 0 &&
                  <MenuItem className="flex items-center gap-3">
                    <div>
                      <Typography
                          variant="small"
                          color="blue-gray"
                          className="mb-1 font-normal"
                      >
                        There is no upcoming events
                      </Typography>
                      <Typography
                          variant="small"
                          color="blue-gray"
                          className="flex items-center gap-1 text-xs font-normal opacity-60"
                      >
                        <ClockIcon className="h-3.5 w-3.5" /> {format(new Date(), "yyyy-MM-dd hh:mm:ss")}
                      </Typography>
                    </div>
                  </MenuItem>
              }
            </MenuList>
          </Menu>
          {/*<IconButton*/}
          {/*  variant="text"*/}
          {/*  color="blue-gray"*/}
          {/*  onClick={() => setOpenConfigurator(dispatch, true)}*/}
          {/*>*/}
          {/*  <Cog6ToothIcon className="h-5 w-5 text-blue-gray-500" />*/}
          {/*</IconButton>*/}
        </div>
      </div>
    </Navbar>
  );
}

DashboardNavbar.displayName = "/src/widgets/layout/dashboard-navbar.jsx";

export default DashboardNavbar;
