import { Router } from "https://deno.land/x/oak/mod.ts";
import { createProduct, getProducts, getProduct, addComment, updateProduct, deleteProduct } from "../controllers/productController.ts";

const router = new Router();

router.post("/products/create", createProduct);
router.get("/products", getProducts);
router.get("/products/:id", getProduct);
router.delete("/products/:id", deleteProduct);
router.post("/products/:id/comments", addComment);
router.post("/products/:id/update", updateProduct);

export default router;
