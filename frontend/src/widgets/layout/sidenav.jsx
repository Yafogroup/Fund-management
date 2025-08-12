import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  Avatar,
  Button,
  IconButton,
  Typography,
} from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";
import {useAuth} from "@/context/AuthContext.jsx";
import React from "react";

export function Sidenav({ brandImg, brandName, routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavColor, sidenavType, openSidenav } = controller;
  const sidenavTypes = {
    dark: "bg-sidebar",
    white: "bg-white shadow-sm",
    transparent: "bg-transparent",
  };
  const { isLoggedIn, user, logout } = useAuth();

  return (
    <aside
      className={`${sidenavTypes[sidenavType]} ${
        openSidenav ? "translate-x-0" : "-translate-x-80"
      } fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-xl transition-transform duration-300 xl:translate-x-0`}
    >
      <div
        className={`relative`}
      >
        <Link to="/" className="py-6 px-8 text-center">
          <img
              src={brandImg}
              alt="Logo"
              className="rounded-lg ml-6"
          />
        </Link>
      </div>
      <div className="m-4">
        {routes.map(({ layout, title, pages }, key) => (
          layout === "dashboard" && <ul key={key} className="mb-4 flex flex-col gap-1">
            {pages
                .filter(page => {
                  if (!page.allowedRoles) return true; // if no restriction, show it
                  const role = localStorage.getItem("userRole")
                  return page.allowedRoles.includes(role); // check role
                })
                .map(({ icon, name, path }) => (
              <li key={name}>
                <NavLink to={`/${layout}${path}`}>
                  {({ isActive }) => (
                    <Button
                      className={`flex items-center gap-4 px-4 capitalize ${!isActive ? "bg-sidebar" : "bg-cBlue3"}`}
                      fullWidth
                    >
                      {isActive ? icon[0] : icon[1]}
                      <Typography
                        className={`font-medium capitalize ${!isActive ? "text-white" : "text-lBLue1"}`}
                      >
                        {name}
                      </Typography>
                    </Button>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </aside>
  );
}

Sidenav.defaultProps = {
  brandImg: "/img/logo.png",
  brandName: "YAFO",
};

Sidenav.propTypes = {
  brandImg: PropTypes.string,
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Sidenav.displayName = "/src/widgets/layout/sidnave.jsx";

export default Sidenav;
