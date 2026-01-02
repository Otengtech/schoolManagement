import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();

// Define allowed origins array
const allowedOrigins = [
  "https://schoolmanageio.vercel.app",
  "https://school-management-system-backend-three.vercel.app",
  "http://localhost:5173"
];

// Configure CORS
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      console.error("Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type", 
      "Authorization", 
      "Accept", 
      "Origin", 
      "X-Requested-With",
      "X-Access-Token"
    ],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    optionsSuccessStatus: 200
  })
);

// Handle preflight requests (Express 4 can use "*")
app.options("*", cors());

// Multer config
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route to verify CORS is working
app.get("/cors-test", (req, res) => {
  res.json({
    success: true,
    message: "CORS is configured properly",
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  
  console.log("Login attempt from:", req.headers.origin);
  console.log("Email:", email);
  
  // TODO: Add actual authentication logic here
  res.json({
    success: true,
    message: "Login successful",
    user: {
      email: email,
      token: "sample-jwt-token-here",
      role: "admin"
    },
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// Main route
app.post("/", upload.single("profilePic"), (req, res) => {
  try {
    console.log("📥 Request received from origin:", req.headers.origin);
    
    const { firstName, lastName, email, phone, address, school } = req.body;

    if (!firstName || !lastName || !email || !phone || !address || !school) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

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

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API Server is running",
    version: "1.0.0",
    endpoints: {
      corsTest: "GET /cors-test",
      login: "POST /auth/login",
      createAdmin: "POST /",
    }
  });
});

// Health check route
app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 CORS enabled for origins:`);
  allowedOrigins.forEach(origin => console.log(`   - ${origin}`));
});