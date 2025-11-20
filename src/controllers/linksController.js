// src/controllers/linksController.js
import { pool } from "../db.js";
import { generateCode } from "../utils/generateCode.js";

// Strict URL validation function
const isValidURL = (url) => {
  const pattern = /^(https?:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/;
  return pattern.test(url);
};

// Get all links
export const getAllLinks = async () => {
  try {
    const res = await pool.query("SELECT * FROM links ORDER BY id DESC");
    return res.rows;
  } catch (err) {
    console.error("Error fetching links", err);
    throw err;
  }
};

// Create a new short link (supports optional custom code)
export const createLink = async (url, customCode) => {
  // Validate URL first
  if (!isValidURL(url)) {
    throw new Error(
      "Invalid URL. Enter a valid URL starting with http:// or https:// and a proper domain name."
    );
  }
  
  // Check if URL already exists
  const existingUrl = await pool.query("SELECT * FROM links WHERE url=$1", [url]);
  if (existingUrl.rows.length > 0) {
    throw new Error(`This URL already exists! Short code: ${existingUrl.rows[0].code}`);
  }

  const code = customCode || generateCode();

  // Check custom code uniqueness
  if (customCode) {
    const check = await pool.query("SELECT * FROM links WHERE code=$1", [customCode]);
    if (check.rows.length > 0) throw new Error("Custom code already exists");
  }

  try {
    const res = await pool.query(
      "INSERT INTO links (code, url) VALUES ($1, $2) RETURNING *",
      [code, url]
    );
    return res.rows[0];
  } catch (err) {
    console.error("Error creating link", err);
    throw err;
  }
};

// Redirect short link
export const redirectLink = async (code) => {
  try {
    const res = await pool.query("SELECT * FROM links WHERE code=$1", [code]);
    if (!res.rows.length) return null;

    const link = res.rows[0];

    // Increment click count and update last clicked
    await pool.query(
      "UPDATE links SET clicks = clicks + 1, last_clicked = NOW() WHERE id=$1",
      [link.id]
    );

    return link.url;
  } catch (err) {
    console.error("Error redirecting link", err);
    throw err;
  }
};

// Delete a link by ID
export const deleteLink = async (id) => {
  try {
    await pool.query("DELETE FROM links WHERE id=$1", [id]);
  } catch (err) {
    console.error("Error deleting link", err);
    throw err;
  }
};

// Get stats for a single link by code
export const getLinkStats = async (code) => {
  try {
    const res = await pool.query("SELECT * FROM links WHERE code=$1", [code]);
    if (!res.rows.length) return null;
    return res.rows[0];
  } catch (err) {
    console.error("Error fetching link stats", err);
    throw err;
  }
};
