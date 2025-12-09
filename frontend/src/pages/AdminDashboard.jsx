import { useEffect, useState, useMemo } from "react";
import { api } from "../api/axios";

import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  Chip,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Badge,
  Menu,
  Divider
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";

import SockJS from "sockjs-client/dist/sockjs";
import { Client } from "@stomp/stompjs";
import { useSnackbar } from "notistack";

export default function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [issues, setIssues] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Filters
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Comment drawer
  const [commentDrawerOpen, setCommentDrawerOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  // Assign engineer modal
  const [assignDrawerOpen, setAssignDrawerOpen] = useState(false);

  // Notifications menu
  const [anchorEl, setAnchorEl] = useState(null);

  const { enqueueSnackbar } = useSnackbar();
  const openNotif = Boolean(anchorEl);

  // ------------------------------
  // LOAD DATA
  // ------------------------------
  const loadIssues = async () => {
    const res = await api.get("/api/issues/all");
    setIssues(res.data);
  };

  const loadEngineers = async () => {
    const res = await api.get("/api/users/engineers");
    setEngineers(res.data);
  };

  const loadNotifications = async () => {
    const res = await api.get("/api/notifications");
    setNotifications(res.data);
  };

  // ------------------------------
  // LOAD COMMENTS
  // ------------------------------
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
  };

  // ------------------------------
  // STATUS UPDATE
  // ------------------------------
  const updateStatus = async (id, newStatus) => {
    await api.put(`/api/issues/${id}/status`, { status: newStatus });
    loadIssues();
  };

  // ------------------------------
  // DELETE ISSUE
  // ------------------------------
  const deleteIssue = async (id) => {
    await api.delete(`/api/issues/delete/${id}`);
    loadIssues();
  };

  // ------------------------------
  // ASSIGN ISSUE
  // ------------------------------
  const assignEngineer = async (engId) => {
    await api.put(`/api/issues/${selectedIssue.id}/assign`, {
      engineerId: engId,
    });
    setAssignDrawerOpen(false);
    loadIssues();
  };

  // ------------------------------
  // WEBSOCKETS
  // ------------------------------
  useEffect(() => {
    loadIssues();
    loadEngineers();
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

  // ------------------------------
  // FILTER + SEARCH
  // ------------------------------
  const priorityColors = {
    CRITICAL: "#8B0000",
    HIGH: "#FF4444",
    MEDIUM: "#FACC15",
    LOW: "#FFE680",
  };

  const filteredIssues = useMemo(() => {
    return issues
      .filter((i) =>
        search
          ? i.title.toLowerCase().includes(search.toLowerCase()) ||
            i.description.toLowerCase().includes(search.toLowerCase())
          : true
      )
      .filter((i) => (priorityFilter === "ALL" ? true : i.priority === priorityFilter))
      .filter((i) => (statusFilter === "ALL" ? true : i.status === statusFilter));
  }, [issues, search, priorityFilter, statusFilter]);

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

  // ------------------------------
  // COMMENTS DRAWER OPEN
  // ------------------------------
  const openComments = (issue) => {
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
            Admin Panel
          </Typography>

          <Button
            fullWidth
            variant="contained"
            sx={{
              mb: 2,
              background: "linear-gradient(to right, #7D3CFF, #00E6FF)",
            }}
          >
            Dashboard
          </Button>
        </Box>

        {/* USER INFO */}
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Avatar sx={{ mx: "auto", mb: 1, bgcolor: "#7D3CFF" }}>
            {user?.name[0]}
          </Avatar>

          <Typography>{user?.name}</Typography>
          <Typography sx={{ fontSize: "12px", color: "gray" }}>
            {user?.email}
          </Typography>

          <Button
            fullWidth
            variant="outlined"
            color="error"
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

        {/* Header */}
        <Typography variant="h4" fontWeight="bold">
          Welcome Admin {user?.name},
        </Typography>
        <Typography sx={{ mt: 1, mb: 3, color: "gray" }}>
          Manage all issues, assign engineers, and oversee system operations.
        </Typography>

        {/* SEARCH + FILTERS + NOTIFICATIONS */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              placeholder="Search issues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1 }} />,
                style: { color: "white" },
              }}
              sx={{ width: 250, background: "#1A1D2E", borderRadius: 2 }}
            />

            {/* Priority Filter */}
            <FormControl sx={{ minWidth: 140 }}>
              <InputLabel sx={{ color: "white" }}>Priority</InputLabel>
              <Select
                value={priorityFilter}
                label="Priority"
                onChange={(e) => setPriorityFilter(e.target.value)}
                sx={{ color: "white" }}
              >
                <MenuItem value="ALL">All</MenuItem>
                <MenuItem value="CRITICAL">Critical</MenuItem>
                <MenuItem value="HIGH">High</MenuItem>
                <MenuItem value="MEDIUM">Medium</MenuItem>
                <MenuItem value="LOW">Low</MenuItem>
              </Select>
            </FormControl>

            {/* Status Filter */}
            <FormControl sx={{ minWidth: 140 }}>
              <InputLabel sx={{ color: "white" }}>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{ color: "white" }}
              >
                <MenuItem value="ALL">All</MenuItem>
                <MenuItem value="OPEN">Open</MenuItem>
                <MenuItem value="ASSIGNED">Assigned</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="CLOSED">Closed</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Notifications */}
          <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Badge badgeContent={notifications.filter((n) => !n.readStatus).length} color="error">
              <NotificationsIcon sx={{ color: "white" }} />
            </Badge>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={openNotif}
            onClose={() => setAnchorEl(null)}
            PaperProps={{
              sx: {
                width: 300,
                background: "#1A1D2E",
                color: "white",
              },
            }}
          >
            <MenuItem disabled>Notifications</MenuItem>
            <Divider />

            {notifications.length === 0 && (
              <MenuItem disabled>No notifications</MenuItem>
            )}

            {notifications.map((n) => (
              <MenuItem key={n.id}>{n.message}</MenuItem>
            ))}
          </Menu>
        </Box>

        {/* ----------------------- ISSUE LIST ----------------------- */}
        <Typography variant="h5" sx={{ mb: 2 }}>
          All Issues ({filteredIssues.length})
        </Typography>

        {filteredIssues.map((issue) => {
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

                <Chip label={issue.status.replace("_", " ")} color="primary" />

                <Chip
                  label={remaining}
                  sx={{
                    ml: "auto",
                    background:
                      remaining === "SLA Breached" ? "#FF3B30" : "#00E6FF",
                    color: "black",
                  }}
                />
              </Box>

              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>

                {/* Assign engineer */}
                <Button
                  variant="contained"
                  onClick={() => {
                    setSelectedIssue(issue);
                    setAssignDrawerOpen(true);
                  }}
                  startIcon={<AssignmentIndIcon />}
                >
                  Assign
                </Button>

                {/* Status update buttons */}
                {issue.status === "OPEN" && (
                  <Button
                    variant="contained"
                    onClick={() => updateStatus(issue.id, "ASSIGNED")}
                  >
                    Mark Assigned
                  </Button>
                )}

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

                {/* COMMENTS */}
                <Button
                  variant="outlined"
                  sx={{ ml: "auto" }}
                  onClick={() => openComments(issue)}
                  startIcon={<ChatBubbleOutlineIcon />}
                >
                  Comments
                </Button>

                {/* DELETE */}
                <IconButton color="error" onClick={() => deleteIssue(issue.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Card>
          );
        })}

      </Box>

      {/* ----------------------- COMMENTS DRAWER ----------------------- */}
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
                <ListItem key={c.id}>
                  <Avatar sx={{ bgcolor: "#7D3CFF", mr: 2 }}>
                    {c.createdByName[0]}
                  </Avatar>
                  <ListItemText
                    primary={
                      <strong>
                        {c.createdByName}{" "}
                        <span style={{ color: "gray", fontSize: "12px" }}>
                          {new Date(c.createdAt).toLocaleString()}
                        </span>
                      </strong>
                    }
                    secondary={c.message}
                  />
                </ListItem>
              ))}
            </List>

            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
              <TextField
                placeholder="Add comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                sx={{ flex: 1, background: "#131723", borderRadius: 2 }}
                InputProps={{ style: { color: "white" } }}
              />
              <IconButton onClick={submitComment} color="primary">
                <SendIcon />
              </IconButton>
            </Box>
          </>
        )}
      </Drawer>

      {/* ----------------------- ASSIGN DRAWER ----------------------- */}
      <Drawer
        anchor="right"
        open={assignDrawerOpen}
        onClose={() => setAssignDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 350,
            background: "#1A1D2E",
            color: "white",
            p: 3,
          },
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Assign Engineer
        </Typography>

        {engineers.map((eng) => (
          <Card
            key={eng.id}
            sx={{
              background: "#131723",
              p: 2,
              mb: 2,
              cursor: "pointer",
            }}
            onClick={() => assignEngineer(eng.id)}
          >
            <Typography sx={{ fontSize: "16px", fontWeight: 600 }}>
              {eng.name}
            </Typography>
            <Typography sx={{ fontSize: "13px", color: "gray" }}>
              {eng.email}
            </Typography>
          </Card>
        ))}
      </Drawer>
    </Box>
  );
}
