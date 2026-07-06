export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image: string;
}

export const PRODUCTS: Product[] = [
  {
    id: "cream-cleanser",
    name: "Cream Cleanser",
    category: "Cleansers",
    description: "Gentle daily cleanser for all skin types",
    price: 32.00,
    image: "/cream-cleanser.png",
  },
  {
    id: "radiance-serum",
    name: "Radiance Serum",
    category: "Serums",
    description: "Brightening & hydrating vitamin C serum",
    price: 48.00,
    image: "/radiance-serum.png",
  },
  {
    id: "daily-moisturizer",
    name: "Daily Moisturizer",
    category: "Moisturizers",
    description: "Nourishing moisturizer for healthy skin barrier",
    price: 36.00,
    image: "/daily-moisturizer.png",
  },
  {
    id: "mineral-sunscreen",
    name: "Mineral Sunscreen",
    category: "Sun Care",
    description: "Broad spectrum SPF 50 for daily protection",
    price: 28.00,
    image: "/mineral-sunscreen.png",
  },
  {
    id: "niacinamide-toner",
    name: "Niacinamide Toner",
    category: "Toners",
    description: "Pore refining & balancing daily toner",
    price: 26.00,
    image: "/niacinamide-toner.png",
  },
];
