/**
 * generateProducts.js
 * Generates 10 premium, highly realistic fashion items for each boutique shop.
 * Distributes items across 10 categories matching modern Indian fashion.
 */

const { getProductImagesByCategory } = require('./generateImages');

const PRODUCT_TEMPLATES = [
  {
    key: 'saree',
    categoryName: 'Saree & Lehengas',
    titles: [
      'Pure Banarasi Silk Saree',
      'Handcrafted Kanjeevaram Silk Saree',
      'Premium Organza Floral Saree',
      'Royal Crimson Chanderi Saree',
      'Pastel Georgette Sequined Saree'
    ],
    descriptions: [
      'Indulge in absolute luxury with this handwoven pure Banarasi silk saree featuring fine zari brocade work.',
      'A true masterpiece of heritage weaving. Premium Kanjeevaram raw silk saree with thick gold zari borders.',
      'Lightweight and ethereal. Beautiful premium organza saree with delicate hand-painted pastel blooms.',
      'Traditional handloom Chanderi silk saree with gorgeous copper bootis and an elegant pallu.',
      'Dazzle in evening wear. Premium georgette saree heavily embellished with micro-sequins for a sparkling look.'
    ],
    basePrice: 3200,
    priceRange: 2800,
    sizes: ['Free Size'],
    colors: ['Emerald Green', 'Royal Crimson', 'Midnight Blue', 'Golden Mustard', 'Pastel Pink']
  },
  {
    key: 'kurti',
    categoryName: 'Kurtis & Tunics',
    titles: [
      'Premium Chikankari Georgette Kurti',
      'Handblock printed Cotton Anarkali',
      'Indigo A-Line Handloom Kurta',
      'Festive Embroidered Silk Kurta Set',
      'Modern Linen Fusion tunic'
    ],
    descriptions: [
      'Exquisite hand-embroidered Lucknowi Chikankari work on premium georgette fabric with inner slip included.',
      'Gorgeous cotton Anarkali set featuring traditional Jaipur block prints and matching dupatta.',
      'Daily comfort meets style. A-line handloom cotton kurta in rich natural indigo dyes.',
      'Add a touch of elegance to festive gatherings. Embroidered chanderi silk kurta with matching pants.',
      'Modern fusion tunic crafted from organic, highly breathable linen with minimalist wood button detail.'
    ],
    basePrice: 950,
    priceRange: 800,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Lucknowi White', 'Indigo Blue', 'Turquoise', 'Maroon Red', 'Coral Pink']
  },
  {
    key: 'hoodie',
    categoryName: 'Hoodies & Sweatshirts',
    titles: [
      'Oversized Heavyweight Premium Hoodie',
      'Downtown Acid-Wash Streetwear Hoodie',
      'Minimal Vintage Fleece Sweatshirt',
      'Retro Graphic Print Pullover',
      'Dynamic Neon Tech-Wear Hoodie'
    ],
    descriptions: [
      'Premium 450 GSM ultra-soft brushed fleece hoodie designed in a boxy oversized streetwear silhouette.',
      'High-street acid-washed hoodie with heavy distressing and custom graphic branding on chest.',
      'Luxuriously soft brushed fleece crewneck sweatshirt for everyday minimal styling.',
      'Throwback graphic print hoodie featuring premium vintage rubberized art print.',
      'Tech-wear inspired futuristic hoodie with tactical zipper pockets and neon line overlays.'
    ],
    basePrice: 1800,
    priceRange: 1200,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Charcoal Black', 'Slate Grey', 'Acid Green', 'Dusty Rose', 'Vintage Off-White']
  },
  {
    key: 'tshirt',
    categoryName: 'T-Shirts & Tops',
    titles: [
      'Luxury Supima Cotton Heavy Tee',
      'Vintage Graphic Print Streetwear Tee',
      'Classic Solid Pique Polo',
      'Oversized Dropped Shoulder Tee',
      'Premium Ribbed Casual Crop Top'
    ],
    descriptions: [
      'Crafted from 100% rare Supima cotton for unparalleled softness, high luster, and durability.',
      'Hand-distressed vintage graphic tee featuring custom retro rock art print on heavy cotton.',
      'Timeless solid pique polo with double-knitted collars and custom mother-of-pearl buttons.',
      'Relaxed dropped shoulder box-fit tee. Breathable 240 GSM combed cotton perfect for warm days.',
      'Premium ribbed knit casual crop top with high elasticity and ultra-modern cut.'
    ],
    basePrice: 650,
    priceRange: 600,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Absolute Black', 'Vintage White', 'Sage Green', 'Royal Navy', 'Sand Beige']
  },
  {
    key: 'jeans',
    categoryName: 'Jeans & Trousers',
    titles: [
      'Premium Selvedge Denim Slim Jeans',
      'Downtown Relaxed Baggy Cargo Trousers',
      'Classic Straight-Fit Indigo Denim',
      'Modern High-Waist Wide-Leg Jeans',
      'Bespoke Tailored Structured Chinos'
    ],
    descriptions: [
      'Premium Japanese selvedge denim, slim-fit silhouette, featuring raw brass rivets.',
      'Streetwear-inspired baggy cargo pants crafted from heavyweight cotton ripstop utility fabric.',
      'Classic straight-leg blue jeans featuring high-durability double-stitch seams.',
      'Ultra-modern high-waisted wide-leg denim. Very soft, breathable, and figure-flattering.',
      'Bespoke casual chinos featuring hidden utility key loop and premium stretch-cotton blend.'
    ],
    basePrice: 1600,
    priceRange: 1400,
    sizes: ['30', '32', '34', '36', '38'],
    colors: ['Raw Indigo', 'Classic Light Blue', 'Pitch Black', 'Olive Green', 'Khaki Sand']
  },
  {
    key: 'ethnic_wear',
    categoryName: 'Ethnic Wear',
    titles: [
      'Luxury Georgette Anarkali Gown Set',
      'Brocade Sherwani Set with Churidar',
      'Modern Pathani Kurta Salwar Set',
      'Premium Dhoti Kurta Fusion Outfit',
      'Designer Velvet Kurta Dupatta Set'
    ],
    descriptions: [
      'Floor-length flowing Anarkali gown in rich georgette with elaborate hand-embellished zari necklines.',
      'Exquisite gold brocade Sherwani set for grooms and groomsmen. Elegant and traditional.',
      'Classic Pathani design featuring rich cotton-silk blend, button tabs, and matching salwar pants.',
      'Fusion dhoti kurta set with asymmetric hemline and modern jacquard weaving.',
      'Ultra-luxurious rich velvet straight kurta styled with delicate organza scalloped dupatta.'
    ],
    basePrice: 2800,
    priceRange: 3000,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Wine Burgundy', 'Royal Emerald', 'Gold Ochre', 'Velvet Navy', 'Jet Black']
  },
  {
    key: 'kids_wear',
    categoryName: 'Kids Wear',
    titles: [
      'Pure Organic Cotton Kids Play-Set',
      'Festive Jacquard Kids Sherwani Set',
      'Floral Print Princess Gown for Girls',
      'Casual Denim & Tee Set for Kids',
      'Cute Handcrafted Knit Romper'
    ],
    descriptions: [
      'GOTS certified organic cotton t-shirt and matching shorts. Zero skin irritation, highly breathable.',
      'Traditional baby boy festive Sherwani set with soft inner lining for ultimate child comfort.',
      'Ethereal layered princess gown featuring soft floral organza and breathable cotton under-slip.',
      'Comfortable light-wash denim overalls combined with a soft premium striped organic tee.',
      'Lovingly hand-knitted romper set crafted from extremely soft baby-grade wool blends.'
    ],
    basePrice: 590,
    priceRange: 600,
    sizes: ['2-3 Years', '4-5 Years', '6-7 Years', '8-9 Years'],
    colors: ['Candy Pink', 'Mint Green', 'Sunny Yellow', 'Baby Blue', 'Lilac Violet']
  },
  {
    key: 'formal_wear',
    categoryName: 'Formal Wear',
    titles: [
      'Premium Italian Bespoke Suit',
      'Elite Cotton Oxford Business Shirt',
      'Structured Formal Double-Breasted Blazer',
      'Slim-Fit Stretch Formal Trousers',
      'Premium Silk Jacquard Waistcoat'
    ],
    descriptions: [
      'Elite bespoke two-piece suit tailored from premium Italian wool-blend canvas.',
      'Crisp premium Oxford cotton business shirt featuring double-ply weave and classic collar.',
      'Sleek double-breasted formal blazer featuring sharp peak lapels and premium metal buttons.',
      'Perfect formal trousers with non-iron stretch weave and breathable active lining.',
      'Rich Banarasi silk jacquard waistcoat designed for elite corporate gala and evening wear.'
    ],
    basePrice: 4200,
    priceRange: 4000,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Midnight Navy', 'Charcoal Charcoal', 'Snow White', 'Steel Grey', 'Burgundy']
  },
  {
    key: 'oversized_fashion',
    categoryName: 'Oversized Fashion',
    titles: [
      'Oversized Boxy-Fit Flannel Shacket',
      'Premium Heavyweight Drop-Shoulder Tee',
      'Oversized Fleece Lounge Jogger Set',
      'Chic Knit Oversized Pullover Sweater',
      'Urban Distressed Slouchy Cardigan'
    ],
    descriptions: [
      'Relaxed sherd-check flannel shirt jacket featuring extra wide pockets and loose dropped sleeves.',
      'Luxuriously heavy 280 GSM cotton drop-shoulder tee. Ultra-relaxed contemporary urban drape.',
      'Perfect luxury loungewear. High-density loose jogger pants paired with matching oversized crewneck.',
      'Chunky-knit oversized sweater featuring high-quality acrylic wool blend and drop sleeves.',
      'Unisex slouchy cardigan with bold distressing and retro tortoiseshell structural buttons.'
    ],
    basePrice: 1500,
    priceRange: 1300,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Oatmeal Melange', 'Forest Green', 'Chocolate Brown', 'Vintage Beige', 'Washed Black']
  },
  {
    key: 'streetwear',
    categoryName: 'Streetwear',
    titles: [
      'High-Street Tactical Cargo Joggers',
      'Cyberpunk Graphic Reflective Parka',
      'Retro Patchwork Varsity Bomber Jacket',
      'Cyber-Sling Urban Tactical Vest',
      'Washed Canvas Distressed Skate Pants'
    ],
    descriptions: [
      'Tactical pocket joggers with heavy strap loops, dynamic adjustments, and reinforced cuffs.',
      'Futuristic streetwear parka featuring water-resistant shell and high-visibility reflective graphic art.',
      'Retro varsity bomber jacket with genuine leather-feel sleeves and premium chenille embroidery patches.',
      'Urban utility techwear vest with multiple tactical modular pockets and quick-release strap buckles.',
      'Durable heavyweight washed canvas skate pants featuring custom knee panel distressing.'
    ],
    basePrice: 2200,
    priceRange: 2000,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Cyber Black', 'Military Olive', 'Tech Grey', 'Safety Orange', 'Washed Denim']
  }
];

