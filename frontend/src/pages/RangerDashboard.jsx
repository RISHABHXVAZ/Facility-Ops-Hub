import { useEffect, useState } from "react";
import { api } from "../api/axios";
import {
  Box,
  Typography,
  Button,
  Chip,
  Card,
  Drawer,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Badge
} from "@mui/material";

import SendIcon from "@mui/icons-material/Send";

export default function RangerDashboard() {
  const [issues, setIssues] = useState([]);
  const [viewMode, setViewMode] = useState("ACTIVE"); // ACTIVE | CLOSED
  const [openModal, setOpenModal] = useState(false);

  const [commentDrawerOpen, setCommentDrawerOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentCounts, setCommentCounts] = useState({});

  const user = JSON.parse(localStorage.getItem("user"));

  // -------------------------------
  // LOAD ISSUES + COMMENT COUNTS
  // -------------------------------
  const loadIssues = async () => {
    const res = await api.get("/api/issues/my");
    setIssues(res.data);

    const counts = {};
    for (let issue of res.data) {
      const res2 = await api.get(`/api/issues/${issue.id}/comments`);
      counts[issue.id] = res2.data.length;
    }
    setCommentCounts(counts);
  };

  // -------------------------------
  // LOAD COMMENTS FOR ISSUE
  // -------------------------------
  const loadComments = async (issueId) => {
    const res = await api.get(`/api/issues/${issueId}/comments`);
    setComments(res.data);
  };

  // -------------------------------
  // ADD COMMENT
  // -------------------------------
  const submitComment = async () => {
    if (!newComment.trim()) return;

    await api.post(`/api/issues/${selectedIssue.id}/comments`, {
      message: newComment,
    });

    setNewComment("");
    loadComments(selectedIssue.id);
    loadIssues();
  };

  // -------------------------------
  useEffect(() => {
    loadIssues();
  }, []);

  // -------------------------------
  // FILTER ACTIVE / CLOSED ISSUES
  // -------------------------------
  const activeIssues = issues.filter((i) => i.status !== "CLOSED");
  const closedIssues = issues.filter((i) => i.status === "CLOSED");

  const displayedIssues = viewMode === "ACTIVE" ? activeIssues : closedIssues;

  // -------------------------------
  // OPEN COMMENTS DRAWER
  // -------------------------------
  const openCommentDrawer = (issue) => {
    setSelectedIssue(issue);
    loadComments(issue.id);
    setCommentDrawerOpen(true);
  };

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
        <Box>
          <Typography variant="h5" sx={{ color: "#7D3CFF", mb: 4 }}>
            Facility Ops
          </Typography>

          <Button
            fullWidth
            variant="contained"
            sx={{
              mb: 2,
              background: "linear-gradient(to right, #7D3CFF, #00E6FF)",
              color: "white",
            }}
            onClick={() => setViewMode("ACTIVE")}
          >
            Active Issues
          </Button>

          <Button
            fullWidth
            variant="contained"
            sx={{
              background: "linear-gradient(to right, #7D3CFF, #00E6FF)",
              color: "white",
            }}
            onClick={() => setViewMode("CLOSED")}
          >
            Previous Issues
          </Button>
        </Box>

        {/* USER SECTION */}
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

        {/* HEADER */}
        <Typography variant="h4" fontWeight="bold">
          Welcome {user?.name},
        </Typography>

        <Typography sx={{ mt: 1, mb: 3, color: "gray" }}>
          {viewMode === "ACTIVE"
            ? "Track your active issues and collaborate via comments."
            : "View previously closed issues."}
        </Typography>

        <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
          {viewMode === "ACTIVE"
            ? `My Active Issues (${activeIssues.length})`
            : `Previous Issues (${closedIssues.length})`}
        </Typography>

        {displayedIssues.map((issue) => (
          <IssueCard
            key={issue.id}
            issue={issue}
            commentCount={commentCounts[issue.id] || 0}
            onOpenComments={() => openCommentDrawer(issue)}
          />
        ))}
      </Box>

      {/* COMMENT DRAWER */}
      <Drawer
        anchor="right"
        open={commentDrawerOpen}
        onClose={() => setCommentDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 380,
            background: "#1A1D2E",
            color: "white",
            p: 2,
          },
        }}
      >
        {selectedIssue && (
          <>
            <Typography variant="h6" sx={{ mb: 2, color: "#7D3CFF" }}>
              Comments — Issue #{selectedIssue.id}
            </Typography>

            <List sx={{ maxHeight: "70vh", overflowY: "auto" }}>
              {comments.map((c) => (
                <ListItem key={c.id} alignItems="flex-start">
                  <Avatar sx={{ bgcolor: "#7D3CFF", mr: 2 }}>
                    {c.createdByName[0]}
                  </Avatar>
                  <ListItemText
                    primary={
                      <>
                        <strong>{c.createdByName}</strong>{" "}
                        <span style={{ color: "gray", fontSize: "12px" }}>
                          ({new Date(c.createdAt).toLocaleString()})
                        </span>
                      </>
                    }
                    secondary={c.message}
                  />
                </ListItem>
              ))}
            </List>

            {/* ADD COMMENT */}
            <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
              <TextField
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                sx={{
                  flex: 1,
                  background: "#131723",
                  borderRadius: 2,
                }}
                InputProps={{ style: { color: "white" } }}
              />
              <IconButton onClick={submitComment} color="primary">
                <SendIcon />
              </IconButton>
            </Box>
          </>
        )}
      </Drawer>
    </Box>
  );
}

/* ------------------------------------------
   ISSUE CARD COMPONENT WITH COMMENT COUNT
------------------------------------------- */

function IssueCard({ issue, commentCount, onOpenComments }) {
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

  return (
    <Card
      sx={{
        background: "#131723",
        borderRadius: 3,
        p: 3,
        mb: 2,
        border: "1px solid #222",
        position: "relative",
      }}
    >
      <Badge
        badgeContent={commentCount}
        color="primary"
        sx={{ position: "absolute", top: 10, right: 10 }}
      />

      <Typography variant="h6" sx={{ color: "#7D3CFF" }}>
        Issue #{issue.id} — <span style={{ color: "white" }}>{issue.title}</span>
      </Typography>

      <Typography sx={{ color: "gray", my: 1 }}>{issue.description}</Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Chip
          label={issue.priority}
          sx={{
            backgroundColor: priorityColors[issue.priority],
            color: issue.priority === "LOW" ? "black" : "white",
          }}
        />

        <Chip
          label={issue.status.replace("_", " ")}
          color="primary"
        />

        <Chip
          label={calculateRemaining()}
          sx={{
            ml: "auto",
            background: issue.slaBreached ? "#FF3B30" : "#00E6FF",
            color: "black",
          }}
        />
      </Box>

      <Button variant="outlined" sx={{ mt: 2 }} onClick={onOpenComments}>
        View Comments
      </Button>
    </Card>
  );
}
