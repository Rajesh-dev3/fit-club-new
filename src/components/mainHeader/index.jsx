import React from "react";
import { IoMenu } from "react-icons/io5";
import { FiMoon, FiSun } from "react-icons/fi";
import { Select, Avatar, Dropdown, Spin } from "antd";
import { useNavigate } from 'react-router-dom';
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useTheme } from "../../context/ThemeContext";
import { useGetBranchesQuery } from "../../services/branches";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedBranch } from "../../services/branchSlice";
import "./styles.scss";

const MainHeader = ({ collapsed, setCollapsed, isMobile, toggleMobileDrawer }) => {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selectedBranch = useSelector(state => state.branch.selectedBranch);
  const { data: branchData, isLoading: branchLoading } = useGetBranchesQuery();

  const handleMenuClick = () => {
    if (isMobile) {
      toggleMobileDrawer();
    } else {
      setCollapsed(!collapsed);
    }
  };

 const handleLogout = () => {
  try {
    // Auth & user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Permission / menu cache
    localStorage.removeItem('siderMenuData');

    // Optional
    sessionStorage.clear();
  } catch (e) {
    console.warn('Failed to clear storage on logout', e);
  }

  // Hard redirect (most reliable)
  window.location.replace('/login');
};

  const profileMenu = {
    items: [
      {
        key: "1",
        label: <div className="profile-name">Rajesh Rajput</div>,
        disabled: true,
      },
      { type: "divider" },
      {
        key: "2",
        label: (
          <div className="logout-item" onClick={handleLogout}>
            <LogoutOutlined /> Logout
          </div>
        ),
      },
    ],
  };



  return (
    <header className="main-header">
      <div className="left-section">
        <button className="menu-btn" onClick={handleMenuClick}>
          <IoMenu />
        </button>

        <Select
          value={selectedBranch || undefined}
          className="dark-select"
          classNames={{ popup: { root: 'dark-select-dropdown' } }}
          style={{ minWidth: 180 }}
          loading={branchLoading}
          placeholder="Select Branch"
          onChange={val => dispatch(setSelectedBranch(val))}
          optionFilterProp="children"
          showSearch
        >
          <Select.Option value="all" >All</Select.Option>
          {branchData?.data?.map(b => (
            <Select.Option key={b._id} value={b._id}>{b.name}</Select.Option>
          ))}
        </Select>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          aria-label="Switch theme"
        >
          {isLight ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>

        <Dropdown
          menu={profileMenu}
          placement="bottomRight"
          arrow
        >
          <Avatar
            size={40}
            className="profile-avatar"
            icon={<UserOutlined />}
            style={{ backgroundColor: "var(--accent)", color: "var(--sider-text)" }}
          />
        </Dropdown>
      </div>
    </header>
  );
};

export default MainHeader;
