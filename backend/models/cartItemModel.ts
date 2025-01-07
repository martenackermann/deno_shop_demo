export interface CartItem {
    productId: number;
    quantity: number;
    name?: string;
    price?: number;
    imageSrc?: string;
    description?: string;
}
