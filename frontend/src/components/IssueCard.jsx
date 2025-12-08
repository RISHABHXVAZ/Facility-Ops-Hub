import { Card, Box, Typography, Chip, Tooltip } from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { useEffect, useState } from "react";
import { api } from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function IssueCard({ issue }) {
  const navigate = useNavigate();
  const [commentCount, setCommentCount] = useState(0);
  const [remaining, setRemaining] = useState("");

  const priorityColors = {
    CRITICAL: "#EF4444",
    HIGH: "#F97316",
    MEDIUM: "#FACC15",
    LOW: "#4ADE80",
  };

  // Load comment count
  const loadCommentCount = async () => {
    const res = await api.get(`/api/issues/${issue.id}/comments`);
    setCommentCount(res.data.length);
  };

  // SLA Timer
  const computeRemaining = () => {
    if (!issue.slaDeadline) return "";

    const now = new Date();
    const end = new Date(issue.slaDeadline);
    const diff = end - now;

    if (diff <= 0) return "SLA Breached";

    const mins = Math.floor(diff / 60000);
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  useEffect(() => {
    loadCommentCount();
    setRemaining(computeRemaining());

    // live countdown
    const timer = setInterval(() => {
      setRemaining(computeRemaining());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Card
      sx={{
        p: 2,
        mb: 2,
        cursor: "pointer",
        background: "#131723",
        border: "1px solid #222",
        "&:hover": { opacity: 0.9 },
      }}
      onClick={() => navigate(`/issue/${issue.id}`)}
    >
      {/* Title + Priority */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" sx={{ color: "white" }}>
          {issue.title}
        </Typography>

        <Chip
          label={issue.priority}
          sx={{
            background: priorityColors[issue.priority],
            color: issue.priority === "LOW" ? "black" : "white",
            fontWeight: 600,
          }}
          size="small"
        />
      </Box>

      {/* Status */}
      <Typography sx={{ color: "gray", mt: 1 }}>
        Status: <b style={{ color: "white" }}>{issue.status.replace("_", " ")}</b>
      </Typography>

      {/* SLA Deadline */}
      <Typography sx={{ color: "gray", mt: 1 }}>
        SLA:{" "}
        <b
          style={{
            color: remaining === "SLA Breached" ? "#FF4444" : "#00E6FF",
          }}
        >
          {remaining}
        </b>
      </Typography>

      {/* Comment Count */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mt: 1.5,
          color: "#9CA3AF",
        }}
      >
        <ChatBubbleOutlineIcon fontSize="small" />
        <Typography>{commentCount} comments</Typography>
      </Box>
    </Card>
  );
}
