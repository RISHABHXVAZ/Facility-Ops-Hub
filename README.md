Project Overview: 
Facility Ops Hub is a centralized, role-based command-center platform designed to streamline facility issue reporting, workload distribution, SLA tracking, and real-time communication. Inspired by a Power Rangers aesthetic, the system provides a gamified but fully functional operational workflow for Rangers (users), Engineers, Supervisors, and Admins.

The system automates facility management using structured workflows, escalation policies, dashboards, analytics, and real-time updates.


PS Number: 9
Problem Statement:
Large facilities often face difficulty tracking issues, assigning tasks efficiently, and meeting SLA expectations. Manual coordination leads to delays, poor visibility, and accountability gaps.
Facility Ops Hub solves this by providing an end-to-end digital workflow with dashboards, analytics, automation, and notifications.

Features Implemented:
1.Core Functionalities
2.Role-based dashboards for Ranger, Engineer, Supervisor, Admin
3.Issue creation, assignment, status updates, and SLA countdown
4.Comment system + activity timeline
5.Real-time WebSocket notifications
6.Engineer workload analytics for supervisors
7.Admin panel for user management & SLA settings

UX / Theme Features:
1.Power Rangers–themed UI animations and badges
2.Color-coded roles with dynamic transitions
3.Responsive, modern interface

Techstack used: 
1.Frontend: React.js
2.Backend: Spring Boot 4, Java 23
3.Database: PostgreSQL
4.Authentication/API: JWT Auth, Lombok, Git/GitHub for collaborations

Error Handling & Reliability Considerations:
1.Backend validation for all API inputs
2.Global exception handler for clean error responses
3.Graceful failures for WebSocket disconnections
4.SLA countdown auto-triggers to prevent missed deadlines
5.Role-based authorization using JWT
6.Database constraints ensure data integrity

Team Members & Responsibilities: 
1. Rishabh Srivastava: Team Leader and Backend Developer
2. Pranav Pandey : Frontend Developer
3. Prince Keshari: Frontend Developer and UI designer

Future Improvements:
1.Integrate AI-based auto-assignment
2.Mobile app version
3.More detailed analytics dashboards
4.Enhanced audit logs & reporting
5.Multi-language support
6.Dark mode + theme customization
