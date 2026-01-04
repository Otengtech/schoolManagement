// backend/server.js
import express from "express";
import cors from "cors";
import multer from "multer";
import cloudinary from "cloudinary";
import axios from "axios";
import dotenv from "dotenv";
import FormData from "form-data"; // Needed to forward FormData

dotenv.config();

const app = express();

/* =======================
   MIDDLEWARE
======================= */
app.use(express.json());
app.use(cors()); // Allow all origins for now

/* =======================
   CLOUDINARY CONFIG
======================= */
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* =======================
   MULTER (MEMORY STORAGE)
======================= */
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

/* =======================
   CREATE ADMIN ENDPOINT
   Step 1: Receive FormData from frontend
   Step 2: Upload image to Cloudinary
   Step 3: Forward ALL data to friend's backend
======================= */
app.post("/create-admin", upload.single("profileImage"), async (req, res) => {
    console.log("📥 Step 1: Received FormData from frontend");

    const accessToken = req.body.accessToken;
    console.log('🔑 Access token received:', accessToken ? 'Yes' : 'No');

    if (!accessToken) {
        return res.status(400).json({
            success: false,
            message: "Access token is required"
        });
    }

    try {
        // Log what we received
        console.log("📋 Form fields:", req.body);
        console.log("🖼️ File:", req.file ? `Yes - ${req.file.originalname}` : "No");

        const {
            firstName,
            lastName,
            email,
            password,
            school,
        } = req.body;

        // Validate required fields
        const missingFields = [];
        if (!firstName) missingFields.push("firstName");
        if (!lastName) missingFields.push("lastName");
        if (!email) missingFields.push("email");
        if (!password) missingFields.push("password");
        if (!school) missingFields.push("school");

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(", ")}`,
            });
        }

        let profileImageUrl = null;
        let imagePublicId = null;
        let cloudinaryFileBuffer = null;

        /* =======================
           STEP 2: PROCESS IMAGE TO CLOUDINARY
        ======================= */
        if (req.file) {
            console.log("☁️ Step 2: Uploading image to Cloudinary...");

            try {
                // Convert buffer to base64 for Cloudinary
                const b64 = Buffer.from(req.file.buffer).toString("base64");
                const dataURI = `data:${req.file.mimetype};base64,${b64}`;

                // Upload to Cloudinary
                const uploadResult = await cloudinary.v2.uploader.upload(dataURI, {
                    folder: "profilePic",
                    resource_type: "image",
                });

                profileImageUrl = uploadResult.secure_url;
                imagePublicId = uploadResult.public_id;
                cloudinaryFileBuffer = req.file.buffer; // Keep buffer for forwarding

                console.log("✅ Image uploaded to Cloudinary:", profileImageUrl);
            } catch (uploadError) {
                console.error("❌ Cloudinary upload error:", uploadError);
                // Still continue - image is optional for friend's backend
            }
        }

        /* =======================
           STEP 3: FORWARD TO FRIEND'S BACKEND
           Two options based on what friend's backend accepts:
           Option A: JSON with Cloudinary URL (if friend accepts JSON)
           Option B: FormData with original file (if friend needs file)
        ======================= */
        const friendBackendURL = process.env.FRIEND_BACKEND_URL || "https://school-management-system-backend-three.vercel.app";
        console.log(`🔗 Step 3: Forwarding to friend's backend: ${friendBackendURL}`);

        try {
            // Try Option A first: Send as JSON with Cloudinary URL
            let friendResponse;

            if (profileImageUrl) {
                // Option A: Send JSON with Cloudinary URL
                console.log("📤 Forwarding as JSON with Cloudinary URL");

                const jsonPayload = {
                    firstName,
                    lastName,
                    email,
                    password,
                    school,
                    imagePublicId: imagePublicId,
                    source: "render-middleware"
                };

                friendResponse = await axios.post(
                    `${friendBackendURL}/create-admin`,
                    jsonPayload,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accessToken}` // ⚠️ USE THE TOKEN
                        },
                        timeout: 10000
                    }
                );
            } else {
                // Option B: Forward original FormData (no image or image failed)
                console.log("📤 Forwarding original FormData");

                const formData = new FormData();
                formData.append('firstName', firstName);
                formData.append('lastName', lastName);
                formData.append('email', email);
                formData.append('password', password);
                formData.append('school', school);

                // Only append file if we have it (Cloudinary failed or no image)
                if (req.file && !profileImageUrl) {
                    formData.append('profileImage', req.file.buffer, {
                        filename: req.file.originalname,
                        contentType: req.file.mimetype
                    });
                }

                friendResponse = await axios.post(
                    `${friendBackendURL}/create-admin`,
                    formData,
                    {
                        headers: {
                            ...formData.getHeaders(),
                            'Authorization': `Bearer ${process.env.FRIEND_API_TOKEN || ''}`
                        },
                        timeout: 10000
                    }
                );
            }

            console.log("✅ Friend's backend response:", friendResponse.status);

            // Return success to frontend
            res.status(201).json({
                success: true,
                message: "Admin created successfully",
                data: friendResponse.data,
                middleware: {
                    cloudinary: profileImageUrl ? {
                        uploaded: true,
                        url: profileImageUrl,
                        publicId: imagePublicId
                    } : { uploaded: false },
                    forwarded: true,
                    friendBackend: friendBackendURL
                }
            });

        } catch (friendError) {
            console.error("❌ Friend's backend error:", friendError.response?.data || friendError.message);

            // If friend's backend fails, still return success for Cloudinary upload
            if (profileImageUrl) {
                return res.status(207).json({ // 207 Multi-Status
                    success: true,
                    warning: "Image uploaded but friend's backend failed",
                    message: "Image uploaded to Cloudinary successfully, but database save failed",
                    cloudinary: {
                        url: profileImageUrl,
                        publicId: imagePublicId,
                        uploaded: true
                    },
                    error: friendError.response?.data || friendError.message,
                    data: {
                        firstName,
                        lastName,
                        email,
                        school,
                        profileImage: profileImageUrl
                    }
                });
            }

            throw friendError;
        }

    } catch (error) {
        console.error("❌ Server error:", error);

        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        });
    }
});

/* =======================
   TEST ENDPOINT
======================= */
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Render Middleware Backend",
        description: "Receives FormData, uploads to Cloudinary, forwards to friend's backend",
        endpoints: {
            createAdmin: "POST /create-admin",
            health: "GET /health"
        },
        environment: {
            cloudinary: !!process.env.CLOUDINARY_CLOUD_NAME,
            friendBackend: process.env.FRIEND_BACKEND_URL || "Not set - using default",
            node: process.version
        }
    });
});

/* =======================
   HEALTH CHECK
======================= */
app.get("/health", (req, res) => {
    res.json({
        success: true,
        status: "healthy",
        timestamp: new Date().toISOString(),
        services: {
            cloudinary: process.env.CLOUDINARY_CLOUD_NAME ? "configured" : "not configured",
            friendBackend: process.env.FRIEND_BACKEND_URL ? "configured" : "using default"
        }
    });
});

/* =======================
   DEBUG ENDPOINT - See what FormData looks like
======================= */
app.post("/debug-formdata", upload.single("profileImage"), (req, res) => {
    console.log("=== DEBUG FORM DATA ===");
    console.log("Headers:", req.headers['content-type']);
    console.log("Body fields:", req.body);
    console.log("File:", req.file ? {
        name: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
    } : "No file");

    res.json({
        received: true,
        body: req.body,
        file: req.file ? {
            name: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype
        } : null
    });
});

/* =======================
   START SERVER
======================= */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`
🚀 Render Middleware Backend running on port ${PORT}
📝 Frontend should send to: http://localhost:${PORT}/create-admin
🔗 Will forward to: ${process.env.FRIEND_BACKEND_URL || "https://school-management-system-backend-three.vercel.app"}
  
📋 Test endpoints:
  GET  /          - Server info
  GET  /health    - Health check
  POST /debug-formdata - Test FormData reception
  
📤 Main endpoint:
  POST /create-admin - Create admin (FormData with image)
  `);
});