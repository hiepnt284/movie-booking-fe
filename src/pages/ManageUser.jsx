import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Upload,
  Space,
  message,
  InputNumber,
  Switch,
  Flex,
  ConfigProvider,
  Row,
  Col,
  DatePicker,
  Select,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import Title from "antd/es/typography/Title";
import useDebounce from "../customHook/useDebounce";
import { useSelector } from "react-redux";
import userApi from "../api/userApi";

const { TextArea } = Input;
const ManageStaff = () => {
  const { user } = useSelector((state) => state.auth);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 4,
    total: 0,
  });
  const [sort, setSort] = useState({
    sortBy: "id",
    sortDirection: "desc",
  });
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(false);

  const [keyword, setKeyword] = useState("");

  const debouncedKeyword = useDebounce(keyword, 800);


  const fetchUsers = async (params = {}) => {
    setLoading(true);
    try {
      const response = await userApi.getAll({
        page: params.pagination?.current || pagination.current,
        pageSize: params.pagination?.pageSize || pagination.pageSize,
        sortBy: params.sorter?.field || sort.sortBy,
        direction:
          (params.sorter &&
            (params.sorter?.order === "ascend" ? "asc" : "desc")) ||
          sort.sortDirection,
        keyword: params.keyword,
      });

      setUsers(response.result.content);

      setPagination({
        ...pagination,
        current: response.result.pageNo || pagination.current,
        pageSize: response.result.pageSize || pagination.pageSize,
        total: response.result.totalElements,
      });
      setSort({
        ...sort,
        sortBy: params.sorter?.field || sort.sortBy,
        sortDirection:
          (params.sorter &&
            (params.sorter?.order === "ascend" ? "asc" : "desc")) ||
          sort.sortDirection,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi debouncedKeyword thay đổi
  useEffect(() => {
      fetchUsers({
        pagination: { current: 1 },
        keyword: debouncedKeyword,
      });
  }, [debouncedKeyword]);

  const handleTableChange = (pagination, filters, sorter, extra) => {
    try {
      fetchUsers({
        pagination,
        sorter,
        keyword,
      });
    } catch (error) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra.");
    }
  };

  const handleChangeStatus = async (userId) => {
    setLoading(true);
    try {
      await userApi.changStatus(userId); // Gọi API chuyển trạng thái
      message.success("Đổi trạng thái thành công.");
      fetchUsers(); // Refresh danh sách người dùng
    } catch (error) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };


  const columns = [
    {
      title: "Mã",
      dataIndex: "id",
      sorter: true,
      align: "center",
    },
    {
      title: "Email",
      dataIndex: "email",
      sorter: true,
      align: "center",
    },
    {
      title: "SĐT",
      dataIndex: "phoneNumber",
      sorter: true,
      align: "center",
    },
    {
      title: "Tên",
      dataIndex: "fullName",
      sorter: true,
      align: "center",
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      sorter: true,
      align: "center",
      render: (gender) => (gender === "MALE" ? "Nam" : "Nữ"),
    },
    {
      title: "Ngày sinh",
      dataIndex: "dob",
      sorter: true,
      align: "center",
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      align: "center",
      sorter: true,
      render: (isActive, record) => (
        <Button
          style={{
            backgroundColor: isActive === "ACTIVE" ? "green" : undefined,
            color: isActive === "ACTIVE" ? "white" : undefined,
          }}
          danger={isActive === "BANNED"}
          onClick={() => handleChangeStatus(record.id)}
        >
          {isActive === "ACTIVE" ? "Hoạt động" : "Vô hiệu hóa"}
        </Button>
      ),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        components: {
          Table: {
            headerBg: "#b3d3ff",
            headerBorderRadius: 0,
            borderColor: "gray",
            cellFontSize: 16,
            cellPaddingBlock: 10,
            cellPaddingInline: 10,
          },
          Select: {},
        },
      }}
    >
      <Title level={4}>Quản lý người dùng </Title>
          <Flex gap={20} style={{ marginTop: "20px" }}>
            <Input
              size="middle"
              prefix={<SearchOutlined />}
              placeholder="Search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            ></Input>
          </Flex>
          <br />
          <Table
            columns={columns}
            rowKey={(record) => record.id}
            dataSource={users}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
              pageSizeOptions: ["1", "4", "10", "20", "50"],
            }}
            loading={loading}
            onChange={handleTableChange}
            bordered
          />
    </ConfigProvider>
  );
};

export default ManageStaff;
