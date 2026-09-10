export type Role = 'CUSTOMER' | 'ADMIN';

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
};

export type ProductImage = {
  id: string;
  url: string;
  alt?: string | null;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string | number;
  /** Precio anterior; si es mayor que `price`, se muestra como oferta. */
  compareAtPrice?: string | number | null;
  stock: number;
  active: boolean;
  featured: boolean;
  categoryId: string;
  category?: Category;
  images: ProductImage[];
};
