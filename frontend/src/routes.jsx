import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  ClipboardDocumentIcon,
  NewspaperIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/solid";
import { Home, Profile, Tokens, Notifications } from "@/pages/dashboard";
import { SignIn, SignUp } from "@/pages/auth";
import {Memo} from "@/pages/dashboard/memo.jsx";
import Users from "@/pages/dashboard/users.jsx";
import Unauthorized from "@/pages/dashboard/unauthorized.jsx";
import Orders from "@/pages/dashboard/orders.jsx";
import Toke_type from "@/pages/dashboard/toke_type.jsx";
import Dashboard from "@/pages/dashboard/component.jsx";
import Event from "@/pages/dashboard/event.jsx";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: [
          <img src={"/img/dash_on.png"} alt="icon" />,
          <img src={"/img/dash_off.png"} alt="icon" />,
        ],
        name: "dashboard",
        path: "/home",
        element: <Dashboard />,
      },
      {
        icon: [
          <img src={"/img/user_on.png"} alt="icon" />,
          <img src={"/img/user_off.png"} alt="icon" />,
        ],
        name: "user",
        path: "/user",
        allowedRoles: ['admin'],
        element: <Users />
      },
      {
        icon: [
          <img src={"/img/token_on.png"} alt="icon" />,
          <img src={"/img/token_off.png"} alt="icon" />,
        ],
        name: "tokens",
        path: "/tokens",
        element: <Tokens />,
      },
      {
        icon: [
          <img src={"/img/portfolio_on.png"} alt="icon" />,
          <img src={"/img/portfolio_off.png"} alt="icon" />,
        ],
        name: "Portfolio",
        path: "/orders",
        element: <Orders />,
      },
      {
        icon: [
          <img src={"/img/memo_on.png"} alt="icon" />,
          <img src={"/img/memo_off.png"} alt="icon" />,
        ],
        name: "memo",
        path: "/memo",
        element: <Memo />,
      },
      {
        icon: [
          <img src={"/img/event_on.png"} alt="icon" />,
          <img src={"/img/event_off.png"} alt="icon" />,
        ],
        name: "event",
        path: "/event",
        element: <Event />,
      },
      {
        icon: [
          <img src={"/img/tokentype_on.png"} alt="icon" />,
          <img src={"/img/tokentype_off.png"} alt="icon" />,
        ],
        name: "Token Type",
        path: "/token_type",
        element: <Toke_type />,
      },
      {
        icon: [
          <img src={"/img/dash_on.png"} alt="icon" />,
          <img src={"/img/dash_off.png"} alt="icon" />,
        ],
        name: "profile",
        path: "/profile",
        element: <Home />,
      },
    ],
  },
  {
    title: "auth pages",
    layout: "auth",
    pages: [
      {
        icon: [
          <img src={"/img/dash_on.png"} alt="icon" />,
          <img src={"/img/dash_off.png"} alt="icon" />,
        ],
        name: "sign in",
        path: "/sign-in",
        element: <SignIn />,
      },
      {
        icon: [
          <img src={"/img/dash_on.png"} alt="icon" />,
          <img src={"/img/dash_off.png"} alt="icon" />,
        ],
        name: "sign up",
        path: "/sign-up",
        element: <SignUp />,
      },
      {
        icon: [
          <img src={"/img/dash_on.png"} alt="icon" />,
          <img src={"/img/dash_off.png"} alt="icon" />,
        ],
        name: "unauthorized",
        path: "/unauthorized",
        element: <Unauthorized />,
      },
    ],
  },
];

export default routes;
