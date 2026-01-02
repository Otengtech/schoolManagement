import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();

// SIMPLE CORS - Let Vercel handle CORS headers
app.use(cors({
  origin: ["https://schoolmanageio.vercel.app", "http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Handle preflight explicitly for all routes
app.options("*", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "https://schoolmanageio.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.status(200).send();
});

// Add CORS headers manually as fallback
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://schoolmanageio.vercel.app");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Multer config
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS test endpoint
app.get("/cors-test", (req, res) => {
  res.json({
    success: true,
    message: "CORS is working!",
    origin: req.headers.origin,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
});

// Login endpoint
app.post("/auth/login", (req, res) => {
  const { email, password, role } = req.body;
  
  console.log("Login attempt:", { email, role, origin: req.headers.origin });
  
  // TODO: Add actual authentication logic
  res.json({
    success: true,
    message: "Login successful",
    user: {
      id: "1",
      email: email,
      name: "Test User",
      role: role || "admin",
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
    },
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API Server is running",
    version: "1.0.0",
    cors: "Configured for schoolmanageio.vercel.app",
    endpoints: ["POST /auth/login", "GET /cors-test", "POST /"]
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 CORS configured for: https://schoolmanageio.vercel.app`);
});