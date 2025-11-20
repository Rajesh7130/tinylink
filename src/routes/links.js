// src/routes/links.js
import express from "express";
import { 
  getAllLinks, 
  createLink, 
  redirectLink, 
  deleteLink, 
  getLinkStats 
} from "../controllers/linksController.js";

const router = express.Router();

// ---------------------------
// DASHBOARD - list all links
// ---------------------------
router.get("/", async (req, res) => {
  try {
    const links = await getAllLinks();
    res.render("dashboard", { links, message: null, error: null });
  } catch (err) {
    res.status(500).send("Error fetching links");
  }
});

// ---------------------------
// CREATE SHORT LINK
// ---------------------------
router.post("/shorten", async (req, res) => {
  const { url, code } = req.body; // code = optional custom code
  try {
    const link = await createLink(url, code);
    const links = await getAllLinks();
    res.render("dashboard", { links, message: `Link created: ${link.code}`, error: null });
  } catch (err) {
    const links = await getAllLinks();
    res.render("dashboard", { links, message: null, error: err.message });
  }
});

// ---------------------------
// DELETE LINK
// ---------------------------
router.post("/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await deleteLink(id);
    const links = await getAllLinks();
    res.render("dashboard", { links, message: `Link deleted successfully`, error: null });
  } catch (err) {
    const links = await getAllLinks();
    res.render("dashboard", { links, message: null, error: "Error deleting link" });
  }
});

// ---------------------------
// STATS FOR A SINGLE CODE
// ---------------------------
router.get("/code/:code", async (req, res) => {
  const { code } = req.params;
  try {
    const link = await getLinkStats(code);
    if (!link) return res.status(404).send("Link not found");
    res.render("stats", { link });
  } catch (err) {
    res.status(500).send("Error fetching stats");
  }
});

// ---------------------------
// HEALTH CHECK
// ---------------------------
router.get("/healthz", (req, res) => {
  res.status(200).json({
    ok: true,
    version: "1.0",
    uptime: process.uptime().toFixed(2) + "s",
    timestamp: new Date().toISOString()
  });
});

// ---------------------------
// REDIRECT SHORT LINK
// Must be last to avoid conflicts with other routes
// ---------------------------
router.get("/:code", async (req, res) => {
  const { code } = req.params;
  try {
    const url = await redirectLink(code);
    if (!url) return res.status(404).send("Link not found");
    res.redirect(url);
  } catch (err) {
    res.status(500).send("Error redirecting link");
  }
});

export default router;

