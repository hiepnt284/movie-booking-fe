import React, { useEffect, useState } from "react";
import { Table, InputNumber, Button, message, Typography, Input, ConfigProvider } from "antd";
import seatTypeApi from "../api/seatTypeApi";

const { Title } = Typography;

const ManageSeatType = () => {
  const [seatTypes, setSeatTypes] = useState([]); // Dữ liệu từ API
  const [editingKey, setEditingKey] = useState(""); // Key của hàng đang chỉnh sửa
  const [originalData, setOriginalData] = useState({}); // Lưu giá trị ban đầu của hàng đang chỉnh sửa

  // Fetch dữ liệu từ API
  const fetchSeatTypes = async () => {
    try {
      const response = await seatTypeApi.getAll();
      setSeatTypes(response.result); // Lưu danh sách vào state
    } catch (error) {
      message.error("Lấy danh sách loại ghế thất bại.");
    }
  };

  useEffect(() => {
    fetchSeatTypes();
  }, []);

  // Xác định hàng đang chỉnh sửa
  const isEditing = (record) => record.id === editingKey;

  // Bắt đầu chỉnh sửa
  const edit = (record) => {
    setEditingKey(record.id);
    setOriginalData({ ...record }); // Lưu giá trị ban đầu
  };

  // Hủy chỉnh sửa
  const cancel = () => {
    setSeatTypes((prev) =>
      prev.map((item) => (item.id === editingKey ? originalData : item))
    );
    setEditingKey(""); // Reset trạng thái chỉnh sửa
  };

  // Lưu thay đổi
  const save = async (id) => {
    try {
      const updatedRow = seatTypes.find((item) => item.id === id);
      await seatTypeApi.update(id, {
        name: updatedRow.name,
        extraPrice: updatedRow.extraPrice,
      });
      message.success("Cập nhật loại ghế thành công.");
      setEditingKey("");
      fetchSeatTypes(); // Reload dữ liệu
    } catch (error) {
      message.error("Cập nhật loại ghế thất bại.");
    }
  };

  // Khi giá trị thay đổi
  const handleChange = (value, key, record) => {
    const updatedData = seatTypes.map((item) =>
      item.id === record.id ? { ...item, [key]: value } : item
    );
    setSeatTypes(updatedData);
  };

  // Cấu hình cột
  const columns = [
    {
      title: "Tên loại ghế",
      dataIndex: "name",
      key: "name",
      render: (text, record) => {
        return text;
      },
    },
    {
      title: "Phụ thu (VNĐ)",
      dataIndex: "extraPrice",
      key: "extraPrice",
      render: (text, record) => {
        const editable = isEditing(record);
        return editable ? (
          <InputNumber
            value={record.extraPrice.toLocaleString()}
            onChange={(value) => handleChange(value, "extraPrice", record)}
            min={0}
          />
        ) : (
          `${text.toLocaleString()} VNĐ`
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
        <Title level={5}>Phụ thu loại ghế</Title>
        <Table
          dataSource={seatTypes.map((item) => ({ ...item, key: item.id }))}
          columns={columns}
          pagination={false}
          bordered
        />
      </div>
    </ConfigProvider>
  );
};

export default ManageSeatType;
