import { useEffect, useState } from "react";
import { api } from "../api/axios";
import IssueCard from "../components/IssueCard";
import { Button, Box, Typography } from "@mui/material";
import ReportIssueModal from "../components/ReportIssueModal";

export default function RangerDashboard() {
  const [issues, setIssues] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  const loadIssues = async () => {
    const res = await api.get("/api/issues/my");
    setIssues(res.data);
  };

  useEffect(() => {
    loadIssues();
  }, []);

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">My Issues</Typography>

        <Button
          variant="contained"
          onClick={() => setOpenModal(true)}
        >
          + Report Issue
        </Button>
      </Box>

      {/* Issue List */}
      {issues.map((issue) => (
        <IssueCard key={issue.id} issue={issue} />
      ))}

      {/* Create Issue Modal */}
      <ReportIssueModal open={openModal} onClose={() => setOpenModal(false)} onCreated={loadIssues} />
    </Box>
  );
}
