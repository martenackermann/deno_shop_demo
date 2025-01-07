import { Context } from "https://deno.land/x/oak/mod.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { Cart } from "../models/cartModel.ts";  // Import the Cart model
import { CartItem } from "../models/cartItemModel.ts";  // Import the CartItem model

const db = new DB("shop.db");

// Helper function to map database row to Cart model
const mapToCart = (row: any[]): Cart => {
    const [id, itemsJson, active] = row;
    const items = JSON.parse(itemsJson);  // Parse the items JSON string to an array of CartItem objects
    return {
        id,
        items,
        active,
    };
};

// Helper function to map CartItem to detailed product information
const mapToCartItemWithProductDetails = (item: any): CartItem => {
    const productResult = db.query(`
    SELECT p.id, p.name, p.price, p.imageSrc, p.description
    FROM products p
    WHERE p.id = ?
  `, [item.productId]);

    if (productResult.length > 0) {
        const [productId, name, price, imageSrc, description] = productResult[0];
        return {
            ...item,  // Spread the CartItem properties
            productId,
            name,
            price,
            imageSrc,
            description,
        };
    }

    return item;  // Return the CartItem without product details if not found
};

// Controller to get the active cart
export const getActiveCart = async (ctx: Context) => {
    const cartResult = [...db.query(`
        SELECT sc.id, sc.items, sc.active
        FROM shoppingCarts sc
        WHERE sc.active = 1
    `)];

    if (cartResult.length === 0) {
        ctx.response.status = 404;
        ctx.response.body = { message: "No active cart found" };
        return;
    }

    // Map the result to a Cart object
    const cart = mapToCart(cartResult[0]);

    // If cart is null, return an empty cart
    if (!cart) {
        ctx.response.body = { id: null, items: [], active: 1 };
        return;
    }

    // If there are items in the cart, enrich them with product details
    const detailedItems = (cart.items || []).map(mapToCartItemWithProductDetails);

    // Returning the cart with detailed items
    ctx.response.body = { ...cart, items: detailedItems };
};

// Controller to update the active cart
export const updateCart = async (ctx: Context) => {
    const cart: Cart = await ctx.request.body.json();  // Expecting a Cart object from the request body
    const itemsJson = JSON.stringify(cart.items);  // Convert the CartItem array to JSON

    // Update the active cart's items
    db.query("UPDATE shoppingCarts SET items = ? WHERE active = 1", [itemsJson]);

    ctx.response.body = { message: "Cart updated successfully", items: cart.items };
};

// Controller to close the active cart and create a new one if needed
export const closeCart = async (ctx: Context) => {
    // Mark the current active cart as closed
    db.query("UPDATE shoppingCarts SET active = ? WHERE active = 1", [0]);

    // If no active cart exists, create a new one with an empty items array
    const result = db.query("SELECT * FROM shoppingCarts WHERE active = 1");
    if (result.length === 0) {
        db.execute("INSERT INTO shoppingCarts (items, active) VALUES (?, 1)", [JSON.stringify([])]);
    }

    ctx.response.body = { message: "Checkout successfully" };
};

// Controller to add a product to the cart
export const addProductToCart = async (ctx: Context) => {
    const { productId, quantity } = await ctx.request.body.json();

    // Ensure both productId and quantity are provided
    if (!productId || !quantity) {
        ctx.response.status = 400;
        ctx.response.body = { message: "Invalid request body" };
        return;
    }

    // Insert the product into the cart's items
    db.execute(`
    INSERT INTO shoppingCarts (productId, quantity)
    VALUES (?, ?)
  `, [productId, quantity]);

    ctx.response.status = 201;
    ctx.response.body = { message: "Product added to cart successfully" };
};
