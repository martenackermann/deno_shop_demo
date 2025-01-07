import { Context } from "https://deno.land/x/oak/mod.ts";
import { db } from "../db/sqlite.ts";
import { User } from "../models/userModel.ts";  // Import the User model

// Helper function to map the database result to a User object
const mapToUser = (row: any[]): User | null => {
    if (!row || row.length === 0) return null;

    const [id, email, password] = row;
    return {
        id,
        email,
        password,
    };
};

// Login Controller to authenticate the user
export const login = async (ctx: Context) => {
    try {
        const { email, password } = await ctx.request.body.json();

        // Find the user in the database
        const userResult = db.query("SELECT * FROM users WHERE email = ? AND password = ?", [email, password]);

        const user = mapToUser(userResult[0]); // Map the result to a User object

        if (user) {
            ctx.response.body = {
                success: true,
                message: "Login successful!",
                user: { email: user.email }, // Only returning the email for the response (you may want to exclude password)
            };
            ctx.response.status = 200;
        } else {
            ctx.response.body = { success: false, message: "Invalid credentials" };
            ctx.response.status = 401;
        }
    } catch (error) {
        console.error("Error during login:", error);
        ctx.response.status = 500;
        ctx.response.body = { success: false, message: "Internal Server Error" };
    }
};
