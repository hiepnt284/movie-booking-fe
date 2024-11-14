import Title from "antd/es/typography/Title";
import React, { useEffect, useState } from "react";
import bookingApi from "../api/bookingApi";
import { useParams } from "react-router-dom";
import { Card, Flex } from "antd";
import Paragraph from "antd/es/typography/Paragraph";
import { CheckCircleFilled } from "@ant-design/icons";
import dayjs from "dayjs";

const PaymentSuccess = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await bookingApi.get(bookingId);
        setBooking(res.result);
        console.log(res.result);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <Flex style={{ minHeight: "600px" }} justify="center">
      <Card style={{ width: "500px", marginTop: "50px" }}>
        <Title style={{ textAlign: "center" }} level={4}>
          <CheckCircleFilled style={{ color: "#52c41a" }} />
          Đặt vé thành công
        </Title>
        <Paragraph>
          <span style={{ display: "inline-block", width: "200px" }}>
            Khách hàng:
          </span>{" "}
          {booking.userName}
        </Paragraph>
        <Paragraph>
          <span style={{ display: "inline-block", width: "200px" }}>
            Tổng tiền:
          </span>{" "}
          {booking.totalPrice}
        </Paragraph>
        <Paragraph>
          <span style={{ display: "inline-block", width: "200px" }}>
            Thời gian thanh toán:
          </span>{" "}
          {dayjs(booking.bookingDate).format("DD/MM/YYYY HH:mm:ss")}
        </Paragraph>
        <Paragraph>
          <span style={{ display: "inline-block", width: "200px" }}>Phim:</span>{" "}
          {booking.movieTitle}
        </Paragraph>
        <Paragraph>
          <span style={{ display: "inline-block", width: "200px" }}>
            Thời gian:
          </span>{" "}
          {booking.date} {booking.timeStart}
        </Paragraph>
        <Paragraph>
          <span style={{ display: "inline-block", width: "200px" }}>Rạp:</span>{" "}
          {booking.theaterName}
        </Paragraph>
        <Paragraph>
          <span style={{ display: "inline-block", width: "200px" }}>
            Phòng chiếu:
          </span>{" "}
          {booking.roomName}
        </Paragraph>
        <Paragraph>
          <span style={{ display: "inline-block", width: "200px" }}>Ghế:</span>{" "}
          {booking.showSeatNumberList}
        </Paragraph>
        <Paragraph>
          <span style={{ display: "inline-block", width: "200px" }}>
            Mã vé:
          </span>{" "}
          {booking.bookingCode}
        </Paragraph>
        <Flex>
          <Paragraph>
            <span style={{ display: "inline-block", width: "200px" }}>
              Đồ ăn:
            </span>
          </Paragraph>
          <div>
            {booking.foodBookingList.map((item) => (
              <Paragraph key={item.foodName}>
                <span style={{ display: "inline-block", width: "200px" }}>
                  {item.quantity} x {item.foodName}
                </span>
              </Paragraph>
            ))}
          </div>
        </Flex>
        <Paragraph>
          <span style={{ display: "inline-block", width: "200px" }}>
            Mã QR: 
          </span>
        </Paragraph>
        <Flex justify="center"><img src={booking.qrCode} alt="" width={200} /></Flex>
      </Card>
    </Flex>
  );
};

export default PaymentSuccess;
