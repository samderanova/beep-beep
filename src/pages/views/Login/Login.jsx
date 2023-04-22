import { useState } from "react";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/router";
import styles from "./Login.module.scss";
import { Button, Form } from "react-bootstrap";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

export default function Login() {
    const router = useRouter();
    const [isSignUp, setIsSignUp] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

    function handleLogin(e) {
        e.preventDefault();
        console.log(isSignUp);
        if (!isSignUp) {
            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    router.push("/search");
                })
                .catch((err) => {
					const errorCode = err.code;
					const errorMessage = err.message;
				});
        } else {
            if (password === confirmPassword) {
                console.log(auth.config);
                createUserWithEmailAndPassword(auth, email, password)
                    .then((userCredential) => {
                        const user = userCredential.user;
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
                <Form.Group
                    className="mb-3"
                    controlId="confirmPassword"
                >
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control
                        type="password"
                        value={confirmPassword}
                        onChange={(e) =>
                            setConfirmPassword(e.target.value)
                        }
                    />
                </Form.Group>
					) : null}
            <Form.Group className="mb-3">
                <Button
                    className="p-0 border-0"
                    variant="none"
                    onClick={(_) => setIsSignUp(!isSignUp)}
                >
                    <Form.Text>
                        {!isSignUp ? "Create Account" : "Login"}
                    </Form.Text>
                </Button>
            </Form.Group>
            <Button type="submit" onClick={handleLogin}>
				{isSignUp ? "Create Account" : "Login"}
			</Button>
        </Form>
    </div>
    );
}
