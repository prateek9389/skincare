export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image: string;
  tag?: string;
  ingredients?: string[];
}

export const PRODUCTS: Product[] = [
  {
    id: "cream-cleanser",
    name: "Cream Cleanser",
    category: "Cleansers",
    description: "Gentle daily cleanser for all skin types",
    price: 32.00,
    image: "/cream-cleanser.png",
    ingredients: ["Salicylic acid", "Vitamin E"]
  },
  {
    id: "radiance-serum",
    name: "Radiance Serum",
    category: "Serums",
    description: "Brightening & hydrating vitamin C serum",
    price: 48.00,
    image: "/radiance-serum.png",
    ingredients: ["Vitamin C", "Hyaluronic acid"]
  },
  {
    id: "daily-moisturizer",
    name: "Daily Moisturizer",
    category: "Moisturizers",
    description: "Nourishing moisturizer for healthy skin barrier",
    price: 36.00,
    image: "/daily-moisturizer.png",
    ingredients: ["Hyaluronic acid", "Niacinamide"]
  },
  {
    id: "mineral-sunscreen",
    name: "Mineral Sunscreen",
    category: "Sun Care",
    description: "Broad spectrum SPF 50 for daily protection",
    price: 28.00,
    image: "/mineral-sunscreen.png",
    ingredients: ["Vitamin E"]
  },
  {
    id: "niacinamide-toner",
    name: "Niacinamide Toner",
    category: "Toners",
    description: "Pore refining & balancing daily toner",
    price: 26.00,
    image: "/niacinamide-toner.png",
    ingredients: ["Niacinamide", "Salicylic acid"]
  },
  {
    id: "jaluellicin-serum",
    name: "Jaluellicin Serum",
    category: "Serums",
    description: "Intense hydrating serum with hyaluronic acid",
    price: 20.00,
    image: "/category-serums.png",
    tag: "HIT",
    ingredients: ["Hyaluronic acid"]
  },
  {
    id: "noni-ointment",
    name: "Noni Eczema Treatment Ointment",
    category: "Body Care",
    description: "Soothing natural relief for eczema & skin rashes",
    price: 15.00,
    image: "/instagram-blue-jar.png",
    tag: "HIT",
    ingredients: ["Vitamin E"]
  },
  {
    id: "jaluellicin-cream",
    name: "Jaluellicin Cream",
    category: "Moisturizers",
    description: "Rich anti-aging treatment with pure retinol support",
    price: 35.00,
    image: "/category-moisturizers.png",
    tag: "HIT",
    ingredients: ["Retinol", "Hyaluronic acid"]
  },
  {
    id: "jaluellicin-eye",
    name: "Jaluellicin Eye Cream",
    category: "Eye & Lip Care",
    description: "Targeted smoothing cream for fine lines & puffiness",
    price: 20.00,
    image: "/instagram-hands-cream.png",
    ingredients: ["Retinol", "Vitamin E"]
  },
  {
    id: "premium-cbd-oil",
    name: "Premium CBD Oil",
    category: "Serums",
    description: "Calming face oil with active hemp botanical extracts",
    price: 25.00,
    image: "/radiance-serum.png",
    ingredients: ["Vitamin E"]
  },
  {
    id: "coconut-body-butter",
    name: "Coconut Body Butter",
    category: "Body Care",
    description: "Deeply moisturizing whipped body butter",
    price: 8.00,
    image: "/coconut-body-butter.png",
    ingredients: ["Lactic acid", "Vitamin E"]
  },
  {
    id: "peeling-gel",
    name: "Peeling Gel",
    category: "Cleansers",
    description: "Gentle exfoliating gel with natural AHAs",
    price: 20.00,
    image: "/category-cleansers.png",
    ingredients: ["Lactic acid", "Salicylic acid"]
  }
];
