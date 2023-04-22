import { useState } from "react";
import { useRouter } from "next/router";
import { Button, Form, Alert } from "react-bootstrap";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { Formik } from "formik";
import * as yup from "yup";
import { auth } from "@/lib/firebase";
import styles from "./Login.module.scss";

const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

const initialValues = {
  email: "",
  password: "",
  confirmPassword: "",
}

const validationSchema = yup.object({
  email: yup
    .string()
    .required("Please enter your email")
    .matches(EMAIL_REGEX, "Sorry, the email address is not valid."),
  password: yup
    .string()
    .required("Please enter a password"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")])
});

export default function Login() {
  const router = useRouter();
  // const [isSignUp, setIsSignUp] = useState(false);
  // const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");
  // const [confirmPassword, setConfirmPassword] = useState("");
  // const [errorMessage, setErrorMessage] = useState("");
  // const [isValid, setIsValid] = useState(true);

  function handleLogin(e) {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false || password !== confirmPassword) {
      setIsValid(false);
    } else {
      if (!isSignUp) {
        signInWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            router.push("/search");
          })
          .catch((err) => {
            const errorCode = err.code;
            const errorMessage = err.message;
            setIsValid(false);
          });
      } else {
        if (password === confirmPassword) {
          createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
              router.push("/search");
            })
            .catch((err) => {
              const errorCode = err.code;
              const errorMessage = err.message;
              console.log(errorMessage);
            });
        } else {
          setIsValid(false);
          //setErrorMessage("Passwords do not match.");
        }
      }
    }
  }

  return (
    <div className={styles.login}>
      <h1>{isSignUp ? "Create Account" : "Login"}</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleLogin}
      >
        {({
          values,
          touched,
          errors,
          setFieldValue,
          handleSubmit,
        }) => (
          <Form noValidate validated={!isValid} className={styles.form} onSubmit={handleLogin}>
            {isValid ? null : <Alert variant="danger">Error: Please enter valid username and password.</Alert>}
        
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={values.email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Form.Control.Feedback type="invalid">
                  Please enter an email.
                </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Form.Control.Feedback type="invalid">
                  Please enter a password.
                </Form.Control.Feedback>
            </Form.Group>
            {isSignUp ? (
              <Form.Group className="mb-3" controlId="confirmPassword">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Form.Control.Feedback type="invalid">
                  Please re-enter password.
                </Form.Control.Feedback>
              </Form.Group>
            ) : null}
            <Form.Control.Feedback type="invalid">
                Password not found.
              </Form.Control.Feedback>
            <Form.Group className="mb-3">
              <Button
                className="p-0 border-0"
                variant="none"
                onClick={(_) => setIsSignUp(!isSignUp)}
              >
                <Form.Text>{!isSignUp ? "Create Account" : "Login"}</Form.Text>
              </Button>
            </Form.Group>
            <Button type="submit">
              {isSignUp ? "Create Account" : "Login"}
            </Button>
          </Form>
        )}
      
      </Formik>
    </div>
  );
}
