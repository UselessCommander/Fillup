/** @typedef {{ id: number; name: string; address: string; lat: number; lng: number; description: string; categories: string[]; productSummary: string; products: { name: string; price: string; category: string; inStock: boolean }[]; rating?: number }} Place */

/** @type {Place[]} */
export const PLACES = [
  {
    id: 1,
    name: 'The Body Shop',
    address: 'Boulebar Nørregade 25',
    lat: 55.6812,
    lng: 12.571,
    description: 'Refill af udvalgte kropsplejeprodukter. Medbring tom flaske.',
    categories: ['Shampoo', 'Balsam', 'Sæbe'],
    productSummary: 'Shampoo, Balsam, Sæbe',
    products: [
      { name: 'Shea Shampoo', price: 'fra 45 kr / 100 ml', category: 'Shampoo', inStock: true },
      { name: 'Ginger Balsam', price: 'fra 45 kr / 100 ml', category: 'Balsam', inStock: true },
      { name: 'Håndsæbe', price: 'fra 35 kr / 100 ml', category: 'Sæbe', inStock: true },
    ],
    rating: 4.6,
  },
  {
    id: 2,
    name: 'Løs Market',
    address: 'Vesterbrogade 120, København',
    lat: 55.6704,
    lng: 12.5447,
    description: 'Københavns første emballagefri supermarked. Medbring dine egne beholdere.',
    categories: ['Fødevarer', 'Rengøring', 'Shampoo'],
    productSummary: 'Fødevarer, Rengøring, Shampoo',
    products: [
      { name: 'Økologisk Havregryn', price: '25 kr / kg', category: 'Fødevarer', inStock: true },
      { name: 'Flydende Vaskemiddel (Neutral)', price: '45 kr / L', category: 'Rengøring', inStock: true },
      { name: 'Shampoo (Birk & Aloe Vera)', price: '60 kr / L', category: 'Shampoo', inStock: true },
    ],
    rating: 4.8,
  },
  {
    id: 3,
    name: 'Råvarebutikken',
    address: 'Nørrebrogade 55, København',
    lat: 55.6921,
    lng: 12.5478,
    description: 'Økologi og rene råvarer. Kropspleje og husholdning i løssalg.',
    categories: ['Shampoo', 'Hudpleje', 'Vaskemiddel', 'Rengøring'],
    productSummary: 'Shampoo, Hudpleje, Vaskemiddel',
    products: [
      { name: 'Balsam-bar', price: '75 kr / stk', category: 'Hudpleje', inStock: true },
      { name: 'Universalrengøring', price: '30 kr / L', category: 'Rengøring', inStock: true },
      { name: 'Opvaskemiddel med citrus', price: '35 kr / L', category: 'Vaskemiddel', inStock: true },
    ],
    rating: 4.6,
  },
  {
    id: 4,
    name: 'EcoKbh Genfyld',
    address: 'Østerbrogade 102, København',
    lat: 55.7096,
    lng: 12.5819,
    description: 'Genopfyldning af hverdagsprodukter med fokus på miljømærker.',
    categories: ['Vaskemiddel', 'Rengøring', 'Shampoo'],
    productSummary: 'Vaskemiddel, Rengøring, Shampoo',
    products: [
      { name: 'Color Vaskemiddel', price: '40 kr / L', category: 'Vaskemiddel', inStock: true },
      { name: 'Skyllemiddel', price: '25 kr / L', category: 'Vaskemiddel', inStock: true },
      { name: 'Hjardemynte Shampoo', price: '55 kr / L', category: 'Shampoo', inStock: true },
    ],
    rating: 4.9,
  },
];

export const ALL_CATEGORIES = [
  'Alle',
  'Shampoo',
  'Vaskemiddel',
  'Fødevarer',
  'Hudpleje',
  'Rengøring',
  'Balsam',
  'Sæbe',
];
