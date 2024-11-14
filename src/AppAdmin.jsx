import { Button, Flex, Layout, Menu, message, Space, theme } from "antd";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { logout } from "./store/slices/authSlice";
import Sider from "antd/es/layout/Sider";
import { Content, Footer, Header } from "antd/es/layout/layout";
import Title from "antd/es/typography/Title";
const items = [
  {
    key: "",
    label: "Dashboard",
  },
  {
    key: "manage-showing",
    label: "Quản lý lịch chiếu",
  },
  {
    key: "manage-theater",
    label: "Quản lý rạp",
  },
  {
    key: "manage-movie",
    label: "Quản lý phim",
  },
  {
    key: "manage-food",
    label: "Quản lý đồ ăn",
  },
  {
    key: "manage-carousel",
    label: "Quản lý carousel",
  },
  {
    key: "scan-qr",
    label: "Quét vé",
  },
  {
    key: "manage-post",
    label: "Quản lý post",
  },
];
const AppAdmin = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const refreshToken = localStorage.getItem("refreshToken");
  const navigate = useNavigate();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const handleMenu = ({ key }) => {
    navigate(key);
  };
  return (
    <>
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
            items={items}
            mode="inline"
            onClick={handleMenu}
            selectedKeys={[
              items.find(
                (_item) =>
                  location.pathname.includes(_item.key) && _item.key != ""
              )?.key || items[0].key,
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
    </>
  );
};

export default AppAdmin;
