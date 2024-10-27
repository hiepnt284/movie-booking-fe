import { Link, useRouteError } from "react-router-dom";
import { Button, Flex, Result, Typography } from "antd";

const { Title, Paragraph } = Typography;

export default function ErrorPage() {
  const error = useRouteError();

  return (
    // <Flex  align="center" justify="center">
    //   <div>
    //     <Title>Oops!</Title>
    //     <Paragraph>Sorry, an unexpected error has occurred.</Paragraph>
    //     <Paragraph>
    //       <i>{error.statusText || error.message}</i>
    //     </Paragraph>
    //   </div>
    // </Flex>
    <Result
      status="404"
      title="404"
      subTitle={`Sorry, the page you visited does not exist. ${
        error.statusText || error.message
      }`}
      extra={<Link to={"/"}><Button type="primary" >Back Home</Button></Link>}
    />
  );
}
