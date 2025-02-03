import { Button, Layout, Menu, Space, theme } from "antd";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { logout } from "./store/slices/authSlice";
import Sider from "antd/es/layout/Sider";
import { Content, Footer, Header } from "antd/es/layout/layout";
import Title from "antd/es/typography/Title";

const AppAdmin = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const refreshToken = localStorage.getItem("refreshToken");
  const navigate = useNavigate();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // Tất cả các mục menu
  const allItems = [
    {
      key: "",
      label: "Thống kê",
      roles: ["ADMIN", "MANAGER"], // Vai trò có quyền
    },
    {
      key: "manage-showing",
      label: "Quản lý lịch chiếu",
      roles: ["ADMIN", "MANAGER"],
    },
    {
      key: "manage-theater",
      label: "Quản lý rạp",
      roles: ["ADMIN"],
    },
    {
      key: "manage-movie",
      label: "Quản lý phim",
      roles: ["ADMIN"],
    },
    {
      key: "manage-food",
      label: "Quản lý đồ ăn",
      roles: ["ADMIN"],
    },
    {
      key: "manage-carousel",
      label: "Quản lý carousel",
      roles: ["ADMIN"],
    },
    {
      key: "scan-qr",
      label: "Quét vé",
      roles: ["ADMIN", "MANAGER", "STAFF"],
    },
    {
      key: "manage-post",
      label: "Quản lý post",
      roles: ["ADMIN"],
    },
    {
      key: "manage-ticket-price",
      label: "Quản lý giá vé",
      roles: ["ADMIN"],
    },
    {
      key: "manage-staff",
      label: "Quản lý nhân viên",
      roles: ["ADMIN", "MANAGER"],
    },
    {
      key: "manage-user",
      label: "Quản lý người dùng",
      roles: ["ADMIN", "MANAGER"],
    },
    {
      key: "booking",
      label: "Bán vé",
      roles: ["STAFF", "MANAGER"],
    },
  ];

  // Lọc các mục menu dựa trên vai trò
  const filteredItems = allItems.filter((item) =>
    item.roles.includes(user.role)
  );

  const handleMenu = ({ key }) => {
    navigate(key);
  };

  return (
    <Layout
      style={{
        minHeight: "100vh",
      }}
    >
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <Link to={""}>
          <Title
            level={3}
            style={{
              color: "white",
              textAlign: "center",
              height: "62px",
              marginBottom: "0",
              lineHeight: "62px",
            }}
          >
            NTH Cinema
          </Title>
        </Link>
        <Menu
          theme="dark"
          items={filteredItems}
          mode="inline"
          onClick={handleMenu}
          selectedKeys={[
            filteredItems.find(
              (_item) =>
                location.pathname.includes(_item.key) && _item.key !== ""
            )?.key || filteredItems[0].key,
          ]}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            paddingRight: "20px",
            background: colorBgContainer,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Space>
            <Button>{user.fullName}</Button>
            <Button
              onClick={() => {
                dispatch(logout({ refreshToken }));
                navigate("/");
              }}
            >
              Logout
            </Button>
          </Space>
        </Header>
        <Content
          style={{
            margin: "0 16px",
          }}
        >
          <Outlet />
        </Content>
        <Footer
          style={{
            textAlign: "center",
          }}
        >
          NTH Cinema ©{new Date().getFullYear()} Created by NTH Cinema
        </Footer>
      </Layout>
    </Layout>
  );
};

export default AppAdmin;
