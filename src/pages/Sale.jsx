import React, { useEffect, useState } from "react";
import { Card, Row, Col } from "antd";
import postApi from "../api/postApi";

import Title from "antd/es/typography/Title";
import "./style/Sale.css";
import { Link } from "react-router-dom";
const Sale = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await postApi.getAllForUser();
      setPosts(response.result);
    };
    fetchData();
  }, []);

  return (
    <div style={{ padding: "40px 140px", backgroundColor: "white" }}>
      <Title level={2} style={{ textAlign: "center", marginBottom: "30px" }}>
        Tin mới, ưu đãi
      </Title>
      <Row gutter={[16, 16]}>
        {posts.map((post) => (
          <Col key={post.id} xs={24} sm={12} md={6}>
            <Link to={`/sale/${post.id}`}>
              <Card
                cover={
                  <img
                    alt={post.title}
                    src={post.thumbnail}
                    width={300}
                    height={230}
                  />
                }
                hoverable
              >
                <Card.Meta title={post.title} style={{ fontSize: "16px" }} />
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Sale;
