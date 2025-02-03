import React, { useEffect, useState } from "react";
import { Table, InputNumber, Button, message, Typography, Input, ConfigProvider } from "antd";
import roomTypeApi from "../api/roomTypeApi";

const { Title } = Typography;

const ManageRoomType = () => {
  const [roomTypes, setRoomTypes] = useState([]);
  const [editingKey, setEditingKey] = useState("");
  const [originalData, setOriginalData] = useState({});

  const fetchRoomTypes = async () => {
    try {
      const response = await roomTypeApi.getAll();
      setRoomTypes(response.result);
    } catch (error) {
      message.error("Lấy danh sách loại phòng thất bại.");
    }
  };

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const isEditing = (record) => record.id === editingKey;

  const edit = (record) => {
    setEditingKey(record.id);
    setOriginalData({ ...record });
  };

  const cancel = () => {
    setRoomTypes((prev) =>
      prev.map((item) => (item.id === editingKey ? originalData : item))
    );
    setEditingKey("");
  };

  const save = async (id) => {
    try {
      const updatedRow = roomTypes.find((item) => item.id === id);
      await roomTypeApi.update(id, {
        name: updatedRow.name,
        extraPrice: updatedRow.extraPrice,
      });
      message.success("Cập nhật loại phòng thành công.");
      setEditingKey("");
      fetchRoomTypes();
    } catch (error) {
      message.error("Cập nhật loại phòng thất bại.");
    }
  };

  const handleChange = (value, key, record) => {
    const updatedData = roomTypes.map((item) =>
      item.id === record.id ? { ...item, [key]: value } : item
    );
    setRoomTypes(updatedData);
  };

  const columns = [
    {
      title: "Tên loại phòng",
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
        <Title level={5}>Phụ thu loại phòng</Title>
        <Table
          dataSource={roomTypes.map((item) => ({ ...item, key: item.id }))}
          columns={columns}
          pagination={false}
          bordered
        />
      </div>
    </ConfigProvider>
  );
};

export default ManageRoomType;
