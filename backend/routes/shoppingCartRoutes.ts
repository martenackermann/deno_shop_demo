import { Router } from "https://deno.land/x/oak/mod.ts";
import { addProductToCart, getActiveCart, updateCart, closeCart } from "../controllers/shoppingCartController.ts";

const router = new Router();

router.post("/shoppingCarts", addProductToCart);
router.get("/shoppingCarts/active", getActiveCart);
router.put("/shoppingCarts", updateCart);
router.post("/shoppingCarts/checkout", closeCart);

export default router;