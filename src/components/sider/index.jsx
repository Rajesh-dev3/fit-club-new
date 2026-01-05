import { Menu } from "antd";
import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { logo, whiteLogo } from "../../assets";
import { useTheme } from "../../context/ThemeContext";
import { useSiderMenuQuery } from "../../services/permissions";
import {
  Home,
  AllRolesRoute,
  AllDirectorsRoute,
  DirectorAttendanceRoute,
  AllEmployeesRoute,
  AllGeneralStaffRoute,
  AllTrainersRoute,
  AllUsersRoute,
  AddUserRoute,
} from "../../routes/routepath";
import { items as MASTER_MENU } from "./menu"; // 👈 STATIC MENU
import "./sider.scss";

/* ================= ROUTE MAP (UNCHANGED) ================= */
const routeMap = {
  "1": Home,
  "2": AllRolesRoute,
  "3": AllDirectorsRoute,
  "4-1": DirectorAttendanceRoute,
  "8-1": AllEmployeesRoute,
  "8-2": AllGeneralStaffRoute,
  "8-3": AllTrainersRoute,
  "9-1": AllUsersRoute,
  "9-2": AddUserRoute,
};

const MENU_CACHE_KEY = "siderMenuData";
const MENU_CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour

/* ================= MENU MATCHER ================= */
const matchMenus = (backendMenu, masterMenu) => {
  return backendMenu
    .map((backendItem) => {
      const matchedItem = masterMenu.find(
        (m) => m.key === backendItem.key
      );

      if (!matchedItem) return null;

      return {
        ...matchedItem,
        children: backendItem.children
          ? matchMenus(
              backendItem.children,
              matchedItem.children || []
            )
          : undefined,
      };
    })
    .filter(Boolean);
};

const SiderComponent = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  const [activeKey, setActiveKey] = useState();
  const [openKeys, setOpenKeys] = useState([]);
  const [cachedMenu, setCachedMenu] = useState(null);

  const { data: siderData } = useSiderMenuQuery();

  /* ================= LOAD MENU FROM CACHE ================= */
  useEffect(() => {
    const cached = localStorage.getItem(MENU_CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.time < MENU_CACHE_EXPIRY) {
          setCachedMenu(parsed.menu);
        } else {
          localStorage.removeItem(MENU_CACHE_KEY);
        }
      } catch {
        localStorage.removeItem(MENU_CACHE_KEY);
      }
    }
  }, []);

  /* ================= CACHE API MENU ================= */
  useEffect(() => {
    if (siderData?.menu) {
      localStorage.setItem(
        MENU_CACHE_KEY,
        JSON.stringify({ menu: siderData.menu, time: Date.now() })
      );
    }
  }, [siderData]);

  const rawMenu = cachedMenu || siderData?.menu || [];

  /* ================= MATCH BACKEND + STATIC MENU ================= */
  const menuData = useMemo(() => {
    return matchMenus(rawMenu, MASTER_MENU);
  }, [rawMenu]);

  /* ================= SYNC ACTIVE MENU ================= */
  useEffect(() => {
    const matched = Object.entries(routeMap).find(([_, path]) =>
      location.pathname.startsWith(path)
    );
    if (matched) setActiveKey(matched[0]);
  }, [location.pathname]);

  /* ================= SUBMENU OPEN LOGIC ================= */
  const onOpenChange = (keys) => {
    setOpenKeys(keys.slice(-1));
  };

  /* ================= BUILD ANT MENU ================= */
  const menuItems = useMemo(() => {
    return menuData.map((item) => ({
      key: item.key,
      icon: item.icon, // 👈 ICON FROM STATIC MENU
      label: item.label,
      onClick: routeMap[item.key]
        ? () => navigate(routeMap[item.key])
        : undefined,
      children: item.children?.map((child) => ({
        key: child.key,
        label: child.label,
        onClick: routeMap[child.key]
          ? () => navigate(routeMap[child.key])
          : undefined,
      })),
    }));
  }, [menuData, navigate]);

  return (
    <div className="aside">
      <div className="logo-wrapper">
        {!collapsed && (
          <img
            src={theme === "light" ? logo : whiteLogo}
            alt="logo"
            className="logo-img"
          />
        )}
      </div>

      <Menu
        mode="inline"
        items={menuItems}
        selectedKeys={[activeKey]}
        openKeys={openKeys}
        onOpenChange={onOpenChange}
        theme={theme === "light" ? "light" : "dark"}
        inlineCollapsed={collapsed}
        className="app-sider-menu"
      />
    </div>
  );
};

export default SiderComponent;
