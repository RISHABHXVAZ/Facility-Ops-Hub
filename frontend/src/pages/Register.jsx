import { Box, Button, Card, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { registerUser } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      await registerUser(form);
      alert("Registration successful!");
      navigate("/login");
    } catch (error) {
      alert("Registration failed");
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
          width: 450,
          p: 4,
          backgroundColor: "background.paper",
          color: "white",
          borderRadius: 3,
        }}
      >
        <Typography variant="h5" textAlign="center" mb={3}>
          Register
        </Typography>

        <TextField
          name="name"
          label="Name"
          fullWidth
          variant="filled"
          onChange={handleChange}
          sx={{ mb: 2 }}
        />

        <TextField
          name="email"
          label="Email"
          fullWidth
          variant="filled"
          onChange={handleChange}
          sx={{ mb: 2 }}
        />

        <TextField
          name="password"
          label="Password"
          type="password"
          fullWidth
          variant="filled"
          onChange={handleChange}
          sx={{ mb: 2 }}
        />

        <TextField
          name="role"
          label="Role (ADMIN / SUPERVISOR / ENGINEER / RANGER)"
          fullWidth
          variant="filled"
          onChange={handleChange}
          sx={{ mb: 3 }}
        />

        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          onClick={handleRegister}
        >
          Register
        </Button>
      </Card>
    </Box>
  );
}
