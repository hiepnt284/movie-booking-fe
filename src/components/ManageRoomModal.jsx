import {
  Button,
  Col,
  Flex,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Space,
  Table,
} from "antd";
import Title from "antd/es/typography/Title";
import React, { useEffect, useState } from "react";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import roomApi from "../api/roomApi";
import roomTypeApi from "../api/roomTypeApi";
import theaterApi from "../api/theaterApi";

const ManageRoomModal = ({ isManageRoomOpen, handleClose, theaterId }) => {
  const [listRoom, setListRoom] = useState();
  const [listRoomType, setListRoomType] = useState([]);
  const [theaterName, setTheaterName] = useState();
  const [loading, setLoading] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [addRoomModalVisible, setAddRoomModalVisible] = useState(false);
  const [roomForm] = Form.useForm();
  const fetchRoomAndType = async (theaterId) => {
    setLoading(true);
    try {
      const res = await roomApi.getAll(theaterId);
      setListRoom(res.result);
      const res1 = await theaterApi.get(theaterId);
      setTheaterName(res1.result.name);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (isManageRoomOpen) {
      try {
        fetchRoomAndType(theaterId);
      } catch (error) {
        message.error(error.response?.data?.message || "Có lỗi xảy ra.");
      }
    }
  }, [isManageRoomOpen, theaterId]);

  const handleCancelAddRoomModal = () => {
    setAddRoomModalVisible(false);
    setEditingRoom(null);
    roomForm.resetFields();
  };
  const handleManageSeat = () => {};
  const handleEdit = async (roomId) => {
    try {
      setLoading(true);
      const res = await roomApi.get(roomId);
      openRoomModal(res.result);
    } catch (error) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
    const handleDelete = async (roomId) => {
      Modal.confirm({
        title: `Bạn có chắc muốn xóa phòng với id = ${roomId}?`,
        okText: "Có",
        okType: "danger",
        cancelText: "Không",
        onOk: async () => {
          try {
            await roomApi.delete(roomId);
            message.success("Xóa phòng chiếu thành công");
            fetchRoomAndType(theaterId);
          } catch (error) {
            message.error(error.response?.data?.message || "Có lỗi xảy ra.");
          } finally {
            setLoading(false);
          }
        },
      });
    };

  const openRoomModal = async (room = null) => {
    const res1 = await roomTypeApi.getAll();
    setListRoomType(res1.result);
    if (room) {
      setEditingRoom(room);
      roomForm.setFieldsValue({
        ...room,
      });
    } else {
      roomForm.resetFields();
    }
    setAddRoomModalVisible(true);
  };

  const handleFinish = async (value) => {
    setLoading(true);
    console.log(value);

    try {
      if (editingRoom) {
        const { name, roomTypeId } = value;

        const roomData = {
          name,
          roomTypeId,
        };
        await roomApi.update(editingRoom.id, roomData);
        message.success("Cập nhật phòng chiếu thành công");
      } else {
        const { name, roomTypeId, row, col } = value;

        const roomData = {
          name,
          roomTypeId,
          row,
          col,
          theaterId,
        };
        await roomApi.create(roomData);
        message.success("Tạo phòng chiếu thành công");
      }
      handleCancelAddRoomModal();
      fetchRoomAndType(theaterId);
    } catch (error) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Mã",
      dataIndex: "id",
    },
    {
      title: "Tên",
      dataIndex: "name",
    },
    {
      title: "Loại phòng",
      dataIndex: "roomTypeName",
    },
    {
      title: "Hành động",
      dataIndex: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleManageSeat(record.id)}
            loading={loading}
            type="primary"
          >
            Quản lý ghế
          </Button>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record.id)}
            loading={loading}
            type="primary"
          >
            Chỉnh sửa
          </Button>
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record.id)}
            loading={loading}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];
  return (
    <div>
      <Modal
        open={isManageRoomOpen}
        title={`Quản lý phòng chiếu rạp ${theaterName}`}
        onCancel={handleClose}
        footer={null}
        destroyOnClose
        forceRender
        style={{
          top: "50px",
        }}
        width={"700px"}
      >
        <Flex justify="flex-end">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="middle"
            onClick={() => openRoomModal()}
          >
            Thêm phòng chiếu mới
          </Button>
        </Flex>
        <br />
        <Table
          columns={columns}
          rowKey={(record) => record.id}
          dataSource={listRoom}
          loading={loading}
          //   onChange={handleTableChange}
          bordered
        />
        <Modal
          open={addRoomModalVisible}
          title={editingRoom ? "Chỉnh sửa phòng" : "Thêm phòng"}
          onCancel={handleCancelAddRoomModal}
          footer={null}
          destroyOnClose
          forceRender
          style={{
            top: "50px",
          }}
          width={"400px"}
        >
          <Form form={roomForm} layout="vertical" onFinish={handleFinish}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Tên"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên phòng" },
                  ]}
                >
                  <Input placeholder="Nhập tên phòng" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="roomTypeId"
                  label="Loại phòng"
                  rules={[
                    { required: true, message: "Vui lòng chọn loại phòng" },
                  ]}
                >
                  <Select placeholder="Chọn loại phòng">
                    {listRoomType?.map((rt) => (
                      <Select.Option key={rt.id} value={rt.id}>
                        {rt.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            {!editingRoom && (
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="row"
                    label="Số hàng ghế"
                    rules={[
                      { required: true, message: "Vui lòng nhập số hàng" },
                    ]}
                  >
                    <Input
                      type="number"
                      placeholder="Nhập số hàng"
                      min={1} // Đặt giá trị nhỏ nhất (tùy chọn)
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="col"
                    label="Số cột ghế"
                    rules={[
                      { required: true, message: "Vui lòng nhập số cột" },
                    ]}
                  >
                    <Input
                      type="number"
                      placeholder="Nhập số cột"
                      min={1} // Đặt giá trị nhỏ nhất (tùy chọn)
                    />
                  </Form.Item>
                </Col>
              </Row>
            )}

            <Form.Item>
              <Space style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button onClick={handleCancelAddRoomModal}>Hủy</Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Xác nhận
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Modal>
    </div>
  );
};

export default ManageRoomModal;
