import React, { useEffect, useState } from "react";
import { Card, Flex, List, Typography } from "antd";
import theaterApi from "../api/theaterApi";
import { Link, useParams } from "react-router-dom";

const { Title, Text } = Typography;

const CinemaDetail = () => {
  const { cinemaId } = useParams();
  const [theater, setTheater] = useState(null);
  const [otherTheaters, setOtherTheaters] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await theaterApi.get(cinemaId);
      setTheater(response.result);
    };
    const fetchOtherTheaters = async () => {
      const response = await theaterApi.getAllForUser();
      setOtherTheaters(response.result);
    };
    fetchData();
    fetchOtherTheaters();
  }, [cinemaId]);

  if (!theater) return <p>Loading...</p>;

  return (
    <div
      style={{
        display: "flex",
        padding: "40px 140px",
        backgroundColor: "white",
        gap: "20px",
      }}
    >
      <div
        style={{
          flex: 2,
          padding: "20px",
          border: "1px solid lightgray",
          borderRadius: "10px",
        }}
      >
        <Title level={3} style={{ color: "#1677ff" }}>
          {theater.name.toUpperCase()}
        </Title>
        <ul
          style={{
            listStyleType: "initial",
            fontSize: "18px",
            paddingLeft: "25px",
          }}
        >
          <li style={{ marginBottom: "10px" }}><span style={{fontWeight:"bold"}}>Địa điểm:</span> {theater.address}</li>
          <li style={{ marginBottom: "10px" }}>
            <span style={{fontWeight:"bold"}}>Hotline:</span> {theater.phone}
          </li>
          <li style={{ marginBottom: "20px" }}><span style={{fontWeight:"bold"}}>Email:</span> {theater.email}</li>
        </ul>
        <div>
          <img alt={theater.name} src={theater.img} width={800} height={400} />
        </div>
        <br />
        <Text style={{fontSize:"18px"}}>{theater.description}</Text>
      </div>
      <div
        style={{
          flex: 1,
          padding: "20px",
          border: "1px solid #1677ff",
          borderRadius: "7px",
          alignSelf:"flex-start"
        }}
      >
        <Title level={4} style={{ textAlign: "center" }}>
          Địa điểm khác
        </Title>
        <List
          dataSource={otherTheaters}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={
                  <Link style={{ color: "#1677ff" }} to={`/cinema/${item.id}`}>
                    <Flex gap={10}>
                      <img
                        height={28}
                        src="https://res.cloudinary.com/daa0uijud/image/upload/v1730540205/logo-final_1_ch5dfa.png"
                        alt=""
                      />
                      <span style={{ fontSize: "16px" }}>{item.name}</span>
                    </Flex>
                  </Link>
                }
              />
            </List.Item>
          )}
        />
      </div>
    </div>
  );
};

export default CinemaDetail;
