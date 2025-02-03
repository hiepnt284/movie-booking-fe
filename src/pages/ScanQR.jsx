import { Scanner } from "@yudiel/react-qr-scanner";
import React, { useState, useRef } from "react";
import { Modal, Button, message } from "antd";
import bookingApi from "../api/bookingApi";
import Title from "antd/es/typography/Title";
import "./style/ScanQR.scss";
import dayjs from "dayjs";
import { useReactToPrint } from "react-to-print";

const ScanQR = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [isScanning, setIsScanning] = useState(false); // Change default to false
  const [isScannerVisible, setIsScannerVisible] = useState(false); // State to control scanner visibility
  const printRef = useRef(); // Ref to target the content for printing

  const handleScan = async (result) => {
    try {
      if (result && isScanning) {
        setIsScanning(false);
        console.log(result);

        const res = await bookingApi.verify(result[0].rawValue);

        setScannedData(res.result);
        setIsModalVisible(true); // Hiển thị Modal khi quét xong
      }
    } catch (error) {
      setIsModalVisible(false);
      setScannedData(null);
      setIsScanning(false);
      setIsScannerVisible(false); // Hide the scanner after confirmation
      message.error("QR không hợp lệ");
      console.log(error);
    }
  };

  const handleConfirm = () => {
    // Xác nhận và reset trạng thái để quét mã QR mới
    setIsModalVisible(false);
    setScannedData(null);
    setIsScanning(false);
    setIsScannerVisible(false); // Hide the scanner after confirmation
  };

  const handleStartScan = () => {
    setIsScannerVisible(true); // Show the scanner when the button is clicked
    setIsScanning(true); // Enable scanning when the scanner is displayed
  };

  const handlePrint = useReactToPrint({
    documentTitle: "Title",
    contentRef: printRef,
  });

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
        {!isScannerVisible && (
          <Button
            onClick={handleStartScan}
            type="primary"
            style={{ marginBottom: 20 }}
          >
            Quét QR vé
          </Button>
        )}

        {isScannerVisible && isScanning && (
          <div style={{ width: "400px" }}>
            <Scanner onScan={handleScan} scanDelay={300} />
          </div>
        )}

        <Modal
          title="Kết quả quét mã QR"
          open={isModalVisible}
          onOk={handlePrint}
          onCancel={handleConfirm}
          okText="In vé"
          cancelText="Đóng"
          style={{ maxHeight: "80vh" }} // Giới hạn chiều cao modal
          bodyStyle={{ overflowY: "auto", maxHeight: "60vh" }} // Kích hoạt thanh cuộn cho phần nội dung
        >
          <div ref={printRef} style={{ marginBottom: "10px" }}>
            {scannedData?.showSeatNumberList?.split(", ").map((seat, index) => (
              <div className="cardWrap" key={seat}>
                <div className="card cardLeft">
                  <h1>{scannedData?.theaterName}</h1>
                  <div className="title">
                    <h2>{scannedData?.movieTitle}</h2>
                  </div>
                  <div className="name">
                    <h2>{scannedData?.roomName}</h2>
                  </div>
                  <div className="seat">
                    <span>seat</span>
                    <h2>{seat}</h2>
                  </div>
                  <div className="time">
                    <span>time</span>
                    <h2>
                      {dayjs(scannedData?.timeStart, "HH:mm:ss").format(
                        "HH:mm"
                      ) +
                        "  " +
                        scannedData?.date}
                    </h2>
                  </div>
                </div>
                <div className="card cardRight">
                  <div className="eye"></div>
                  <div className="number">
                    <h3>{seat}</h3>
                    <span>seat</span>
                  </div>
                </div>
              </div>
            ))}

            <div className="cardWrap">
              <div className="card cardLeft">
                <h1>{scannedData?.theaterName}</h1>
                <div>
                  <ul className="title">
                    {scannedData?.foodBookingList.map((food, index) => (
                      <li key={food.foodName}>
                        <h2>{food.foodName + " x " + food.quantity}</h2>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="card cardRight">
                <div className="code">
                  <h3>{scannedData?.bookingCode}</h3>
                  <span>code</span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ScanQR;
