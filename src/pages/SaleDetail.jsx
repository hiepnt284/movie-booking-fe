import React, { useEffect, useState } from "react";
import { Card, Col, Flex, List, Row, Typography } from "antd";
import postApi from "../api/postApi";
import { Link, useParams } from "react-router-dom";
import ReactQuill from "react-quill";

const { Title, Text } = Typography;

const SaleDetail = () => {
  const { saleId } = useParams();
  const [sale, setSale] = useState(null);
  const [otherSales, setOtherSales] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await postApi.get(saleId);
      setSale(response.result);
    };
    const fetchOtherSales = async () => {
      const response = await postApi.getAllForUser();
      setOtherSales(response.result);
    };
    fetchData();
    fetchOtherSales();
  }, [saleId]);

  if (!sale) return <p>Loading...</p>;

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
        <Title level={3}>{sale.title}</Title>
        <ReactQuill value={sale.content} readOnly={true} theme={"bubble"} />
      </div>
      <div
        style={{
          flex: 1,
          padding: "20px",
          border: "1px solid #1677ff",
          borderRadius: "7px",
          alignSelf: "flex-start",
        }}
      >
        <Title level={4} style={{ textAlign: "center" }}>
          Tin khác
        </Title>
        <Row gutter={[16, 16]}>
          {otherSales.map((post) => (
            <Col key={post.id} xs={24} sm={24} md={12}>
              <Link to={`/sale/${post.id}`}>
                <img
                  alt={post.title}
                  src={post.thumbnail}
                  width={150}
                  height={115}
                />
                <Title level={5}>{post.title}</Title>
                {/* <Card.Meta title={post.title} style={{ fontSize: "10px" }} /> */}
              </Link>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default SaleDetail;
