import { useState } from "react";
import { useRouter } from "next/router";
import { Button, Form } from "react-bootstrap";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import styles from "./Login.module.scss";

export default function Login() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function handleLogin(e) {
    e.preventDefault();
    if (!isSignUp) {
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          router.push("/search");
        })
        .catch((err) => {
          const errorCode = err.code;
          const errorMessage = err.message;
        });
    } else {
      if (password === confirmPassword) {
        createUserWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            const user = userCredential.user;
            setDoc(doc(db, "users", user.uid), {
              scheduled: [],
              unscheduled: [],
            });
            router.push("/search");
          })
          .catch((err) => {
            const errorCode = err.code;
            const errorMessage = err.message;
          });
      }
    }
  }

  return (
    <div className={styles.login}>
      <h1>{isSignUp ? "Create Account" : "Login"}</h1>
      <Form className={styles.form}>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        {isSignUp ? (
          <Form.Group className="mb-3" controlId="confirmPassword">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Form.Group>
        ) : null}
        <Form.Group className="mb-3">
          <Button
            className="p-0 border-0"
            variant="none"
            onClick={(_) => setIsSignUp(!isSignUp)}
          >
            <Form.Text>{!isSignUp ? "Create Account" : "Login"}</Form.Text>
          </Button>
        </Form.Group>
        <Button type="submit" onClick={handleLogin}>
          {isSignUp ? "Create Account" : "Login"}
        </Button>
      </Form>
    </div>
  );
}
