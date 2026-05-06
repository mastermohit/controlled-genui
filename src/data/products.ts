import type { Product } from "../types";

export const products: Product[] = [
  {
    id: "lenovo-loq-15",
    name: "Lenovo LOQ 15",
    brand: "Lenovo",
    price: 74990,
    rating: 4.5,
    processor: "Intel i5 H-series",
    ram: "16 GB",
    storage: "512 GB SSD",
    gpu: "RTX 4050",
    battery: "60 Wh",
    weight: "2.4 kg",
    bestFor: ["Gaming", "Coding", "College"],
    highlights: ["Strong GPU for the price", "Comfortable keyboard", "Good thermals"],
    tradeoffs: ["Heavier than ultrabooks", "Average battery life"]
  },
  {
    id: "asus-vivobook-pro",
    name: "ASUS Vivobook Pro 15",
    brand: "ASUS",
    price: 69990,
    rating: 4.4,
    processor: "Ryzen 7",
    ram: "16 GB",
    storage: "1 TB SSD",
    gpu: "RTX 3050",
    battery: "70 Wh",
    weight: "1.8 kg",
    bestFor: ["Coding", "Creators", "College"],
    highlights: ["Balanced performance", "OLED display", "Large SSD"],
    tradeoffs: ["GPU is entry level", "Can warm up under load"]
  },
  {
    id: "hp-victus-16",
    name: "HP Victus 16",
    brand: "HP",
    price: 78990,
    rating: 4.3,
    processor: "Ryzen 5 H-series",
    ram: "16 GB",
    storage: "512 GB SSD",
    gpu: "RTX 4050",
    battery: "70 Wh",
    weight: "2.3 kg",
    bestFor: ["Gaming", "Streaming", "Coding"],
    highlights: ["Large screen", "Capable graphics", "Good upgrade path"],
    tradeoffs: ["Bulky for daily carry", "Display color is average"]
  },
  {
    id: "acer-swift-go",
    name: "Acer Swift Go 14",
    brand: "Acer",
    price: 62990,
    rating: 4.2,
    processor: "Intel Core Ultra 5",
    ram: "16 GB",
    storage: "512 GB SSD",
    gpu: "Integrated Arc",
    battery: "65 Wh",
    weight: "1.3 kg",
    bestFor: ["College", "Coding", "Travel"],
    highlights: ["Portable build", "Long battery", "Sharp display"],
    tradeoffs: ["Not for serious gaming", "Limited GPU headroom"]
  },
  {
    id: "dell-inspiron-14-plus",
    name: "Dell Inspiron 14 Plus",
    brand: "Dell",
    price: 72990,
    rating: 4.3,
    processor: "Intel i7 P-series",
    ram: "16 GB",
    storage: "1 TB SSD",
    gpu: "Integrated Iris Xe",
    battery: "64 Wh",
    weight: "1.6 kg",
    bestFor: ["Coding", "Business", "College"],
    highlights: ["Premium-feeling chassis", "Fast CPU", "Reliable support"],
    tradeoffs: ["Weak gaming performance", "Fewer ports"]
  }
];

export const productById = new Map(products.map((product) => [product.id, product]));
