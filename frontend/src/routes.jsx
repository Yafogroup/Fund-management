import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  ClipboardDocumentIcon,
  ShoppingCartIcon
} from "@heroicons/react/24/solid";
import { Home, Profile, Tokens, Notifications } from "@/pages/dashboard";
import { SignIn, SignUp } from "@/pages/auth";
import {Memo} from "@/pages/dashboard/memo.jsx";
import Users from "@/pages/dashboard/users.jsx";
import ProtectedRoute from "@/context/ProtectedRoute.jsx";
import Unauthorized from "@/pages/dashboard/unauthorized.jsx";
import Orders from "@/pages/dashboard/orders.jsx";
import Toke_type from "@/pages/dashboard/toke_type.jsx";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "dashboard",
        path: "/home",
        element: <Home />,
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "user",
        path: "/user",
        allowedRoles: ['admin'],
        element: <Users />
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "tokens",
        path: "/tokens",
        element: <Tokens />,
      },
      {
        icon: <ShoppingCartIcon {...icon} />,
        name: "Portfolio",
        path: "/orders",
        element: <Orders />,
      },
      {
        icon: <ClipboardDocumentIcon {...icon} />,
        name: "memo",
        path: "/memo",
        element: <Memo />,
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "Token Type",
        path: "/token_type",
        element: <Toke_type />,
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "profile",
        path: "/profile",
        element: <Profile />,
      },
    ],
  },
  {
    title: "auth pages",
    layout: "auth",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "sign in",
        path: "/sign-in",
        element: <SignIn />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "sign up",
        path: "/sign-up",
        element: <SignUp />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "unauthorized",
        path: "/unauthorized",
        element: <Unauthorized />,
      },
    ],
  },
];

export default routes;
