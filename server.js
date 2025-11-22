import express from "express";
import dotenv from "dotenv";
import linksRouter from "./src/routes/links.js";
import path from "path";
import { fileURLToPath } from "url";
import { setupLinksTable } from "./src/utils/db.js";

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

// DB Table setup
setupLinksTable();

// Correct route order!
app.get("/healthz", (req, res) => {
  res.status(200).json({
    ok: true,
    version: "1.0.0",
    status: "TinyLink Server Running 🚀"
  });
});

// All core routes (dashboard/statistics/add/delete)
app.use("/", linksRouter);

// Catch-all redirect (must be last!)
app.get("/:code", async (req, res) => {
  const { code } = req.params;
  // Prevent healthz conflict
  if (code === "healthz") {
    return res.status(200).json({
      ok: true,
      version: "1.0.0",
      status: "TinyLink Server Running 🚀"
    });
  }
  try {
    const { findLinkByCode, incrementClick } = await import("./src/controllers/linksController.js");
    const link = await findLinkByCode(code);
    if (!link) return res.status(404).send("Invalid short URL!");
    await incrementClick(code);
    return res.redirect(link.url);
  } catch (err) {
    console.error("Redirect error:", err);
    return res.status(500).send("Server Error");
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server started at http://localhost:${PORT}`);
});
