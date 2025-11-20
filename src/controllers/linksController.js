// src/controllers/linksController.js
import { pool } from "../db.js";
import { generateCode } from "../utils/generateCode.js";

// Strict URL validation
function isValidUrl(url) {
  try {
    const parsed = new URL(url);

    if (!["http:", "https:"].includes(parsed.protocol)) return false;
    if (!parsed.hostname.includes(".")) return false;
    if (/^\d+$/.test(parsed.hostname)) return false;

    return true;
  } catch {
    return false;
  }
}

// Get all saved links
export async function getAllLinks() {
  const result = await pool.query("SELECT * FROM links ORDER BY id DESC");
  return result.rows;
}

// Create new short URL
export async function createShortLink(originalUrl) {
  if (!isValidUrl(originalUrl)) {
    throw new Error("Invalid URL format! Enter a valid http/https link.");
  }

  // Check if URL already exists
  const existingUrl = await pool.query(
    "SELECT * FROM links WHERE url = $1",
    [originalUrl]
  );

  if (existingUrl.rowCount > 0) {
    throw new Error("URL already exists!");
  }

  // Generate unique code
  let code = generateCode();

  const codeExists = await pool.query("SELECT code FROM links WHERE code = $1", [
    code,
  ]);

  if (codeExists.rowCount > 0) {
    // regenerate if duplicate
    code = generateCode();
  }

  // Insert new link
  const insert = await pool.query(
    `INSERT INTO links (code, url, clicks)
     VALUES ($1, $2, 0)
     RETURNING *`,
    [code, originalUrl]
  );

  return insert.rows[0];
}

// Delete link by code
export async function deleteLinkByCode(code) {
  const result = await pool.query("DELETE FROM links WHERE code = $1", [code]);

  if (result.rowCount === 0) {
    throw new Error("Link not found!");
  }

  return true;
}

// Find link for redirect
export async function findLinkByCode(code) {
  const result = await pool.query("SELECT * FROM links WHERE code = $1", [code]);
  return result.rows[0];
}

// Increment click count
export async function incrementClick(code) {
  await pool.query(
    `UPDATE links 
     SET clicks = clicks + 1, last_clicked = NOW()
     WHERE code = $1`,
    [code]
  );
}
