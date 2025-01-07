export interface Product {
    id?: number;
    name: string;
    price: number;
    description: string;
    imageSrc: string;
    details: string;
    tasteDescription: string;
    ingredients: string;
    countryOfOrigin: string;
    rating?: number;
}