import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();

// Manual CORS middleware (most reliable for Express 5)
app.use(cors({
  origin: [
    "https://schoolmanageio.vercel.app",
    "https://school-management-system-backend-three.vercel.app",
    "http://localhost:5173"
  ],
   credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
  optionsSuccessStatus: 200
}))

app.options(/.*/, cors())

// Multer config
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes... (same as before)
app.post("/", upload.single("profilePic"), (req, res) => {
  // ... your route handler
});

app.post("/auth/login", (req, res) => {
  res.json({
    success: true,
    message: "Login successful",
    origin: req.headers.origin
  });
});

// GET route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API is running"
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});