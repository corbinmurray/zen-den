import Database from "better-sqlite3";
import fs from "fs";
import { nanoid } from "nanoid";
import path from "path";
import { Garden } from "./types";

// Ensure the data directory exists
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
	fs.mkdirSync(dataDir, { recursive: true });
}

// Connect to SQLite database
const dbPath = path.join(dataDir, "garden-shares.db");
const db = new Database(dbPath);

// Initialize the database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS shared_gardens (
    id TEXT PRIMARY KEY,
    garden_data TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )
`);

/**
 * Store garden data and return a unique ID
 */
export function storeGarden(garden: Garden): string {
	// Generate a short ID (7 characters is sufficient for a garden sharing app)
	const id = nanoid(7);

	const stmt = db.prepare(`
    INSERT INTO shared_gardens (id, garden_data, created_at)
    VALUES (?, ?, ?)
  `);

	stmt.run(id, JSON.stringify(garden), Date.now());

	return id;
}

/**
 * Retrieve garden data by ID
 */
export function getGarden(id: string): Garden | null {
	const stmt = db.prepare(`
    SELECT garden_data FROM shared_gardens
    WHERE id = ?
  `);

	const result = stmt.get(id) as { garden_data: string } | undefined;

	if (!result) {
		return null;
	}

	return JSON.parse(result.garden_data);
}
