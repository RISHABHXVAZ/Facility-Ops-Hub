import { Modal, Box, TextField, Button, MenuItem, Typography } from "@mui/material";
import { useState } from "react";
import { api } from "../api/axios";

export default function ReportIssueModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "LOW",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const createIssue = async () => {
    try {
      await api.post("/api/issues/create", form);

      // Reload issues in dashboard
      onCreated();

      // Close modal
      onClose();

      // Reset form
      setForm({ title: "", description: "", priority: "LOW" });
    } catch (err) {
      alert("Failed to create issue");
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          background: "#1A1F2C",
          color: "white",
          p: 3,
          width: 450,
          mx: "auto",
          mt: 10,
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" mb={2}>Report Issue</Typography>

        <TextField
          label="Title"
          name="title"
          variant="filled"
          fullWidth
          sx={{ mb: 2 }}
          onChange={handleChange}
          value={form.title}
        />

        <TextField
          label="Description"
          name="description"
          variant="filled"
          fullWidth
          multiline
          rows={4}
          sx={{ mb: 2 }}
          onChange={handleChange}
          value={form.description}
        />

        <TextField
          label="Priority"
          name="priority"
          select
          variant="filled"
          fullWidth
          sx={{ mb: 3 }}
          onChange={handleChange}
          value={form.priority}
        >
          <MenuItem value="CRITICAL">Critical</MenuItem>
          <MenuItem value="HIGH">High</MenuItem>
          <MenuItem value="MEDIUM">Medium</MenuItem>
          <MenuItem value="LOW">Low</MenuItem>
        </TextField>

        <Button variant="contained" fullWidth onClick={createIssue}>
          Submit
        </Button>
      </Box>
    </Modal>
  );
}
