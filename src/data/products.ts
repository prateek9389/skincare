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
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop",
    ingredients: ["Salicylic acid", "Vitamin E"]
  },
  {
    id: "radiance-serum",
    name: "Radiance Serum",
    category: "Serums",
    description: "Brightening & hydrating vitamin C serum",
    price: 48.00,
    image: "https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=600&auto=format&fit=crop",
    ingredients: ["Vitamin C", "Hyaluronic acid"]
  },
  {
    id: "daily-moisturizer",
    name: "Daily Moisturizer",
    category: "Moisturizers",
    description: "Nourishing moisturizer for healthy skin barrier",
    price: 36.00,
    image: "https://images.unsplash.com/photo-1608248593840-2e3eb8c6c8ce?q=80&w=600&auto=format&fit=crop",
    ingredients: ["Hyaluronic acid", "Niacinamide"]
  },
  {
    id: "mineral-sunscreen",
    name: "Mineral Sunscreen",
    category: "Sun Care",
    description: "Broad spectrum SPF 50 for daily protection",
    price: 28.00,
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=600&auto=format&fit=crop",
    ingredients: ["Vitamin E"]
  },
  {
    id: "niacinamide-toner",
    name: "Niacinamide Toner",
    category: "Toners",
    description: "Pore refining & balancing daily toner",
    price: 30.00,
    image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=600&auto=format&fit=crop",
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
    price: 18.00,
    image: "https://images.unsplash.com/photo-1629198725970-7b5871f9801b?q=80&w=600&auto=format&fit=crop",
    ingredients: ["Vitamin E"]
  },
  {
    id: "coconut-body-butter",
    name: "Coconut Body Butter",
    category: "Body Care",
    description: "Deeply moisturizing whipped body butter",
    price: 24.00,
    image: "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?q=80&w=600&auto=format&fit=crop",
    ingredients: ["Lactic acid", "Vitamin E"]
  },
  {
    id: "peeling-gel",
    name: "Peeling Gel",
    category: "Cleansers",
    description: "Gentle exfoliating gel with natural AHAs",
    price: 42.00,
    image: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=600&auto=format&fit=crop",
    ingredients: ["Hyaluronic acid", "Retinol"]
  }
];
