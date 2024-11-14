import { Scanner } from "@yudiel/react-qr-scanner";
import React, { useState } from "react";
import { Modal, Button } from "antd";
import bookingApi from "../api/bookingApi";
import Title from "antd/es/typography/Title";

const ScanQR = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [isScanning, setIsScanning] = useState(true);

  const handleScan = async (result) => {
    try {
      if (result && isScanning) {
        setIsScanning(false);
        const res = await bookingApi.verify(result[0].rawValue);
        setScannedData(res.result);
        setIsModalVisible(true); // Hiển thị Modal khi quét xong
      }
    } catch (error) {
      setIsScanning(false);
      setScannedData(error.response?.data?.message || "Vé không hợp lệ.");
      setIsModalVisible(true); // Hiển thị Modal khi quét xong
      console.log(error);
    }
  };

  const handleConfirm = () => {
    // Xác nhận và reset trạng thái để quét mã QR mới
    setIsModalVisible(false);
    setScannedData(null);
    setIsScanning(true);
  };

  return (
    <div>
      <Title level={4}>Quét vé</Title>
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          minHeight: "600px",
          alignItems: "center",
        }}
      >
        {isScanning && (
          <div style={{ width: "400px" }}>
            <Scanner onScan={handleScan} scanDelay={300} />
          </div>
        )}

        <Modal
          title="Kết quả quét mã QR"
          open={isModalVisible}
          onOk={handleConfirm}
          onCancel={handleConfirm}
          okText="Xác nhận"
          cancelText="Đóng"
        >
          <p>{scannedData}</p>
        </Modal>
      </div>
    </div>
  );
};

export default ScanQR;
