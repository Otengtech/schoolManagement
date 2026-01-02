import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
dotenv.config()

// Create Express app
const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5000",
  "https://school-management-system-backend-three.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error("Blocked by CORS:", origin);
      return callback(null, true); // allow anyway (as requested)
    },
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options(/.*/, cors());

// Multer config
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Main route
app.post("/", upload.single("profilePic"), (req, res) => {
  try {
    console.log("📥 Request received");

    const { firstName, lastName, email, phone, address, school } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !phone || !address || !school) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Create admin object
    const admin = {
      id: Date.now(),
      firstName,
      lastName,
      email,
      phone,
      address,
      school,
      profilePic: req.file
        ? {
          name: req.file.originalname,
          type: req.file.mimetype,
          size: req.file.size,
        }
        : null,
      createdAt: new Date().toISOString(),
    };

    console.log("✅ Admin created:", admin);

    return res.status(201).json({
      success: true,
      message: "Admin created successfully",
      admin,
    });
  } catch (err) {
    console.error("❌ Server error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// GET route for testing
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Create Admin API is running",
    endpoint: "POST /api/create-admin"
  });
});

const PORT = process.env.PORT || 5000; app.listen(PORT, () => { console.log(`🚀 Server running on port ${PORT}`); });