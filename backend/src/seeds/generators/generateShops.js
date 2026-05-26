/**
 * generateShops.js
 * Generates 20 high-end fashion boutiques localized around a specific base center coordinate.
 */

const { getRandomBoutiqueCover, getRandomBoutiqueLogo } = require('./generateImages');
const { generateCoordinatesInRadius } = require('./generateGeoData');

const BOUTIQUE_NAMES = [
  'Ethnic Essence',
  'Retro Threads',
  'Saree Sangam',
  'Urban Vogue Closet',
  'Label Priyam',
  'Kora Silk Studio',
  'Royal Drapes Bridal',
  'Street Spark Couture',
  'Neon Kicks & Apparel',
  'Kiddie Kouture',
  'Classic Cuts Formalwear',
  'Loom & Craft Weaves',
  'Kolkata Karigari',
  'Siliguri Threads',
  'Thread & Needle Studio',
  'Glamour Galore',
  'The Silk Route',
  'Monsoon Magic',
  'Elite Weaves Boutique',
  'Vogue Aura'
];

const SHOP_CATEGORIES = [
  'Ethnic Wear',
  'Streetwear',
  'Sarees & Lehengas',
  'Fusion Wear',
  'Designer Kurtis',
  'Sustainable & Handloom',
  'Men\'s Formals',
  'Casuals & Oversized',
  'Kids Fashion',
  'Luxury Pret'
];

const STREET_ADDRESSES = [
  'Sevoke Road, Near City Centre Mall',
  'Hill Cart Road, Opp. Hotel Plaza',
  'Bidhan Road, Shop No. 12',
  'Khalpara Market, Gali No. 4',
  'Ashrampara, Block B',
  'Hakimpara Crossing, Shop No. 9',
  'Pradhan Nagar, Near Junction Station',
  'Punjabi Para, Gurudwara Road',
  'Salugara Bazaar, Opp. Vega Circle Mall',
  'Subhash Pally, Gali 2',
  'Burdwan Road, Near Flyover Crossing',
  'Gurung Bastie Road',
  'College Para, Near Siliguri College',
  'Deshbandhu Para Main Road',
  'Khalpara Wholesale Hub',
  'Mahananda Para By-Lane',
  'Janta Nagar Crossing',
  'Pranami Mandir Road',
  'Sevoke Road, 2nd Mile Crossing',
  'Hill Cart Road, Mahananda Bridge Side'
];

const DESCRIPTIONS = [
  'Experience handcrafted elegance with our exclusive handloom silk collection and artisanal bridal drapes.',
  'Your ultimate destination for oversized tees, premium graphic hoodies, and luxury streetwear essentials.',
  'Timeless Benarasis, Kanjeevarams, and lightweight designer organza sarees curated for your special moments.',
  'Premium modern fashion showcasing minimal silhouettes, urban daily wear, and curated coordinates.',
  'High-fashion designer kurtis, chic block-print tunics, and sustainable linen suits for modern women.',
  'Finest raw silks, organic cottons, and beautifully handwoven linens direct from native Indian karigars.',
  'Magnificent wedding lehengas, royal drapes, and designer bridal couture tailored to perfection.',
  'Bold styles, streetwear aesthetic, neon graphics, and exclusive limited-edition drops.',
  'Hype sneakers, oversized streetwear, dynamic graphics, and modern-tech premium lifestyle gear.',
  'Adorable luxury kids fashion, pure cotton play-sets, and beautiful designer ethnic outfits for kids.',
  'Elite Italian-cut bespoke suits, formal shirts, structured trousers, and premium business styling.',
  'Traditional weaves blending native heritage crafts with contemporary styles for the conscious shopper.',
  'Authentic handlooms, fine dhakai jamdanis, and traditional kantha-stitch premium sarees from Bengal.',
  'Locally designed modern fashion, daily utility kurtas, and custom boutique tailoring services.',
  'Specialist boutique offering elite custom tailoring, custom embroidery, and high-end bespoke garments.',
  'Shimmering evening gowns, cocktail dresses, statement jewelry, and red-carpet glam wear.',
  'An exotic collection of rich block-printed kurtis, handloom stoles, and fusion accessories.',
  'Chic cotton daily wear, floral kurtis, light organzas, and breezy summer styles.',
  'Curated workspace offering luxurious pure silk sarees, block prints, and handcrafted kurtas.',
  'The premier fashion house for elegant, minimal, and sophisticated premium western wear.'
];

const generateShops = (sellers, baseLocation) => {
  const { city, state, pincode, latitude, longitude } = baseLocation;

  return BOUTIQUE_NAMES.map((name, index) => {
    const owner = sellers[index]._id;
    const { lat, lng } = generateCoordinatesInRadius(latitude, longitude);

    // Random opening/closing times
    const openingTime = '10:00 AM';
    const closingTime = index % 2 === 0 ? '08:30 PM' : '09:00 PM';
    const shopCategory = SHOP_CATEGORIES[index % SHOP_CATEGORIES.length];
    
    // Generate valid Indian phone number
    const randomSuffix = Math.floor(10000000 + Math.random() * 90000000);
    const whatsappNumber = `+919${randomSuffix}`;

    return {
      name,
      description: DESCRIPTIONS[index],
      shopNo: `Shop-${100 + index}`,
      owner,
      whatsappNumber,
      address: STREET_ADDRESSES[index],
      city: city.toLowerCase(),
      state,
      pincode: pincode,
      logo: getRandomBoutiqueLogo(),
      coverImage: getRandomBoutiqueCover(),
      status: 'approved',
      category: shopCategory,
      openingTime,
      closingTime,
      isActive: true,
      serviceRadiusKm: index % 3 === 0 ? 15 : index % 3 === 1 ? 12 : 10,
      location: {
        type: 'Point',
        coordinates: [lng, lat] // GeoJSON standard order: [lng, lat]
      },
      formattedAddress: `${STREET_ADDRESSES[index]}, ${city}, ${state} - ${pincode}`
    };
  });
};

module.exports = generateShops;
