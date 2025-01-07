import { Application } from "https://deno.land/x/oak/mod.ts";
import authRoutes from "./routes/authRoutes.ts";
import productRoutes from "./routes/productRoutes.ts";
import shoppingCartRoutes from "./routes/shoppingCartRoutes.ts";
import cors from "./middleware/cors.ts";
import { ensureActiveCart } from "./db/sqlite.ts";

const app = new Application();

// Ensure there is an active cart
ensureActiveCart();

// Middleware
app.use(cors);

// Use routes
app.use(authRoutes.routes());
app.use(authRoutes.allowedMethods());
app.use(productRoutes.routes());
app.use(productRoutes.allowedMethods());
app.use(shoppingCartRoutes.routes());
app.use(shoppingCartRoutes.allowedMethods());

// Start the server
console.log("Server running at http://localhost:8000");
await app.listen({ port: 8000 });