import { Box, Button, Typography } from "@mui/material";

export default function App() {
  return (
    <Box
      sx={{
        height: "100vh",
        background:
          "linear-gradient(135deg, #0D0F1A 0%, #1A1F2C 50%, #7D3CFF44 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        color: "white",
      }}
    >
      <Typography variant="h2" fontWeight={700}>
        Facility Ops Hub
      </Typography>

      <Typography variant="h6" sx={{ mt: 2, opacity: 0.8 }}>
        Command Center Operations & Issue Management System
      </Typography>

      <Button
        variant="contained"
        color="primary"
        size="large"
        sx={{ mt: 4, px: 4, py: 1.5, fontSize: "18px" }}
        onClick={() => (window.location.href = "/login")}
      >
        Login
      </Button>
    </Box>
    
    
  );
}
