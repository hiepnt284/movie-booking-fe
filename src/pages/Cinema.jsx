import React, { useEffect, useState } from "react";
import { Card, Button, Row, Col } from "antd";
import theaterApi from "../api/theaterApi";
import { Link } from "react-router-dom";
import Title from "antd/es/typography/Title";
import { FacebookShareButton } from "react-share";
import './style/Cinema.css'
const Cinema = () => {
  const [theaters, setTheaters] = useState([]);
  const shareUrl = "https://www.bhdstar.vn/rap-phim/";
  const title = "NTH CINEMA";

  useEffect(() => {
    const fetchData = async () => {
      const response = await theaterApi.getAllForUser();
      setTheaters(response.result);
    };
    fetchData();
  }, []);

  return (
    <div style={{ padding: "40px 140px", backgroundColor: "white" }}>
      <Title level={2} style={{ textAlign: "center", marginBottom: "30px" }}>
        Hệ thống rạp
      </Title>
      <Row gutter={[16, 16]}>
        {theaters.map((theater) => (
          <Col key={theater.id} xs={24} sm={12} md={6}>
              <Link to={`/cinema/${theater.id}`}>
                <Card
                  cover={
                    <img
                      alt={theater.name}
                      src={theater.img}
                      width={300}
                      height={230}
                    />
                  }
                  hoverable
                >
                  <Card.Meta
                    title={theater.name}
                    style={{ fontSize: "18px" }}
                    description={theater.address}
                  />
                  <div
                    style={{
                      marginTop: "20px",
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                    }}
                  >
                    <Link to={`/cinema/${theater.id}`}>
                      <Button type="primary" size="large">
                        Thông Tin Chi Tiết
                      </Button>
                    </Link>
  
                    <FacebookShareButton url={shareUrl} title={title}>
                      <Button type="default" size="large">
                        Chia Sẻ
                      </Button>
                    </FacebookShareButton>
                  </div>
                </Card>
              </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Cinema;
