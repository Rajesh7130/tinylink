import express from "express";
import {
  getAllLinks,
  createShortLink,
  deleteLinkByCode,
  findLinkByCode,
  incrementClick
} from "../controllers/linksController.js";

const router = express.Router();

// Dashboard: List/Add/Delete
router.get("/", async (req, res) => {
  const links = await getAllLinks();
  res.render("dashboard", { message: null, alert: null, links });
});

// Create Short URL
router.post("/shorten", async (req, res) => {
  const { originalUrl, customName } = req.body;
  try {
    await createShortLink(originalUrl, customName);
    const links = await getAllLinks();
    res.render("dashboard", {
      message: "Short URL created successfully!",
      alert: "success",
      links
    });
  } catch (err) {
    const links = await getAllLinks();
    res.render("dashboard", {
      message: err.message,
      alert: "error",
      links
    });
  }
});

// Delete Short URL
router.post("/delete/:code", async (req, res) => {
  const { code } = req.params;
  try {
    await deleteLinkByCode(code);
    const links = await getAllLinks();
    res.render("dashboard", {
      message: "Link deleted successfully!",
      alert: "success",
      links
    });
  } catch (err) {
    const links = await getAllLinks();
    res.render("dashboard", {
      message: err.message,
      alert: "error",
      links
    });
  }
});

// Stats for a Single Code
router.get("/code/:code", async (req, res) => {
  const { code } = req.params;
  const link = await findLinkByCode(code);
  if (!link) return res.status(404).send("Short URL Not Found!");
  res.render("stats", { link }); // stats.ejs
});

export default router;
