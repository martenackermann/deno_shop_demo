import { Context } from "https://deno.land/x/oak/mod.ts";
import { db } from "../db/sqlite.ts";
import { Product } from "../models/productModel.ts";

// Helper function to map database row to Product model
// This function ensures that the data from the database is transformed into a consistent format as defined by the Product model
const mapToProduct = (row: any[]): Product => {
    const [id, name, price, description, imageSrc, details, rating, tasteDescription, ingredients, countryOfOrigin] = row;
    return {
        id,
        name,
        price,
        description,
        imageSrc,
        details,
        rating,
        tasteDescription,
        ingredients,
        countryOfOrigin,
    };
};

export const createProduct = async (ctx: Context) => {
    try {
        // Parse the incoming JSON body to create a Product object
        // Destructuring the body into specific product attributes for easy access
        const body: Product = await ctx.request.body.json();
        const { name, price, description, imageSrc, details, tasteDescription, ingredients, countryOfOrigin } = body;

        // Ensure all required fields are provided in the request body
        // If any required field is missing, we send a 400 Bad Request response
        if (
            !name || price == null || !description || !imageSrc || !details || !tasteDescription || !ingredients || !countryOfOrigin
        ) {
            ctx.response.status = 400;
            ctx.response.body = { error: "Missing required fields" };
            return;
        }

        // Insert the new product into the database using a parameterized query to prevent SQL injection
        const query = `
            INSERT INTO products (name, price, description, imageSrc, details, tasteDescription, ingredients, countryOfOrigin)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        `;
        db.query(query, [
            name,
            price,
            description,
            imageSrc,
            details,
            tasteDescription,
            ingredients,
            countryOfOrigin,
        ]);

        // Respond with a success message and 201 status code to indicate successful resource creation
        ctx.response.status = 201;
        ctx.response.body = { message: "Product created successfully" };
    } catch (error) {
        // Catch any unexpected errors and log them
        // Respond with a 500 Internal Server Error in case of failure
        console.error("Error creating product:", error);
        ctx.response.status = 500;
        ctx.response.body = { error: "Internal Server Error" };
    }
};

export const getProducts = async (ctx: Context) => {
    // Query the database to retrieve all products
    // The result is mapped to the Product model to ensure consistent formatting
    const products = [...db.query("SELECT * FROM products")].map(mapToProduct);

    // Respond with the list of products
    ctx.response.body = products;
};

export const getProduct = async (ctx: Context) => {
    // Parse the product ID from the URL parameters
    const productId = parseInt(ctx.params.id!);

    // Query the database for the product with the given ID
    const productResult = [...db.query("SELECT * FROM products WHERE id = ?", [productId])];

    // If the product is not found, respond with a 404 Not Found error
    if (productResult.length === 0) {
        ctx.response.status = 404;
        ctx.response.body = { message: "Product not found" };
        return;
    }

    // Map the database row to a Product object
    const product = mapToProduct(productResult[0]);

    // Include the comments in the response, returning a comprehensive product object
    ctx.response.body = {
        ...product,
    };
};

export const addComment = async (ctx: Context) => {
    // Parse the product ID from the URL parameters
    const productId = parseInt(ctx.params.id!);

    // Parse the comment details from the request body
    const { username, comment, rating } = await ctx.request.body.json();

    // Ensure all fields (username, comment, rating) are provided
    if (!username || !comment || !rating) {
        ctx.response.status = 400;
        ctx.response.body = { message: "Invalid request body" };
        return;
    }

    // Insert the comment into the database for the given product
    db.execute(`
        INSERT INTO comments (productId, username, comment, rating)
        VALUES (?, ?, ?, ?)
    `, [productId, username, comment, rating]);

    // Recalculate the average rating for the product after a new comment
    const averageRating = calculateAverageRating(productId);

    // Update the product's rating in the database based on the newly calculated average
    db.execute(`
        UPDATE products SET rating = ? WHERE id = ?
    `, [averageRating, productId]);

    // Respond with a success message
    ctx.response.body = { message: "Comment added successfully" };
};

const calculateAverageRating = (productId: number) => {
    // Query the database for all ratings for a given product
    const ratings = db.query("SELECT rating FROM comments WHERE productId = ?", [productId]);

    // If there are no ratings, return 0
    if (ratings.length === 0) return 0;

    // Calculate the sum of all ratings
    const sum = ratings.reduce((acc, [rating]) => acc + rating, 0);

    // Return the average rating
    return sum / ratings.length;
};

export const updateProduct = async (ctx: Context) => {
    try {
        // Parse the product ID from the route parameters
        const id = parseInt(ctx.params.id);

        // Parse the updated product data from the request body
        const body: Product = await ctx.request.body.json();
        const { name, price, description, imageSrc, details, rating, tasteDescription, ingredients, countryOfOrigin } = body;

        // Ensure all required fields are provided for the update
        if (
            !name || price == null || !description || !imageSrc || !details ||
            rating == null || !tasteDescription || !ingredients || !countryOfOrigin
        ) {
            ctx.response.status = 400;
            ctx.response.body = { error: "Missing required fields" };
            return;
        }

        // Define the update query to modify the product details in the database
        const query = `
            UPDATE products
            SET
                name = ?,
                price = ?,
                description = ?,
                imageSrc = ?,
                details = ?,
                rating = ?,
                tasteDescription = ?,
                ingredients = ?,
                countryOfOrigin = ?
            WHERE id = ?;
        `;

        // Execute the query to update the product
        db.query(query, [
            name,
            price,
            description,
            imageSrc,
            details,
            rating,
            tasteDescription,
            ingredients,
            countryOfOrigin,
            id,
        ]);

        // Respond with a success message
        ctx.response.status = 200;
        ctx.response.body = { message: "Product updated successfully" };
    } catch (error) {
        // Catch any errors and log them
        console.error("Error updating product:", error);
        ctx.response.status = 500;
        ctx.response.body = { error: "Internal Server Error" };
    }
};
export const deleteProduct = async (ctx: Context) => {
    try {
        // Parse the product ID from the URL parameters
        const productId = parseInt(ctx.params.id!);

        // Check if the product exists in the database
        const productResult = [...db.query("SELECT * FROM products WHERE id = ?", [productId])];
        if (productResult.length === 0) {
            ctx.response.status = 404;
            ctx.response.body = { message: "Product not found" };
            return;
        }

        // Delete the product from the database
        db.query("DELETE FROM products WHERE id = ?", [productId]);

        // Respond with a success message
        ctx.response.status = 200;
        ctx.response.body = { message: "Product deleted successfully" };
    } catch (error) {
        // Catch any errors and log them
        console.error("Error deleting product:", error);
        ctx.response.status = 500;
        ctx.response.body = { error: "Internal Server Error" };
    }
};