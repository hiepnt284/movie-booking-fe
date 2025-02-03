import React from "react";
import ManageDayPrice from "../components/ManageDayPrice";
import ManageRoomType from "../components/ManageRoomType";
import ManageSeatType from "../components/ManageSeatType";
import Title from "antd/es/typography/Title";

const ManageTicketPrice = () => {
  return (
    <div>
      <Title level={4}>Quản lý giá vé</Title>
      <div style={{display:"flex", justifyContent:"space-around"}}>
        <ManageDayPrice />
        <ManageRoomType />
        <ManageSeatType/>
      </div>
    </div>
  );
};

export default ManageTicketPrice;
