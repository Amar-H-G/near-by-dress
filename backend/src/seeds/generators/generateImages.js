/**
 * generateImages.js
 * Curated list of premium, high-resolution fashion and boutique image assets from Unsplash.
 * Ensures the seeded marketplace looks breathtaking and visually elite at first glance.
 */

const BOUTIQUE_COVERS = [
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1524255684952-d7185b509571?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80'
];

const BOUTIQUE_LOGOS = [
  'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1534452208753-448f65379b0b?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1481437156560-3205a6a55735?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1573855619003-97b4799dcd8b?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1567401893930-7bec752b4d89?auto=format&fit=crop&w=300&q=80'
];

const PRODUCT_IMAGES = {
  saree: [
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80'
  ],
  kurti: [
    'https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=600&q=80'
  ],
  hoodie: [
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=600&q=80'
  ],
  tshirt: [
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=600&q=80'
  ],
  jeans: [
    'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80'
  ],
  ethnic_wear: [
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80'
  ],
  kids_wear: [
    'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1622273509381-229202af0299?auto=format&fit=crop&w=600&q=80'
  ],
  formal_wear: [
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=600&q=80'
  ],
  oversized_fashion: [
    'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80'
  ],
  streetwear: [
    'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=600&q=80'
  ]
};

const getRandomBoutiqueCover = () => {
  return BOUTIQUE_COVERS[Math.floor(Math.random() * BOUTIQUE_COVERS.length)];
};

const getRandomBoutiqueLogo = () => {
  return BOUTIQUE_LOGOS[Math.floor(Math.random() * BOUTIQUE_LOGOS.length)];
};

const getProductImagesByCategory = (catKey) => {
  const images = PRODUCT_IMAGES[catKey] || PRODUCT_IMAGES.tshirt;
  return images.map(url => ({ url, public_id: `seeded_${catKey}_${Math.random().toString(36).substr(2, 9)}` }));
};

module.exports = {
  getRandomBoutiqueCover,
  getRandomBoutiqueLogo,
  getProductImagesByCategory
};
