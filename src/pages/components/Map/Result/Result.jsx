import { Row, Col, Form } from "react-bootstrap";

export default function Result({ count, result }) {
  return (
    <Row>
      <Col xs={9}>
        <strong>
          {count}. {result.name}
        </strong>
        <p>{result.location}</p>
      </Col>
      <Col className="text-end">
        <Form.Check />
      </Col>
    </Row>
  );
}
