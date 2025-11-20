// src/controllers/linksController.js
import { pool } from "../db.js";
import { generateCode } from "../utils/generateCode.js";
// import  Pool 

// Get all links
export const getAllLinks = async () => {
  try {
    const res = await pool.query("SELECT * FROM links ORDER BY id DESC");
    console.log(pool);
    return res.rows;
  } catch (err) {
    console.error("Error fetching links", err);
    throw err;
  }
};

// Create a new short link
export const createLink = async (url, name) => {
  try {
    const code = generateCode();
    const res = await pool.query(
      "INSERT INTO links (code, url, name) VALUES ($1, $2, $3) RETURNING *",
      [code, url, name]
    );
    return res.rows[0];
  } catch (err) {
    console.error("Error creating link", err);
    throw err;
  }
};

// Redirect to original URL by code
export const redirectLink = async (code) => {
  try {
    const res = await pool.query("SELECT * FROM links WHERE code=$1", [code]);
    if (res.rows.length === 0) return null;

    const link = res.rows[0];
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
