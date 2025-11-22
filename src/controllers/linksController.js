import { pool } from "../utils/db.js";
import { generateCode } from "../utils/generateCode.js";

// Normalize URL (lowercase, remove trailing slash)
function normalizeUrl(url) {
  try {
    const parsed = new URL(url);
    let normalized = parsed.href.toLowerCase().replace(/\/$/, '');
    console.log("🔧 Normalized URL:", normalized);
    return normalized;
  } catch {
    return url.toLowerCase().trim();
  }
}

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

// Create new short URL (prevents duplicate URLs)
export async function createShortLink(originalUrl, customCode = null) {
  console.log("\n========================================");
  console.log("🆕 CREATE SHORT LINK CALLED");
  console.log("📥 Original URL:", originalUrl);
  console.log("📥 Custom Code:", customCode);
  
  // Normalize URL first
  originalUrl = normalizeUrl(originalUrl);
  console.log("✅ After normalization:", originalUrl);

  // Validate URL format
  if (!isValidUrl(originalUrl)) {
    console.log("❌ VALIDATION FAILED");
    throw new Error("Invalid URL format! Enter a valid http/https link.");
  }
  console.log("✅ URL validation passed");

  // DUPLICATE URL CHECK
  console.log("🔍 Checking for duplicates...");
  const existingUrl = await pool.query(
    "SELECT * FROM links WHERE LOWER(url) = LOWER($1)",
    [originalUrl]
  );

  console.log("📊 Duplicate check - Found:", existingUrl.rowCount, "matches");
  
  if (existingUrl.rowCount > 0) {
    const existingCode = existingUrl.rows[0].code;
    console.log("❌❌❌ DUPLICATE FOUND! Existing code:", existingCode);
    console.log("========================================\n");
    throw new Error(`URL already exists! Short code: ${existingCode}`);
  }

  console.log("✅ No duplicates found, proceeding...");

  // Generate or use custom code
  let code = customCode ? customCode.trim() : generateCode();
  console.log("🎲 Generated/Custom code:", code);

  // Check if custom code already exists
  let codeExists = await pool.query("SELECT code FROM links WHERE code = $1", [code]);
  
  if (codeExists.rowCount > 0) {
    console.log("❌ Code already exists");
    throw new Error("Custom code already in use. Please choose a different code.");
  }

  // Insert new link into database
  console.log("💾 Inserting into database...");
  const insert = await pool.query(
    `INSERT INTO links (code, url, clicks, created_at) 
     VALUES ($1, $2, 0, NOW()) 
     RETURNING *`,
    [code, originalUrl]
  );

  console.log("✅ SUCCESS! Created:", insert.rows[0]);
  console.log("========================================\n");
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

// Find link for stats/redirect
export async function findLinkByCode(code) {
  const result = await pool.query("SELECT * FROM links WHERE code = $1", [code]);
  return result.rows[0];
}

// Track click stats
export async function incrementClick(code) {
  await pool.query(
    `UPDATE links 
     SET clicks = clicks + 1, last_clicked = NOW() 
     WHERE code = $1`,
    [code]
  );
}
