import React, { useEffect, useState } from "react";
import { Table, InputNumber, Button, message, Typography, ConfigProvider } from "antd";
import dayPriceApi from "../api/dayPriceApi";

const { Title } = Typography;

// Map để chuyển đổi từ tên tiếng Anh sang tiếng Việt
const dayOfWeekMap = {
  MONDAY: "Thứ 2",
  TUESDAY: "Thứ 3",
  WEDNESDAY: "Thứ 4",
  THURSDAY: "Thứ 5",
  FRIDAY: "Thứ 6",
  SATURDAY: "Thứ 7",
  SUNDAY: "Chủ nhật",
};

const ManageDayPrice = () => {
  const [dayPrices, setDayPrices] = useState([]); // Dữ liệu từ API
  const [originalPrices, setOriginalPrices] = useState({}); // Lưu giá trị ban đầu
  const [editingKey, setEditingKey] = useState(""); // Key của hàng đang chỉnh sửa

  // Fetch dữ liệu từ API
  const fetchDayPrices = async () => {
    try {
      const response = await dayPriceApi.getAll();
      setDayPrices(response.result); // Lưu danh sách giá vào state
    } catch (error) {
      message.error("Lấy danh sách giá thất bại.");
    }
  };

  useEffect(() => {
    fetchDayPrices();
  }, []);

  // Xác định hàng đang chỉnh sửa
  const isEditing = (record) => record.id === editingKey;

  // Bắt đầu chỉnh sửa
  const edit = (record) => {
    setEditingKey(record.id);
    // Lưu giá trị ban đầu khi bắt đầu chỉnh sửa
    setOriginalPrices({ ...originalPrices, [record.id]: record.basePrice });
  };

  // Hủy chỉnh sửa
  const cancel = () => {
    setDayPrices((prevPrices) =>
      prevPrices.map((item) =>
        item.id === editingKey
          ? { ...item, basePrice: originalPrices[editingKey] }
          : item
      )
    );
    setEditingKey(""); // Xóa trạng thái chỉnh sửa
  };

  // Lưu thay đổi vào API
  const save = async (id) => {
    try {
      const updatedRow = dayPrices.find((item) => item.id === id);
      await dayPriceApi.update(id, { basePrice: updatedRow.basePrice });
      message.success("Cập nhật giá thành công.");
      setEditingKey(""); // Xóa trạng thái chỉnh sửa
      fetchDayPrices(); // Tải lại dữ liệu
    } catch (error) {
      message.error("Cập nhật giá thất bại.");
    }
  };

  // Khi giá trị thay đổi
  const handleChange = (value, record) => {
    const newData = dayPrices.map((item) =>
      item.id === record.id ? { ...item, basePrice: value } : item
    );
    setDayPrices(newData);
  };

  // Cấu hình cột bảng
  const columns = [
    {
      title: "Thứ",
      dataIndex: "dayOfWeek",
      key: "dayOfWeek",
      render: (text) => <b>{dayOfWeekMap[text] || text}</b>, // Hiển thị thứ trong tuần bằng tiếng Việt
    },
    {
      title: "Giá",
      dataIndex: "basePrice",
      key: "basePrice",
      render: (text, record) => {
        const editable = isEditing(record);
        return editable ? (
          <InputNumber
            value={record.basePrice}
            onChange={(value) => handleChange(value, record)}
            min={0}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
          />
        ) : (
          <span>{text.toLocaleString()} VNĐ</span>
        );
      },
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Button type="link" onClick={() => save(record.id)}>
              Lưu
            </Button>
            <Button type="link" onClick={cancel}>
              Hủy
            </Button>
          </span>
        ) : (
          <Button
            type="link"
            disabled={editingKey !== ""}
            onClick={() => edit(record)}
          >
            Chỉnh sửa
          </Button>
        );
      },
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
      <div>
        <Title level={5}>Giá theo ngày</Title>
        <Table
          dataSource={dayPrices.map((item) => ({ ...item, key: item.id }))}
          columns={columns}
          pagination={false}
          bordered
        />
      </div>
    </ConfigProvider>
  );
};

export default ManageDayPrice;
