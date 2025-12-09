import { useEffect, useState, useMemo } from "react";
import { api } from "../api/axios";

import {
  Box,
  Typography,
  Card,
  Button,
  Chip,
  Avatar,
  TextField,
  Drawer,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Divider
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SendIcon from "@mui/icons-material/Send";
import NotificationsIcon from "@mui/icons-material/Notifications";

import SockJS from "sockjs-client/dist/sockjs";
import { Client } from "@stomp/stompjs";
import { useSnackbar } from "notistack";

export default function SupervisorDashboard() {
  const [assignedIssues, setAssignedIssues] = useState([]);
  const [myIssues, setMyIssues] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  const [selectedTab, setSelectedTab] = useState("ASSIGNED");

  const [commentDrawerOpen, setCommentDrawerOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const { enqueueSnackbar } = useSnackbar();

  const open = Boolean(anchorEl);

  // ------------------------------
  // LOAD DATA
  // ------------------------------
  const loadData = async () => {
    const res1 = await api.get("/api/issues/assigned");
    setAssignedIssues(res1.data);

    const res2 = await api.get("/api/issues/my");
    setMyIssues(res2.data);

    const res3 = await api.get("/api/notifications");
    setNotifications(res3.data);
  };

  useEffect(() => {
    loadData();

    // -------------------------------
    // SOCKET SETUP
    // -------------------------------
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      client.subscribe(`/topic/notifications/${user.id}`, (msg) => {
        enqueueSnackbar(msg.body, { variant: "info" });
        loadData();
      });
    };

    client.activate();
    return () => client.deactivate();
  }, []);

  // ------------------------------
  // NOTIFICATION ACTIONS
  // ------------------------------
  const handleBellClick = (event) => setAnchorEl(event.currentTarget);
  const handleBellClose = () => setAnchorEl(null);

  const markAsRead = async (id) => {
    await api.put(`/api/notifications/${id}/read`);
    loadData();
  };

  const markAllRead = async () => {
    await api.put(`/api/notifications/read-all`);
    loadData();
  };

  // ------------------------------
  // COMMENTS
  // ------------------------------
  const loadComments = async (issueId) => {
    const res = await api.get(`/api/issues/${issueId}/comments`);
    setComments(res.data);
  };

  const openComments = (issue) => {
    setSelectedIssue(issue);
    loadComments(issue.id);
    setCommentDrawerOpen(true);
  };

  const submitComment = async () => {
    if (!newComment.trim()) return;

    await api.post(`/api/issues/${selectedIssue.id}/comments`, {
      message: newComment,
    });

    setNewComment("");
    loadComments(selectedIssue.id);
    loadData();
  };

  // ------------------------------
  // STATUS UPDATE
  // ------------------------------
  const updateStatus = async (id, newStatus) => {
    await api.put(`/api/issues/${id}/status`, { status: newStatus });
    loadData();
  };

  // ------------------------------
  // SLA TIMER
  // ------------------------------
  const calculateRemaining = (deadline, breached) => {
    if (breached) return "SLA Breached";
    if (!deadline) return "";

    const now = new Date();
    const end = new Date(deadline);
    const diff = end - now;

    if (diff <= 0) return "SLA Breached";

    const mins = Math.floor(diff / 60000);
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  const priorityColors = {
    CRITICAL: "#8B0000",
    HIGH: "#FF4444",
    MEDIUM: "#FACC15",
    LOW: "#FFE680",
  };

  const selectedList =
    selectedTab === "ASSIGNED" ? assignedIssues : myIssues;

  // ------------------------------
  // SUMMARY CARDS
  // ------------------------------
  const allIssues = [...assignedIssues, ...myIssues];

  const totalIssues = allIssues.length;
  const criticalIssues = allIssues.filter((i) => i.priority === "CRITICAL").length;
  const nearingSLA = allIssues.filter((i) => {
    if (!i.slaDeadline) return false;
    const diff = new Date(i.slaDeadline) - new Date();
    return diff > 0 && diff < 60 * 60 * 1000;
  }).length;

  const completedIssues = allIssues.filter((i) => i.status === "COMPLETED").length;

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
          justifyContent: "space-between"
        }}
      >
        <Typography variant="h5" sx={{ color: "#7D3CFF", mb: 4 }}>
          Facility Ops
        </Typography>

        <Button
          fullWidth
          variant="contained"
          sx={{ background: "linear-gradient(to right, #7D3CFF, #00E6FF)" }}
        >
          Dashboard
        </Button>

        {/* USER */}
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Avatar sx={{ mx: "auto", mb: 1, bgcolor: "#7D3CFF" }}>
            {user?.name[0]}
          </Avatar>
          <Typography>{user?.name}</Typography>
          <Typography sx={{ color: "gray", fontSize: 12 }}>
            {user?.email}
          </Typography>

          <Button
            fullWidth
            color="error"
            variant="outlined"
            sx={{ mt: 2 }}
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
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h4">Welcome, {user?.name}</Typography>
            <Typography sx={{ color: "gray", mt: 1 }}>
              Monitor & track team-wide issues
            </Typography>
          </Box>

          {/* NOTIFICATION BELL */}
          <IconButton color="inherit" onClick={handleBellClick}>
            <Badge
              badgeContent={notifications.filter((n) => !n.readStatus).length}
              color="error"
            >
              <NotificationsIcon sx={{ color: "white" }} />
            </Badge>
          </IconButton>

          {/* NOTIFICATIONS MENU */}
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleBellClose}
            PaperProps={{
              sx: {
                width: 320,
                background: "#1A1D2E",
                color: "white",
                maxHeight: 400
              },
            }}
          >
            <MenuItem disabled>Notifications</MenuItem>
            <Divider sx={{ background: "#333" }} />

            {notifications.length === 0 && (
              <MenuItem disabled>No notifications</MenuItem>
            )}

            {notifications.map((n) => (
              <MenuItem
                key={n.id}
                onClick={() => markAsRead(n.id)}
                sx={{
                  background: n.readStatus ? "transparent" : "#272B3C",
                  whiteSpace: "normal"
                }}
              >
                {n.message}
              </MenuItem>
            ))}

            {notifications.length > 0 && (
              <>
                <Divider sx={{ background: "#333" }} />
                <MenuItem onClick={markAllRead} sx={{ color: "#00E6FF" }}>
                  Mark all as read
                </MenuItem>
              </>
            )}
          </Menu>
        </Box>

        {/* STATS */}
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 2, mt: 4 }}>
          <StatCard title="Total Issues" value={totalIssues} icon="📊" />
          <StatCard title="Critical Issues" value={criticalIssues} icon="⚠️" />
          <StatCard title="Nearing SLA" value={nearingSLA} icon="⏳" />
          <StatCard title="Completed" value={completedIssues} icon="✔️" />
        </Box>

        {/* TABS */}
        <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
          <Button
            onClick={() => setSelectedTab("ASSIGNED")}
            variant={selectedTab === "ASSIGNED" ? "contained" : "outlined"}
          >
            Assigned Issues ({assignedIssues.length})
          </Button>

          <Button
            onClick={() => setSelectedTab("MY")}
            variant={selectedTab === "MY" ? "contained" : "outlined"}
          >
            My Created Issues ({myIssues.length})
          </Button>
        </Box>

        {/* ISSUE LIST */}
        <Box sx={{ mt: 3 }}>
          {selectedList.map((issue) => {
            const remaining = calculateRemaining(issue.slaDeadline, issue.slaBreached);

            return (
              <Card
                key={issue.id}
                sx={{
                  background: "#131723",
                  p: 3,
                  mb: 2,
                  borderRadius: 3,
                  border: "1px solid #222",
                }}
              >
                <Typography variant="h6" sx={{ color: "#7D3CFF" }}>
                  Issue #{issue.id} — <span style={{ color: "white" }}>{issue.title}</span>
                </Typography>

                <Typography sx={{ color: "gray", my: 1 }}>{issue.description}</Typography>

                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                  <Chip
                    label={issue.priority}
                    sx={{
                      background: priorityColors[issue.priority],
                      color: issue.priority === "LOW" ? "black" : "white",
                    }}
                  />

                  <Chip label={issue.status.replace("_", " ")} color="primary" />

                  <Chip
                    label={remaining}
                    sx={{
                      ml: "auto",
                      background: remaining === "SLA Breached" ? "#FF3B30" : "#00E6FF",
                      color: "black",
                    }}
                  />
                </Box>

                {/* ACTION BUTTONS */}
                <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                  {issue.status === "ASSIGNED" && (
                    <Button variant="contained" onClick={() => updateStatus(issue.id, "IN_PROGRESS")}>
                      Start Work
                    </Button>
                  )}

                  {issue.status === "IN_PROGRESS" && (
                    <Button variant="contained" onClick={() => updateStatus(issue.id, "COMPLETED")}>
                      Mark Completed
                    </Button>
                  )}

                  {issue.status === "COMPLETED" && (
                    <Button variant="outlined" onClick={() => updateStatus(issue.id, "CLOSED")}>
                      Close Issue
                    </Button>
                  )}

                  <Button
                    variant="outlined"
                    sx={{ ml: "auto" }}
                    startIcon={<ChatBubbleOutlineIcon />}
                    onClick={() => openComments(issue)}
                  >
                    Comments
                  </Button>
                </Box>
              </Card>
            );
          })}
        </Box>
      </Box>

      {/* COMMENTS DRAWER */}
      <Drawer
        anchor="right"
        open={commentDrawerOpen}
        onClose={() => setCommentDrawerOpen(false)}
        PaperProps={{
          sx: { width: 380, background: "#1A1D2E", color: "white", p: 2 },
        }}
      >
        {selectedIssue && (
          <>
            <Typography variant="h6" sx={{ mb: 2, color: "#7D3CFF" }}>
              Comments — Issue #{selectedIssue.id}
            </Typography>

            <List sx={{ maxHeight: "70vh", overflowY: "auto" }}>
              {comments.map((c) => (
                <ListItem key={c.id}>
                  <Avatar sx={{ bgcolor: "#7D3CFF", mr: 2 }}>
                    {c.createdByName[0]}
                  </Avatar>

                  <ListItemText
                    primary={
                      <>
                        <strong>{c.createdByName}</strong>{" "}
                        <span style={{ color: "gray", fontSize: "12px" }}>
                          {new Date(c.createdAt).toLocaleString()}
                        </span>
                      </>
                    }
                    secondary={c.message}
                  />
                </ListItem>
              ))}
            </List>

            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
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

/* ----------------------- */
/*   STAT CARD COMPONENT   */
/* ----------------------- */
function StatCard({ title, value, icon }) {
  return (
    <Card
      sx={{
        p: 3,
        background: "#131723",
        borderRadius: 3,
      }}
    >
      <Typography sx={{ color: "gray", fontSize: 14 }}>{title}</Typography>
      <Typography variant="h4" sx={{ mt: 1 }}>
        {value} <span style={{ fontSize: "22px" }}>{icon}</span>
      </Typography>
    </Card>
  );
}
