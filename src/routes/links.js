import express from "express";
import {
  getAllLinks,
  createShortLink,
  deleteLinkByCode,
  findLinkByCode,
  incrementClick
} from "../controllers/linksController.js";

const router = express.Router();

// Dashboard
router.get("/", async (req, res) => {
  const links = await getAllLinks();
  res.render("dashboard", {
    message: null,
    alert: null,
    links
  });
});

// Create Short URL
router.post("/shorten", async (req, res) => {
  const { originalUrl } = req.body;

  try {
    await createShortLink(originalUrl);
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

// DELETE
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

// ⭐ SHORT URL REDIRECT (This was missing)
router.get("/:code", async (req, res) => {
  const { code } = req.params;

  const link = await findLinkByCode(code);

  if (!link) {
    return res.send("Invalid short URL!");
  }

  await incrementClick(code);
  res.redirect(link.url);
});

export default router;
