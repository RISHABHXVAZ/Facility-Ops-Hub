import { createTheme } from "@mui/material";

export const theme = createTheme({
  palette: {
    primary: { main: "#7D3CFF" },    // Purple
    secondary: { main: "#00E6FF" },  // Cyan
    success: { main: "#4ADE80" },
    warning: { main: "#FACC15" },
    error: { main: "#EF4444" },
    background: {
      default: "#0D0F1A",
      paper: "#1A1F2C",
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#D1D5DB",
    },
  },
  typography: {
    fontFamily: "Inter, sans-serif",
  },
});
