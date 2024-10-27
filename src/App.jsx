import { Link, Outlet, useNavigate } from "react-router-dom";
import "./App.css";
import { Button, Layout, Menu, Space, message } from "antd";
import ModalManager from "./components/modal/ModalManager";
import { openModal } from "./store/slices/modalSlice";
import { MODAL_TYPES } from "./store/modalTypes";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "./store/slices/authSlice";
import { useEffect } from "react";
const { Header, Content, Footer } = Layout;
const items = [
  {
    key: "showing",
    label: "Lịch chiếu",
  },
  {
    key: "cinema",
    label: "Hệ thống rạp",
  },
  {
    key: "sale",
    label: "Tin tức",
  },
];
function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleMenu = ({ key }) => {
    navigate(key);
  };

  // useEffect(() => {
  //   if (user) {
  //     if (user.role == "ADMIN") {
  //       navigate("admin");
  //     }
  //   }
  // }, [user]);
  return (
    <>
      <Layout>
        <Header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "white",
            padding: "0 140px",
          }}
        >
          <Link to={""}>NTH Cinema</Link>
          <Menu
            mode="horizontal"
            items={items}
            style={{
              flex: 1,
              minWidth: 0,
            }}
            onClick={handleMenu}
          />
          {user ? (
            <Space>
              <Button>{user.fullName}</Button>
              <Button onClick={() => dispatch(logout())}>Logout</Button>
            </Space>
          ) : (
            <Space>
              <Button
                type="primary"
                onClick={() => {
                  dispatch(
                    openModal({ modalType: MODAL_TYPES.REGISTER_MULTI_STEP })
                  );
                }}
              >
                Đăng Ký
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  dispatch(openModal({ modalType: MODAL_TYPES.LOGIN }));
                }}
              >
                Đăng Nhập
              </Button>
            </Space>
          )}
        </Header>
        <Content>
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
      <ModalManager />
    </>
  );
}

export default App;
