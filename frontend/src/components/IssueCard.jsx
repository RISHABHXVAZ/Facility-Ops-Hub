import { Card, Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function IssueCard({ issue }) {
  const navigate = useNavigate();

  const priorityColors = {
    CRITICAL: "#EF4444",
    HIGH: "#F97316",
    MEDIUM: "#FACC15",
    LOW: "#4ADE80",
  };

  return (
    <Card
      sx={{
        p: 2,
        mb: 2,
        cursor: "pointer",
        "&:hover": { opacity: 0.85 },
      }}
      onClick={() => navigate(`/issue/${issue.id}`)}
    >
      <Box display="flex" justifyContent="space-between">
        <Typography variant="h6">{issue.title}</Typography>

        <Box
          sx={{
            backgroundColor: priorityColors[issue.priority],
            color: "black",
            px: 2,
            borderRadius: 1,
            fontWeight: 600,
          }}
        >
          {issue.priority}
        </Box>
      </Box>

      <Typography>Status: {issue.status}</Typography>
      <Typography>SLA Deadline: {issue.slaDeadline}</Typography>
    </Card>
  );
}
