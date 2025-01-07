import { DB } from "https://deno.land/x/sqlite/mod.ts";

// Initialize the database connection
export const db = new DB("shop.db");

// Create 'products' table if it doesn't exist
db.execute(`
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        description TEXT,
        imageSrc TEXT,
        details TEXT,
        rating REAL DEFAULT 0,
        tasteDescription TEXT,
        ingredients TEXT,
        countryOfOrigin TEXT
    );
`);

// Create 'users' table if it doesn't exist
db.query(`
    CREATE TABLE IF NOT EXISTS users (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         email TEXT UNIQUE NOT NULL,  
         password TEXT NOT NULL DEFAULT "password"
    );
`);


// Create 'shoppingCarts' table if it doesn't exist
db.execute(`
    CREATE TABLE IF NOT EXISTS shoppingCarts (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         items TEXT,
         active INTEGER DEFAULT 1
    );
`);

// Function to ensure there is always an active cart in the shopping cart table
export const ensureActiveCart = () => {
    // Check if an active shopping cart already exists
    const result = db.query("SELECT * FROM shoppingCarts WHERE active = 1");

    // If no active cart exists, create a new one with an empty item list
    if (result.length === 0) {
        db.execute("INSERT INTO shoppingCarts (items, active) VALUES (?, 1)", [JSON.stringify([])]);
    }
};

// Export the database connection for use in other parts of the application
export default db;
