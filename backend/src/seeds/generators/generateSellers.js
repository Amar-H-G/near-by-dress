/**
 * generateSellers.js
 * Generates 20 realistic Indian boutique owner accounts with unique credentials.
 */

const SELLER_NAMES = [
  'Amit Sharma',
  'Priya Sen',
  'Rohan Roy',
  'Vikram Banerjee',
  'Sneha Gupta',
  'Divya Patel',
  'Kavita Nair',
  'Rajesh Khandelwal',
  'Ankita Das',
  'Debolina Chowdhury',
  'Sandeep Verma',
  'Neha Agarwal',
  'Pooja Mishra',
  'Abhishek Saha',
  'Sourav Ghosh',
  'Joydeep Paul',
  'Trisha Sinha',
  'Priyanka Dey',
  'Manish Prasad',
  'Varun Bhatia'
];

const generateSellers = () => {
  return SELLER_NAMES.map((name, index) => {
    const slug = name.toLowerCase().replace(/[^a-z]/g, '');
    const email = `${slug}.${index + 1}@nearbydress.com`;
    const password = `DressNearby_${slug.substr(0, 4)}_${index + 10}`;
    
    // Generate valid Indian phone number
    const randomSuffix = Math.floor(10000000 + Math.random() * 90000000);
    const phone = `+919${randomSuffix}`;

    return {
      name,
      email,
      password,
      role: 'shop_owner',
      phone,
      isActive: true
    };
  });
};

module.exports = generateSellers;
