import { useEffect, useState, useMemo } from "react";
import { api } from "../api/axios";
import {
  Box,
  Typography,
  Button,
  Chip,
  Card,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Divider,
  TextField,
  Select,
  FormControl,
  InputLabel,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Avatar,
} from "@mui/material";

import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SendIcon from "@mui/icons-material/Send";

import SockJS from "sockjs-client/dist/sockjs";
import { Client } from "@stomp/stompjs";
import { useSnackbar } from "notistack";

export default function EngineerDashboard() {
  const [issues, setIssues] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [commentCounts, setCommentCounts] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);

  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [sortType, setSortType] = useState("SLA");

  const [activeTab, setActiveTab] = useState("ACTIVE"); // NEW TAB STATE

  const open = Boolean(anchorEl);
  const { enqueueSnackbar } = useSnackbar();
  const user = JSON.parse(localStorage.getItem("user"));

  // ---------- COMMENTS DRAWER ----------
  const [commentDrawerOpen, setCommentDrawerOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  // -----------------------
  // LOAD ISSUES + COMMENT COUNTS
  // -----------------------
  const loadIssues = async () => {
    const res = await api.get("/api/issues/assigned");
    setIssues(res.data);

    // Load comment counts efficiently
    const counts = {};
    await Promise.all(
      res.data.map(async (issue) => {
        const c = await api.get(`/api/issues/${issue.id}/comments`);
        counts[issue.id] = c.data.length;
      })
    );
    setCommentCounts(counts);
  };

  const loadNotifications = async () => {
    const res = await api.get("/api/notifications");
    setNotifications(res.data);
  };

  // LOAD COMMENTS FOR ISSUE
  const loadComments = async (issueId) => {
    const res = await api.get(`/api/issues/${issueId}/comments`);
    setComments(res.data);
  };

  const submitComment = async () => {
    if (!newComment.trim()) return;

    await api.post(`/api/issues/${selectedIssue.id}/comments`, {
      message: newComment,
    });

    setNewComment("");
    loadComments(selectedIssue.id);
    loadIssues();
  };

  // -----------------------
  // WEBSOCKETS
  // -----------------------
  useEffect(() => {
    loadIssues();
    loadNotifications();

    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      client.subscribe(`/topic/notifications/${user.id}`, (msg) => {
        enqueueSnackbar(msg.body, { variant: "info" });
        loadNotifications();
        loadIssues();
      });
    };

    client.activate();
    return () => client.deactivate();
  }, []);

  // -----------------------
  // STATUS UPDATE
  // -----------------------
  const updateStatus = async (id, newStatus) => {
    await api.put(`/api/issues/${id}/status`, { status: newStatus });
    loadIssues();
  };

  // -----------------------
  // NOTIFICATION PANEL
  // -----------------------
  const handleBellClick = (e) => setAnchorEl(e.currentTarget);
  const handleBellClose = () => setAnchorEl(null);

  const markAsRead = async (id) => {
    await api.put(`/api/notifications/${id}/read`);
    loadNotifications();
  };

  const markAllRead = async () => {
    await api.put("/api/notifications/read-all");
    loadNotifications();
  };

  // -----------------------
  // SEARCH + FILTER + SORT
  // -----------------------
  const priorityRank = {
    CRITICAL: 1,
    HIGH: 2,
    MEDIUM: 3,
    LOW: 4,
  };

  const priorityColors = {
    CRITICAL: "#8B0000",
    HIGH: "#FF4444",
    MEDIUM: "#FACC15",
    LOW: "#FFE680",
  };

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

  // ACTIVE ISSUES LIST
  const activeIssues = issues.filter(
    (i) => i.status !== "CLOSED"
  );

  // PREVIOUS (CLOSED) ISSUES
  const closedIssues = issues.filter((i) => i.status === "CLOSED");

  // FILTER + SORT apply only on active issues
  const filteredSortedIssues = useMemo(() => {
    let list = [...activeIssues];

    if (search)
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(search.toLowerCase()) ||
          i.description.toLowerCase().includes(search.toLowerCase())
      );

    if (priorityFilter !== "ALL")
      list = list.filter((i) => i.priority === priorityFilter);

    if (sortType === "PRIORITY")
      list.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);

    if (sortType === "SLA")
      list.sort(
        (a, b) => new Date(a.slaDeadline) - new Date(b.slaDeadline)
      );

    return list;
  }, [issues, search, priorityFilter, sortType]);

  // -----------------------
  // OPEN COMMENTS DRAWER
  // -----------------------
  const openComments = (issue) => {
    setSelectedIssue(issue);
    loadComments(issue.id);
    setCommentDrawerOpen(true);
  };

  return (
    <Box sx={{ display: "flex", background: "#0D0F1A", height: "100vh" }}>

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
              background: "linear-gradient(to right, #7D3CFF, #00E6FF)",
              color: "white",
              mb: 2,
            }}
          >
            Engineer Dashboard
          </Button>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Box
            sx={{
              background: "#141824",
              p: "12px 16px",
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

        {/* TOP BAR */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
          <TextField
            placeholder="Search issues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1 }} />,
              style: { color: "white" },
            }}
            sx={{
              width: 250,
              background: "#1A1D2E",
              borderRadius: 2,
            }}
          />

          {/* NOTIFICATION BELL */}
          <IconButton color="inherit" onClick={handleBellClick}>
            <Badge
              badgeContent={notifications.filter((n) => !n.readStatus).length}
              color="error"
            >
              <NotificationsIcon sx={{ color: "white" }} />
            </Badge>
          </IconButton>
        </Box>

        {/* HEADER */}
        <Typography variant="h4" fontWeight="bold">
          Welcome Engineer {user?.name},
        </Typography>
        <Typography sx={{ mt: 1, mb: 3, color: "gray" }}>
          Manage assigned issues, update progress and collaborate via comments.
        </Typography>

        {/* TABS */}
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <Button
            variant={activeTab === "ACTIVE" ? "contained" : "outlined"}
            sx={{
              background:
                activeTab === "ACTIVE"
                  ? "linear-gradient(to right, #7D3CFF, #00E6FF)"
                  : "transparent",
              borderColor: "#7D3CFF",
              color: "white",
              px: 3,
            }}
            onClick={() => setActiveTab("ACTIVE")}
          >
            Active Issues ({activeIssues.length})
          </Button>

          <Button
            variant={activeTab === "CLOSED" ? "contained" : "outlined"}
            sx={{
              background:
                activeTab === "CLOSED"
                  ? "linear-gradient(to right, #7D3CFF, #00E6FF)"
                  : "transparent",
              borderColor: "#7D3CFF",
              color: "white",
              px: 3,
            }}
            onClick={() => setActiveTab("CLOSED")}
          >
            Previous Issues ({closedIssues.length})
          </Button>
        </Box>

        {/* ACTIVE ISSUES LIST */}
        {activeTab === "ACTIVE" && (
          <>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Assigned Issues ({filteredSortedIssues.length})
            </Typography>

            {filteredSortedIssues.map((issue) => {
              const remaining = calculateRemaining(
                issue.slaDeadline,
                issue.slaBreached
              );

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
                    Issue #{issue.id} —{" "}
                    <span style={{ color: "white" }}>{issue.title}</span>
                  </Typography>

                  <Typography sx={{ color: "gray", my: 1 }}>
                    {issue.description}
                  </Typography>

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

                    <Box
                      sx={{
                        ml: "auto",
                        px: 2,
                        py: "6px",
                        borderRadius: "20px",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        fontWeight: 600,
                        fontSize: "14px",
                        background:
                          remaining === "SLA Breached"
                            ? "linear-gradient(to right, #FF3B30, #FF8A80)"
                            : "linear-gradient(to right, #00E6FF, #7D3CFF)",
                        color: "#000",
                        boxShadow:
                          remaining === "SLA Breached"
                            ? "0 0 10px rgba(255,0,0,0.5)"
                            : "0 0 10px rgba(0,230,255,0.5)",
                      }}
                    >
                      {remaining === "SLA Breached" ? "⚠ SLA Breached" : `⏱ ${remaining}`}
                    </Box>

                  </Box>

                  {/* ACTION BUTTONS */}
                  <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                    {issue.status === "ASSIGNED" && (
                      <Button
                        variant="contained"
                        onClick={() => updateStatus(issue.id, "IN_PROGRESS")}
                      >
                        Start Work
                      </Button>
                    )}

                    {issue.status === "IN_PROGRESS" && (
                      <Button
                        variant="contained"
                        onClick={() => updateStatus(issue.id, "COMPLETED")}
                      >
                        Mark Completed
                      </Button>
                    )}

                    {issue.status === "COMPLETED" && (
                      <Button
                        variant="outlined"
                        onClick={() => updateStatus(issue.id, "CLOSED")}
                      >
                        Close Issue
                      </Button>
                    )}

                    <Button
                      variant="outlined"
                      sx={{ ml: "auto" }}
                      onClick={() => openComments(issue)}
                      startIcon={<ChatBubbleOutlineIcon />}
                    >
                      {commentCounts[issue.id] || 0} Comments
                    </Button>
                  </Box>
                </Card>
              );
            })}
          </>
        )}

        {/* PREVIOUS (CLOSED) ISSUES LIST */}
        {activeTab === "CLOSED" && (
          <>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Previous Issues ({closedIssues.length})
            </Typography>

            {closedIssues.map((issue) => (
              <Card
                key={issue.id}
                sx={{
                  background: "#0F1425",
                  p: 3,
                  mb: 2,
                  borderRadius: 3,
                  border: "1px solid #333",
                }}
              >
                <Typography variant="h6" sx={{ color: "#888" }}>
                  Issue #{issue.id} — <span>{issue.title}</span>
                </Typography>

                <Typography sx={{ color: "gray", my: 1 }}>
                  {issue.description}
                </Typography>

                <Button
                  variant="outlined"
                  onClick={() => openComments(issue)}
                  startIcon={<ChatBubbleOutlineIcon />}
                >
                  View Comments ({commentCounts[issue.id] || 0})
                </Button>
              </Card>
            ))}
          </>
        )}
      </Box>

      {/* COMMENTS DRAWER */}
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
                      <span>
                        <strong>{c.createdByName}</strong>{" "}
                        <span style={{ color: "gray", fontSize: "12px" }}>
                          {new Date(c.createdAt).toLocaleString()}
                        </span>
                      </span>
                    }
                    secondary={c.message}
                  />
                </ListItem>
              ))}
            </List>

            {/* Add Comment */}
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
