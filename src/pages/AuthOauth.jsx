import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../store/slices/authSlice";
import { message } from "antd";
export default function AuthOauth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      console.log(code);
      
      // Kiểm tra xem code có tồn tại không
      dispatch(login({ payload: code, isLoginGg: true }));
      navigate("/");
      message.success("Đăng nhập thành công");
    } else {
      // Xử lý khi không có code, ví dụ như hiển thị thông báo lỗi
      console.error("Code không tồn tại trong URL");
    }
  }, [searchParams, navigate, dispatch]); // Thêm dispatch vào dependencies

  return <div>Authenticate...</div>;
}
