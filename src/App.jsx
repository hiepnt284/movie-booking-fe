import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import "./App.css";
import {
  Button,
  ConfigProvider,
  Flex,
  Layout,
  Menu,
  Space,
  message,
} from "antd";
import ModalManager from "./components/modal/ModalManager";
import { openModal } from "./store/slices/modalSlice";
import { MODAL_TYPES } from "./store/modalTypes";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "./store/slices/authSlice";
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";
import {
  FacebookFilled,
  InstagramFilled,
  TikTokFilled,
  YoutubeFilled,
} from "@ant-design/icons";
import { useEffect } from "react";
const { Header, Content, Footer } = Layout;
const items = [
  {
    key: "movie",
    label: "Phim",
  },
  {
    key: "cinema",
    label: "Hệ thống rạp",
  },
  {
    key: "sale",
    label: "Tin mới, ưu đãi",
  },
];
function App() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const refreshToken = localStorage.getItem("refreshToken");
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
            height: "80px",
            borderBottom: "2px solid lightgray",
            position: "sticky",
            top: 0,
            zIndex: 1,
            width: "100%",
          }}
        >
          <div style={{ height: "100%", width: "120px", padding: "10px" }}>
            <Link to={""}>
              <img
                style={{ height: "100%", width: "100%" }}
                src="https://res.cloudinary.com/daa0uijud/image/upload/v1730540205/logo-final_1_ch5dfa.png"
                alt=""
              />
            </Link>
          </div>
          <ConfigProvider
            theme={{
              components: {
                Menu: {},
              },
            }}
          >
            <Menu
              mode="horizontal"
              items={items}
              style={{
                flex: 1,
                minWidth: 0,
                fontSize: 18,
                fontWeight: "bold",
              }}
              onClick={handleMenu}
              selectedKeys={[
                items.find(
                  (_item) =>
                    location.pathname.includes(_item.key) && _item.key != ""
                )?.key || null,
              ]}
            />
          </ConfigProvider>
          {user ? (
            <ConfigProvider
              theme={{
                components: {
                  Button: {
                    textTextHoverColor: "blue",
                    textHoverBg: "",
                  },
                },
              }}
            >
              <Flex>
                <Button
                  type="text"
                  size="large"
                  onClick={() => navigate("user")}
                >
                  <img
                    src={
                      user.avt
                        ? user.avt
                        : "https://bhdstar.vn/wp-content/assets/loodo/no-user.jpg"
                    }
                    alt=""
                    style={{ height: 40, width: 40, borderRadius: "50%" }}
                  />
                  {user.fullName}
                </Button>
                <Button
                  size="large"
                  onClick={() => {
                    dispatch(logout({ refreshToken }));
                    navigate("/");
                  }}
                >
                  Đăng xuất
                </Button>
              </Flex>
            </ConfigProvider>
          ) : (
            <Space>
              <Button
                type="primary"
                size="large"
                onClick={() => {
                  dispatch(
                    openModal({
                      modalType: MODAL_TYPES.REGISTER_MULTI_STEP,
                      modalProps: { top: 10 },
                    })
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
                size="large"
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
            padding: "20px 140px",
            background: "white",
            borderTop: "3px solid lightgray",
          }}
        >
          <Flex justify="space-between">
            <div style={{ flex: 1 }}>
              <Title
                level={4}
                style={{
                  borderBottom: "5px solid #1677ff",
                  display: "inline-block",
                  paddingBottom: "5px",
                }}
              >
                NTH Cinema
              </Title>
              <Paragraph>Giới Thiệu</Paragraph>
              <Paragraph>Tiện Ích Online</Paragraph>
              <Paragraph>Thẻ Quà Tặng</Paragraph>
              <Paragraph>Tuyển Dụng</Paragraph>
            </div>
            <div style={{ flex: 1 }}>
              <Title
                level={4}
                style={{
                  borderBottom: "5px solid #1677ff",
                  display: "inline-block",
                  paddingBottom: "5px",
                }}
              >
                Điều khoản sử dụng
              </Title>
              <Paragraph>Điều Khoản Chung</Paragraph>
              <Paragraph>Điều Khoản Giao Dịch</Paragraph>
              <Paragraph>Chính Sách Thanh Toán</Paragraph>
              <Paragraph>Chính Sách Bảo Mật</Paragraph>
            </div>
            <div style={{ flex: 1 }}>
              <Title
                level={4}
                style={{
                  borderBottom: "5px solid #1677ff",
                  display: "inline-block",
                  paddingBottom: "5px",
                }}
              >
                Kết nối với chúng tôi
              </Title>
              <Space>
                <img
                  src="https://bhdstar.vn/wp-content/themes/loodo-starter/inc/imgs/facebookIcon.png"
                  alt=""
                  width={30}
                />
                <img
                  src="https://bhdstar.vn/wp-content/themes/loodo-starter/inc/imgs/instagramIcon.png"
                  alt=""
                  width={30}
                />
                <img
                  src="https://bhdstar.vn/wp-content/themes/loodo-starter/inc/imgs/tiktokIcon.png"
                  alt=""
                  width={30}
                />
                <img
                  src="https://bhdstar.vn/wp-content/themes/loodo-starter/inc/imgs/youtubeIcon.png"
                  alt=""
                  width={30}
                />
              </Space>
              <img
                src="https://www.galaxycine.vn/_next/static/media/glx_trade.61f6c35c.png"
                alt=""
                width={200}
                style={{ marginLeft: "-10px" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <Title
                level={4}
                style={{
                  borderBottom: "5px solid #1677ff",
                  display: "inline-block",
                  paddingBottom: "5px",
                }}
              >
                Chăm sóc khách hàng
              </Title>
              <Paragraph>Hotline: 1900 6017</Paragraph>
              <Paragraph>
                Giờ làm việc: 8:00 - 22:00 (Tất cả các ngày bao gồm cả Lễ Tết)
              </Paragraph>
              <Paragraph>Email hỗ trợ: hoidap@cgv.vn</Paragraph>
            </div>
          </Flex>
        </Footer>
      </Layout>
      <ModalManager />
    </>
  );
}

export default App;
