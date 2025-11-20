// src/routes/links.js
import express from "express";
import { getAllLinks, createLink, redirectLink } from "../controllers/linksController.js";

const router = express.Router();

// Dashboard - show all links
router.get("/", async (req, res) => {
  try {
    const links = await getAllLinks();
    res.render("dashboard", { links });
  } catch (err) {
    res.status(500).send("Error fetching links");
  }
});

// Create a short link
router.post("/shorten", async (req, res) => {
  const { url, name } = req.body;
  try {
    const link = await createLink(url, name);
    res.redirect("/");
  } catch (err) {
    res.status(500).send("Error creating link");
  }
});

// Redirect
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

