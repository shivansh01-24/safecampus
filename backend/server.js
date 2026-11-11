const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware: CORS allows our Next.js frontend (running on port 3000) to communicate with this backend (on port 5000)
app.use(cors());

// Middleware: express.json() parses incoming JSON data from request bodies (e.g., req.body in POST requests)
app.use(express.json());

const PORT = process.env.PORT || 5000;

// In-memory data store for emergency requests (Module 1: Emergency Assistance)
// When MongoDB is connected in subsequent steps, this will persist directly to the database
const emergencyRequests = [];

// 1. Root route - checks if the backend server is running
app.get("/", (req, res) => {
  res.send("CampusShield Emergency API is running!");
});

// 2. Health check endpoint - used by monitoring tools and frontend to test connection
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "CampusShield Backend is healthy and ready.",
    timestamp: new Date().toISOString(),
  });
});

// 3. POST /api/requests - receives emergency assistance requests from students
app.post("/api/requests", (req, res) => {
  const { studentName, category, description } = req.body;

  // Basic validation: ensure all required fields are present and not empty
  if (!studentName || !category || !description) {
    return res.status(400).json({
      success: false,
      message: "Please provide studentName, category, and description.",
    });
  }

  // Create a new request object with an ID, timestamp, and default status
  const newRequest = {
    id: `REQ-${Date.now().toString().slice(-4)}`,
    studentName: studentName.trim(),
    category: category,
    description: description.trim(),
    status: "Pending", // initial status for security/warden review
    createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };

  // Save the request into our store
  emergencyRequests.unshift(newRequest);

  console.log("New Emergency Request Received:", newRequest);

  // Return success response with HTTP status 201 (Created)
  res.status(201).json({
    success: true,
    message: "Emergency request received successfully.",
    data: newRequest,
  });
});

// 4. GET /api/requests - returns all emergency requests (for student history & warden review)
app.get("/api/requests", (req, res) => {
  res.status(200).json({
    success: true,
    count: emergencyRequests.length,
    data: emergencyRequests,
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`CampusShield server running on port ${PORT}`);
});
