export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  onSale: boolean;
  salePrice: number | null;
  isFeatured: boolean;
  costPrice?: number | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Category {
  id: string;
  name: string;
}
