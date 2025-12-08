import { useEffect, useState } from "react";
import { api } from "../api/axios";
import ReportIssueModal from "../components/ReportIssueModal";
import {
  Box,
  Typography,
  Button,
  Chip,
  Card
} from "@mui/material";

export default function RangerDashboard() {
  const [issues, setIssues] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [openModal, setOpenModal] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  // Load issues from backend
  const loadIssues = async () => {
    const res = await api.get("/api/issues/my");
    setIssues(res.data);
  };

  useEffect(() => {
    loadIssues();
  }, []);

  const filteredIssues = issues.filter((i) =>
    filter === "ALL" ? true : i.status === filter
  );

  return (
    <Box sx={{ display: "flex", height: "100vh", background: "#0D0F1A" }}>
      {/* SIDEBAR */}
      <Box
        sx={{
          width: 260,
          background: "#131723",
          p: 3,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Top Section */}
        <Box>
          <Typography variant="h5" sx={{ color: "#7D3CFF", mb: 4 }}>
            Facility Ops
          </Typography>

          {/* Dashboard Button */}
          <Button
            fullWidth
            variant="contained"
            sx={{
              mb: 2,
              background: "linear-gradient(to right, #7D3CFF, #00E6FF)",
              color: "white",
            }}
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            Dashboard
          </Button>

          {/* My Issues Button */}
          <Button
            fullWidth
            variant="contained"
            sx={{
              background: "linear-gradient(to right, #7D3CFF, #00E6FF)",
              color: "white",
            }}
            onClick={() => {
              document
                .getElementById("my-issues")
                .scrollIntoView({ behavior: "smooth" });
            }}
          >
            My Issues
          </Button>
        </Box>

        {/* User Info Section */}
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Box
            sx={{
              background: "#141824",
              padding: "12px 16px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.1)",
              mb: 2,
            }}
          >
            <Typography sx={{ fontSize: "18px", fontWeight: 600 }}>
              {user?.name}
            </Typography>
            <Typography sx={{ fontSize: "13px", color: "gray" }}>
              {user?.email}
            </Typography>
          </Box>

          {/* Logout */}
          <Button
            color="error"
            variant="outlined"
            fullWidth
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {/* MAIN CONTENT */}
      <Box sx={{ flex: 1, p: 4, color: "white", overflowY: "auto" }}>
        
        {/* Welcome */}
        <Typography variant="h4" fontWeight="bold">
          Welcome {user?.name},
        </Typography>

        <Typography sx={{ mt: 1, mb: 3, color: "gray" }}>
          Report and track facility issues
        </Typography>

        {/* Report Button */}
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            sx={{
              background: "linear-gradient(to right, #7D3CFF, #00E6FF)",
            }}
            onClick={() => setOpenModal(true)}
          >
            + Report New Issue
          </Button>
        </Box>

        {/* Stats */}
        <Box sx={{ display: "flex", gap: 3, mt: 3 }}>
          <StatCard title="Total Issues" value={issues.length} />
          <StatCard
            title="Open"
            value={issues.filter((i) => i.status === "OPEN").length}
          />
          <StatCard
            title="In Progress"
            value={issues.filter((i) => i.status === "IN_PROGRESS").length}
          />
          <StatCard
            title="Completed"
            value={issues.filter((i) => i.status === "COMPLETED").length}
          />
        </Box>

        {/* Filters */}
        <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
          {["ALL", "OPEN", "IN_PROGRESS", "COMPLETED"].map((f) => (
            <Button
              key={f}
              variant={filter === f ? "contained" : "outlined"}
              sx={{
                color: "white",
                borderColor: "#7D3CFF",
                background:
                  filter === f
                    ? "linear-gradient(to right, #7D3CFF, #00E6FF)"
                    : "transparent",
              }}
              onClick={() => setFilter(f)}
            >
              {f === "ALL" ? "All" : f.replace("_", " ")}
            </Button>
          ))}
        </Box>

        {/* My Issues */}
        <Typography id="my-issues" variant="h5" sx={{ mt: 4, mb: 2 }}>
          My Issues
        </Typography>

        {filteredIssues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </Box>

      {/* Modal */}
      <ReportIssueModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onCreated={loadIssues}
      />
    </Box>
  );
}

/* --- Components ---- */

function StatCard({ title, value }) {
  return (
    <Card
      sx={{
        flex: 1,
        p: 3,
        background: "#131723",
        borderRadius: 2,
      }}
    >
      <Typography sx={{ color: "gray", fontSize: 14 }}>{title}</Typography>
      <Typography variant="h4">{value}</Typography>
    </Card>
  );
}

function IssueCard({ issue }) {
  const priorityColors = {
    CRITICAL: "#8B0000",
    HIGH: "#FF4444",
    MEDIUM: "#FACC15",
    LOW: "#FFE680",
  };

  const calculateRemaining = () => {
    if (issue.slaBreached) return "SLA Breached";
    if (!issue.slaDeadline) return "";

    const now = new Date();
    const end = new Date(issue.slaDeadline);
    const diff = end - now;

    if (diff <= 0) return "SLA Breached";

    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;

    return hrs > 0 ? `${hrs}h ${rem}m` : `${rem}m`;
  };

  const [remaining, setRemaining] = useState(calculateRemaining());

  // 🟢 LIVE UPDATE TIMER EVERY 30 SECONDS
  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(calculateRemaining());
    }, 30000); // updates every 30s

    return () => clearInterval(interval); // cleanup
  }, []);

  return (
    <Card
      sx={{
        background: "#131723",
        borderRadius: 3,
        p: 3,
        mb: 2,
        border: "1px solid #222",
      }}
    >
      <Typography variant="h6" sx={{ color: "#7D3CFF" }}>
        Issue #{issue.id} <span style={{ color: "white" }}>{issue.title}</span>
      </Typography>

      <Typography sx={{ color: "gray", my: 1 }}>{issue.description}</Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {/* Priority */}
        <Chip
          label={issue.priority}
          size="small"
          sx={{
            backgroundColor: priorityColors[issue.priority],
            color: issue.priority === "LOW" ? "black" : "white",
            fontWeight: 600,
          }}
        />

        {/* Status */}
        <Chip
          label={issue.status.replace("_", " ")}
          color="primary"
          size="small"
        />

        {/* SLA TIMER */}
        <Chip
          label={remaining}
          sx={{
            ml: "auto",
            background:
              remaining === "SLA Breached" ? "#FF3B30" : "#00E6FF",
            color: "black",
            fontWeight: 600,
          }}
        />
      </Box>
    </Card>
  );
}