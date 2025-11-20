// server.js
import express from "express";
import dotenv from "dotenv";
import linksRouter from "./src/routes/links.js";
import { findLinkByCode, incrementClick } from "./src/controllers/linksController.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


// --------------------------------------------------
// 🚀 SHORT URL REDIRECT (IMPORTANT: Keep ABOVE router)
// --------------------------------------------------
app.get("/:code", async (req, res) => {
  const { code } = req.params;

  try {
    const link = await findLinkByCode(code);

    if (!link) {
      return res.status(404).send("Short URL not found!");
    }

    // Increase click count
    await incrementClick(code);

    // Redirect to actual URL
    return res.redirect(link.url);

  } catch (err) {
    console.error("Redirect error:", err);
    return res.status(500).send("Server Error");
  }
});


// --------------------------------------------------
// Dashboard & all other routes
// --------------------------------------------------
app.use("/", linksRouter);


// Health check
app.get("/healthz", (req, res) => {
  res.status(200).json({
    ok: true,
    version: "1.0.0",
    status: "TinyLink Server Running 🚀"
  });
});

// --------------------------------------------------
// Start server
// --------------------------------------------------
app.listen(PORT, () => {
  console.log(`✅ Server started at http://localhost:${PORT}`);
});
