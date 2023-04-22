import { useState } from "react";
import { useRouter } from "next/router";
import { Button, Form, Alert } from "react-bootstrap";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { Formik, Field } from "formik";
import * as yup from "yup";
import { auth } from "@/lib/firebase";
import styles from "./Login.module.scss";

const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

const initialValues = {
  email: "",
  password: "",
  confirmPassword: "",
};

const validationSchemaSignUp = yup.object({
  email: yup
    .string()
    .required("Please enter your email")
    .matches(EMAIL_REGEX, "Sorry, the email address is not valid."),
  password: yup
    .string()
    .required("Please enter your password")
    .min(6, "Password must be at least 6 characters."),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Sorry, passwords do not match."),
});

const validationSchemaLogin = yup.object({
  email: yup
    .string()
    .required("Please enter your email")
    .matches(EMAIL_REGEX, "Sorry, the email address is not valid."),
  password: yup.string().required("Please enter your password"),
  confirmPassword: yup.string().notRequired(),
});

export default function Login() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [successLogin, setSuccessLogin] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const validationSchema = isSignUp
    ? validationSchemaSignUp
    : validationSchemaLogin;

  const handleLogin = (values, { setSubmitting }) => {
    setSuccessLogin(true);
    if (!isSignUp) {
      signInWithEmailAndPassword(auth, values.email, values.password)
        .then((_) => {
          router.push("/search");
        })
        .catch((_) => {
          setErrorMessage("Invalid email or password. Please try again.");
          setSubmitting(false);
          setSuccessLogin(false);
        });
    } else {
      createUserWithEmailAndPassword(auth, values.email, values.password)
        .then((_) => {
          router.push("/search");
        })
        .catch((_) => {
          setErrorMessage("Email is already in use.");
          setSubmitting(false);
          setSuccessLogin(false);
        });
    }
  };

  return (
    <div className={styles.login}>
      <h1>
        {successLogin ? "YES CHEF" : isSignUp ? "Create Account" : "Login"}
      </h1>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleLogin}
      >
        {({
          touched,
          errors,
          isSubmitting,
          handleSubmit,
          setValues,
          setTouched,
        }) => (
          <Form className={styles.form} onSubmit={handleSubmit}>
            {errorMessage === "" ? null : (
              <Alert variant="danger">{errorMessage}</Alert>
            )}
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Field
                name="email"
                placeholder="Email"
                as={Form.Control}
                type="email"
                isValid={touched.email && !errors.email}
                isInvalid={touched.email && errors.email}
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <Field
                name="password"
                placeholder="Password"
                as={Form.Control}
                type="password"
                isValid={touched.password && !errors.password}
                isInvalid={touched.password && errors.password}
              />
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
            </Form.Group>
            {isSignUp ? (
              <Form.Group className="mb-3" controlId="confirmPassword">
                <Form.Label>Confirm Password</Form.Label>
                <Field
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  as={Form.Control}
                  type="password"
                  isValid={touched.confirmPassword && !errors.confirmPassword}
                  isInvalid={touched.confirmPassword && errors.confirmPassword}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.confirmPassword}
                </Form.Control.Feedback>
              </Form.Group>
            ) : null}
            <Form.Group className="mb-3">
              <Button
                className="p-0 border-0"
                variant="none"
                onClick={(_) => {
                  setIsSignUp(!isSignUp);
                  setErrorMessage("");
                  setValues(initialValues);
                  setTouched({
                    email: false,
                    password: false,
                    confirmPassword: false,
                  });
                }}
              >
                <Form.Text>{!isSignUp ? "Create Account" : "Login"}</Form.Text>
              </Button>
            </Form.Group>
            <Button type="submit" disabled={isSubmitting}>
              {isSignUp ? "Create Account" : "Login"}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
}