const generateProductsForShop = (shop, seller, categoryMap) => {
  const products = [];

  // Generate 10 products for the shop, cycling through templates
  for (let i = 0; i < 10; i++) {
    const template = PRODUCT_TEMPLATES[i % PRODUCT_TEMPLATES.length];
    
    // Resolve correct Mongoose ObjectId for category
    const categoryId = categoryMap[template.categoryName];

    // Pick random title and description from template
    const tIndex = Math.floor(Math.random() * template.titles.length);
    const title = `${template.titles[tIndex]} - ${shop.name}`;
    const description = template.descriptions[tIndex];

    // Calculate price & discount price
    const originalPrice = Math.floor(template.basePrice + Math.random() * template.priceRange);
    const hasDiscount = Math.random() > 0.4;
    const discountPrice = hasDiscount 
      ? Math.floor(originalPrice * (0.6 + Math.random() * 0.3)) // 10% to 40% discount!
      : undefined;

    // Random flags
    const isFeatured = Math.random() > 0.7;
    const isTrending = Math.random() > 0.7;

    // Get seeded Unsplash images
    const images = getProductImagesByCategory(template.key);

    products.push({
      name: title,
      description,
      price: originalPrice,
      discountPrice: discountPrice,
      category: categoryId,
      shop: shop._id,
      addedBy: seller._id,
      images,
      sizes: template.sizes,
      colors: template.colors.slice(0, 3), // select 3 random colors
      stock: Math.floor(10 + Math.random() * 90),
      isFeatured,
      isTrending,
      isActive: true,
      rating: Number((3.8 + Math.random() * 1.2).toFixed(1)), // realistic ratings 3.8 to 5.0
      reviewCount: Math.floor(Math.random() * 48)
    });
  }

  return products;
};

module.exports = {
  PRODUCT_TEMPLATES,
  generateProductsForShop
};
