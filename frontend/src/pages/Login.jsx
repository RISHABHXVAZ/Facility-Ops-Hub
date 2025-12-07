import { Box, Button, Card, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { loginUser } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setErrorMessage("");

      const res = await loginUser({ email, password });

      // Save token + role to localStorage
      localStorage.setItem("token", res.token);
      localStorage.setItem("role", res.role);
      localStorage.setItem("name", res.name);

      // Redirect based on role
      navigate("/" + res.role.toLowerCase());
    } catch (err) {
      setErrorMessage("New user? Register first");
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "background.default",
      }}
    >
      <Card
        sx={{
          width: 400,
          p: 4,
          backgroundColor: "background.paper",
          color: "white",
          borderRadius: 3,
        }}
      >
        <Typography variant="h5" textAlign="center" mb={3}>
          Login
        </Typography>

        {errorMessage && (
          <Typography color="error" textAlign="center" mb={2}>
            {errorMessage}
          </Typography>
        )}

        <TextField
          label="Email"
          variant="filled"
          fullWidth
          sx={{ mb: 2 }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          label="Password"
          type="password"
          variant="filled"
          fullWidth
          sx={{ mb: 3 }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={handleLogin}
        >
          Sign In
        </Button>

        <Typography textAlign="center" mt={2}>
          New user?{" "}
          <span
            style={{ color: "#00E6FF", cursor: "pointer" }}
            onClick={() => navigate("/register")}
          >
            Register here
          </span>
        </Typography>
      </Card>
    </Box>
  );
}
