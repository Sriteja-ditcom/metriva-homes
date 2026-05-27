import { PrismaClient, PropertyType, ListingType, PropertyStatus, FurnishingStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function toSlug(text: string, suffix = '') {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + (suffix ? `-${suffix}` : '');
}

async function main() {
  console.log('Seeding database...');

  // --- Users ---
  const adminPwd = await bcrypt.hash('Admin@1234', 10);
  const sellerPwd = await bcrypt.hash('Seller@1234', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@metrivahomes.com' },
    update: {},
    create: {
      email: 'admin@metrivahomes.com',
      phone: '+919999900000',
      passwordHash: adminPwd,
      firstName: 'Metriva',
      lastName: 'Admin',
      role: 'ADMIN',
      status: 'ACTIVE',
      isEmailVerified: true,
      isPhoneVerified: true,
    },
  });

  const seller = await prisma.user.upsert({
    where: { email: 'seller@example.com' },
    update: {},
    create: {
      email: 'seller@example.com',
      phone: '+919876543210',
      passwordHash: sellerPwd,
      firstName: 'Rahul',
      lastName: 'Sharma',
      role: 'SELLER',
      status: 'ACTIVE',
      isEmailVerified: true,
      isPhoneVerified: true,
    },
  });

  const seller2 = await prisma.user.upsert({
    where: { email: 'priya.verma@example.com' },
    update: {},
    create: {
      email: 'priya.verma@example.com',
      phone: '+919876500001',
      passwordHash: sellerPwd,
      firstName: 'Priya',
      lastName: 'Verma',
      role: 'SELLER',
      status: 'ACTIVE',
      isEmailVerified: true,
      isPhoneVerified: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'buyer@example.com' },
    update: {},
    create: {
      email: 'buyer@example.com',
      phone: '+918765432109',
      passwordHash: sellerPwd,
      firstName: 'Anjali',
      lastName: 'Singh',
      role: 'BUYER',
      status: 'ACTIVE',
      isEmailVerified: true,
      isPhoneVerified: true,
    },
  });

  console.log('Users seeded');

  // --- Localities ---
  const localityData = [
    { name: 'Bandra West', city: 'Mumbai', state: 'Maharashtra', pincode: '400050', lat: 19.0596, lng: 72.8295, slug: 'bandra-west-mumbai', avgBuyPrice: 35000, avgRentPrice: 75000, popularityScore: 95 },
    { name: 'Whitefield', city: 'Bangalore', state: 'Karnataka', pincode: '560066', lat: 12.9698, lng: 77.7499, slug: 'whitefield-bangalore', avgBuyPrice: 9000, avgRentPrice: 28000, popularityScore: 90 },
    { name: 'Gurgaon Sector 29', city: 'Gurgaon', state: 'Haryana', pincode: '122002', lat: 28.4595, lng: 77.0266, slug: 'sector-29-gurgaon', avgBuyPrice: 12000, avgRentPrice: 35000, popularityScore: 88 },
    { name: 'Banjara Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500034', lat: 17.4156, lng: 78.4347, slug: 'banjara-hills-hyderabad', avgBuyPrice: 8500, avgRentPrice: 22000, popularityScore: 85 },
    { name: 'Anna Nagar', city: 'Chennai', state: 'Tamil Nadu', pincode: '600040', lat: 13.0850, lng: 80.2101, slug: 'anna-nagar-chennai', avgBuyPrice: 11000, avgRentPrice: 25000, popularityScore: 82 },
    { name: 'Kalyani Nagar', city: 'Pune', state: 'Maharashtra', pincode: '411006', lat: 18.5461, lng: 73.9014, slug: 'kalyani-nagar-pune', avgBuyPrice: 8000, avgRentPrice: 20000, popularityScore: 80 },
    { name: 'New Town Rajarhat', city: 'Kolkata', state: 'West Bengal', pincode: '700156', lat: 22.5958, lng: 88.4870, slug: 'new-town-kolkata', avgBuyPrice: 5500, avgRentPrice: 14000, popularityScore: 75 },
    { name: 'Gomti Nagar', city: 'Lucknow', state: 'Uttar Pradesh', pincode: '226010', lat: 26.8650, lng: 80.9936, slug: 'gomti-nagar-lucknow', avgBuyPrice: 4500, avgRentPrice: 12000, popularityScore: 70 },
  ];

  const localities: Record<string, string> = {};
  for (const loc of localityData) {
    const l = await prisma.locality.upsert({
      where: { name_city_state: { name: loc.name, city: loc.city, state: loc.state } },
      update: {},
      create: {
        ...loc,
        country: 'India',
        aiInsights: `${loc.name} is a prime ${loc.city} location with excellent connectivity and high demand.`,
        connectivity: { hasMetro: true, hasHighway: true, hasRailway: false, nearestAirportKm: 18 },
        amenities: { schools: 12, hospitals: 8, malls: 4, parks: 6, restaurants: 45 },
      },
    });
    localities[`${loc.name}-${loc.city}`] = l.id;
  }

  console.log('Localities seeded');

  // --- Properties ---
  type PropData = {
    title: string;
    description: string;
    type: PropertyType;
    listingType: ListingType;
    address: string;
    locality: string;
    city: string;
    state: string;
    pincode: string;
    lat: number;
    lng: number;
    bedrooms?: number;
    bathrooms?: number;
    builtUpArea?: number;
    furnishing?: FurnishingStatus;
    price: bigint;
    ownerId: string;
    localityKey: string;
    amenities: string[];
    isFeatured: boolean;
    aiTrustScore: number;
    images: string[];
  };

  const properties: PropData[] = [
    // Mumbai
    {
      title: '3 BHK Sea-Facing Apartment in Bandra West',
      description: 'Stunning sea-facing apartment with panoramic views of the Arabian Sea. Premium finishes throughout with modular kitchen, Italian marble flooring, and private balcony. Walking distance to Bandra Bandstand and Carter Road.',
      type: 'APARTMENT', listingType: 'BUY',
      address: 'Sea View Heights, Hill Road, Bandra West', locality: 'Bandra West', city: 'Mumbai', state: 'Maharashtra', pincode: '400050',
      lat: 19.0596, lng: 72.8295, bedrooms: 3, bathrooms: 3, builtUpArea: 1650, furnishing: 'SEMI_FURNISHED',
      price: BigInt(45000000), ownerId: seller.id, localityKey: 'Bandra West-Mumbai',
      amenities: ['Gym', 'Swimming Pool', 'Security', 'Parking', 'Clubhouse', 'Power Backup'],
      isFeatured: true, aiTrustScore: 92,
      images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
    },
    {
      title: '2 BHK Modern Flat in Bandra West',
      description: 'Well-maintained 2 BHK apartment in a gated society. Recently renovated with new flooring and kitchen. Great neighborhood with easy access to schools, hospitals and shopping.',
      type: 'APARTMENT', listingType: 'RENT',
      address: 'Green Valley Apartments, Linking Road, Bandra West', locality: 'Bandra West', city: 'Mumbai', state: 'Maharashtra', pincode: '400050',
      lat: 19.0601, lng: 72.8310, bedrooms: 2, bathrooms: 2, builtUpArea: 950, furnishing: 'FULLY_FURNISHED',
      price: BigInt(75000), ownerId: seller2.id, localityKey: 'Bandra West-Mumbai',
      amenities: ['Security', 'Parking', 'Lift', 'Power Backup', 'Water Supply'],
      isFeatured: true, aiTrustScore: 88,
      images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'],
    },
    {
      title: '5 BHK Ultra-Luxury Penthouse - Bandra',
      description: 'One-of-a-kind ultra-luxury penthouse spanning the entire top floor. Private infinity pool, home cinema, wine cellar, and staff quarters. Unobstructed sea view from every room. Rare opportunity.',
      type: 'APARTMENT', listingType: 'BUY',
      address: 'Rustomjee Crown, Pali Hill, Bandra West', locality: 'Bandra West', city: 'Mumbai', state: 'Maharashtra', pincode: '400050',
      lat: 19.0580, lng: 72.8270, bedrooms: 5, bathrooms: 6, builtUpArea: 7500, furnishing: 'FULLY_FURNISHED',
      price: BigInt(280000000), ownerId: seller2.id, localityKey: 'Bandra West-Mumbai',
      amenities: ['Private Pool', 'Home Cinema', 'Wine Cellar', 'Staff Quarters', 'Smart Home', 'Concierge'],
      isFeatured: true, aiTrustScore: 99,
      images: ['https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800', 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800'],
    },
    // Bangalore
    {
      title: '3 BHK Premium Villa in Whitefield',
      description: 'Luxurious independent villa in a gated community with private garden and terrace. Spacious rooms with large windows, premium fittings, and attached servant quarters. Close to ITPL and Mindspace tech parks.',
      type: 'VILLA', listingType: 'BUY',
      address: 'Palm Grove Villas, Whitefield Main Road', locality: 'Whitefield', city: 'Bangalore', state: 'Karnataka', pincode: '560066',
      lat: 12.9698, lng: 77.7499, bedrooms: 4, bathrooms: 4, builtUpArea: 2800, furnishing: 'UNFURNISHED',
      price: BigInt(18500000), ownerId: seller.id, localityKey: 'Whitefield-Bangalore',
      amenities: ['Private Garden', 'Club House', 'Swimming Pool', 'Tennis Court', 'Gym', 'Security'],
      isFeatured: true, aiTrustScore: 95,
      images: ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'],
    },
    {
      title: 'Studio Apartment for Rent - Whitefield IT Hub',
      description: 'Fully furnished studio apartment perfect for working professionals. Walking distance to major tech parks. All utilities included. High-speed WiFi, fully equipped kitchen.',
      type: 'APARTMENT', listingType: 'RENT',
      address: 'Tech Park Residency, ITPL Road, Whitefield', locality: 'Whitefield', city: 'Bangalore', state: 'Karnataka', pincode: '560066',
      lat: 12.9720, lng: 77.7510, bedrooms: 1, bathrooms: 1, builtUpArea: 450, furnishing: 'FULLY_FURNISHED',
      price: BigInt(18000), ownerId: seller2.id, localityKey: 'Whitefield-Bangalore',
      amenities: ['WiFi', 'AC', 'Parking', 'Security', 'Power Backup'],
      isFeatured: false, aiTrustScore: 85,
      images: ['https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800'],
    },
    {
      title: '2 BHK Apartment Near Whitefield Metro',
      description: 'Brand new 2 BHK in a recently completed tower. Spacious balcony with city view. RERA registered project with all approvals in place.',
      type: 'APARTMENT', listingType: 'BUY',
      address: 'Prestige Sunrise, Varthur Road, Whitefield', locality: 'Whitefield', city: 'Bangalore', state: 'Karnataka', pincode: '560066',
      lat: 12.9685, lng: 77.7480, bedrooms: 2, bathrooms: 2, builtUpArea: 1100, furnishing: 'UNFURNISHED',
      price: BigInt(9200000), ownerId: seller.id, localityKey: 'Whitefield-Bangalore',
      amenities: ['Gym', 'Jogging Track', 'Children Play Area', 'Security', 'Parking'],
      isFeatured: false, aiTrustScore: 90,
      images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800'],
    },
    {
      title: 'Co-working Office Space - Whitefield',
      description: 'Modern co-working space with 30 dedicated desks, 2 conference rooms and a cafeteria. High-speed internet, 24/7 access. Ideal for startups and SMEs.',
      type: 'OFFICE', listingType: 'COMMERCIAL',
      address: 'Salarpuria Tech Park, EPIP Zone, Whitefield', locality: 'Whitefield', city: 'Bangalore', state: 'Karnataka', pincode: '560066',
      lat: 12.9705, lng: 77.7505, builtUpArea: 2200, furnishing: 'FULLY_FURNISHED',
      price: BigInt(180000), ownerId: seller2.id, localityKey: 'Whitefield-Bangalore',
      amenities: ['High Speed Internet', '24/7 Access', 'Conference Rooms', 'Cafeteria', 'Power Backup', 'Parking'],
      isFeatured: false, aiTrustScore: 89,
      images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'],
    },
    // Gurgaon
    {
      title: '4 BHK Luxury Penthouse in Gurgaon',
      description: 'Exclusive penthouse with 360-degree city views. Spread across two floors with private terrace, home theatre, and modular kitchen. Walking distance to Leisure Valley Park.',
      type: 'APARTMENT', listingType: 'BUY',
      address: 'DLF The Crest, Golf Course Road, Sector 54', locality: 'Gurgaon Sector 29', city: 'Gurgaon', state: 'Haryana', pincode: '122002',
      lat: 28.4595, lng: 77.0266, bedrooms: 4, bathrooms: 5, builtUpArea: 4200, furnishing: 'SEMI_FURNISHED',
      price: BigInt(75000000), ownerId: seller2.id, localityKey: 'Gurgaon Sector 29-Gurgaon',
      amenities: ['Private Pool', 'Home Theatre', 'Gym', 'Concierge', '3 Car Parking', 'Smart Home'],
      isFeatured: true, aiTrustScore: 97,
      images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'],
    },
    {
      title: 'Grade-A Office Space - Gurgaon Sector 29',
      description: 'Fully fitted commercial office space in prime Gurgaon location. Meeting rooms, reception area. Ideal for 40-60 person team. Close to Huda City Centre Metro.',
      type: 'OFFICE', listingType: 'COMMERCIAL',
      address: 'Suncity Business Tower, MG Road, Sector 25', locality: 'Gurgaon Sector 29', city: 'Gurgaon', state: 'Haryana', pincode: '122002',
      lat: 28.4600, lng: 77.0280, furnishing: 'FULLY_FURNISHED', builtUpArea: 3500,
      price: BigInt(280000), ownerId: seller.id, localityKey: 'Gurgaon Sector 29-Gurgaon',
      amenities: ['24/7 AC', 'Power Backup', 'Parking', 'Cafeteria', 'Conference Hall', 'Security'],
      isFeatured: false, aiTrustScore: 91,
      images: ['https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800'],
    },
    {
      title: 'Warehouse Space for Lease - Gurgaon',
      description: 'Large industrial warehouse with loading docks, high ceiling clearance and CCTV surveillance. Suitable for e-commerce, manufacturing or cold storage.',
      type: 'WAREHOUSE', listingType: 'COMMERCIAL',
      address: 'IMT Manesar, NH-48, Sector 5', locality: 'Gurgaon Sector 29', city: 'Gurgaon', state: 'Haryana', pincode: '122002',
      lat: 28.4570, lng: 77.0240, builtUpArea: 12000, furnishing: 'UNFURNISHED',
      price: BigInt(350000), ownerId: seller.id, localityKey: 'Gurgaon Sector 29-Gurgaon',
      amenities: ['Loading Docks', 'CCTV', '24/7 Security', 'Power 3-Phase', 'Highway Access'],
      isFeatured: false, aiTrustScore: 86,
      images: ['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800'],
    },
    // Hyderabad
    {
      title: '3 BHK Apartment in Banjara Hills',
      description: 'Elegant apartment in the heart of Banjara Hills. Premium residential complex with world-class amenities. Close to Jubilee Hills, top schools, hospitals and malls.',
      type: 'APARTMENT', listingType: 'BUY',
      address: 'My Home Jewel, Road No 12, Banjara Hills', locality: 'Banjara Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500034',
      lat: 17.4156, lng: 78.4347, bedrooms: 3, bathrooms: 3, builtUpArea: 1850, furnishing: 'SEMI_FURNISHED',
      price: BigInt(16500000), ownerId: seller2.id, localityKey: 'Banjara Hills-Hyderabad',
      amenities: ['Swimming Pool', 'Gym', 'Clubhouse', 'Security', 'Power Backup', 'Intercom'],
      isFeatured: true, aiTrustScore: 89,
      images: ['https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800', 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800'],
    },
    {
      title: '2 BHK Furnished Flat for Rent - Banjara Hills',
      description: 'Well-furnished 2 BHK in a quiet gated society. Features include modular kitchen, wardrobes, and attached bathrooms. Zero brokerage. Direct owner listing.',
      type: 'APARTMENT', listingType: 'RENT',
      address: 'Classic Residency, Road No 1, Banjara Hills', locality: 'Banjara Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500034',
      lat: 17.4160, lng: 78.4360, bedrooms: 2, bathrooms: 2, builtUpArea: 1050, furnishing: 'FULLY_FURNISHED',
      price: BigInt(28000), ownerId: seller.id, localityKey: 'Banjara Hills-Hyderabad',
      amenities: ['Security', 'Power Backup', 'Parking', 'Lift', 'Water Supply'],
      isFeatured: false, aiTrustScore: 87,
      images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800'],
    },
    {
      title: 'Residential Plot 300 sq yards - Banjara Hills',
      description: 'Prime residential plot in a gated layout with clear title. Suitable for building independent villa or duplex. All approvals in place. Immediate sale.',
      type: 'PLOT', listingType: 'BUY',
      address: 'Green Meadows Layout, Road No 8, Banjara Hills', locality: 'Banjara Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500034',
      lat: 17.4165, lng: 78.4340, builtUpArea: 2700,
      price: BigInt(22000000), ownerId: seller2.id, localityKey: 'Banjara Hills-Hyderabad',
      amenities: ['Clear Title', 'Water Connection', 'Electricity', 'Gated Layout'],
      isFeatured: false, aiTrustScore: 93,
      images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'],
    },
    {
      title: 'Farmhouse on 2 Acres - Hyderabad Outskirts',
      description: 'Serene farmhouse with 2 acres of landscaped land. Features fruit orchards, fish pond, and traditional architecture. Weekend retreat or permanent residence.',
      type: 'FARMHOUSE', listingType: 'BUY',
      address: 'Shankarpally Road, Chevella, Rangareddy', locality: 'Banjara Hills', city: 'Hyderabad', state: 'Telangana', pincode: '501503',
      lat: 17.3800, lng: 78.2100, bedrooms: 3, bathrooms: 3, builtUpArea: 3500, furnishing: 'SEMI_FURNISHED',
      price: BigInt(35000000), ownerId: seller.id, localityKey: 'Banjara Hills-Hyderabad',
      amenities: ['2 Acres Land', 'Fish Pond', 'Fruit Orchard', 'Solar Power', 'Borewell', 'Boundary Wall'],
      isFeatured: true, aiTrustScore: 88,
      images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'],
    },
    // Chennai
    {
      title: '3 BHK House with Garden - Anna Nagar',
      description: 'Independent house with large private garden in Anna Nagar. Ground + 1 floor structure with covered car parking. Close to Apollo Hospital and top schools.',
      type: 'HOUSE', listingType: 'BUY',
      address: '14th Avenue, Anna Nagar West', locality: 'Anna Nagar', city: 'Chennai', state: 'Tamil Nadu', pincode: '600040',
      lat: 13.0850, lng: 80.2101, bedrooms: 3, bathrooms: 3, builtUpArea: 2200, furnishing: 'UNFURNISHED',
      price: BigInt(22000000), ownerId: seller.id, localityKey: 'Anna Nagar-Chennai',
      amenities: ['Private Garden', 'Car Parking', 'Terrace', 'Water Tank', 'Generator'],
      isFeatured: true, aiTrustScore: 90,
      images: ['https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800', 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800'],
    },
    {
      title: '1 BHK Flat for Rent - Anna Nagar',
      description: 'Affordable 1 BHK in a well-maintained apartment complex. Semi-furnished with bed and kitchen appliances. Working professionals and small families preferred.',
      type: 'APARTMENT', listingType: 'RENT',
      address: 'Srinivasa Apartments, Anna Nagar East', locality: 'Anna Nagar', city: 'Chennai', state: 'Tamil Nadu', pincode: '600040',
      lat: 13.0860, lng: 80.2115, bedrooms: 1, bathrooms: 1, builtUpArea: 550, furnishing: 'SEMI_FURNISHED',
      price: BigInt(12000), ownerId: seller2.id, localityKey: 'Anna Nagar-Chennai',
      amenities: ['Security', 'Water Supply', 'Lift', 'Power Backup'],
      isFeatured: false, aiTrustScore: 82,
      images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
    },
    {
      title: '1 BHK Budget Flat - Anna Nagar',
      description: 'Budget-friendly 1 BHK in a safe locality. Walking distance to bus stop and local market. Water and maintenance included in rent.',
      type: 'APARTMENT', listingType: 'RENT',
      address: 'Sai Krupa Flats, 3rd Street, Anna Nagar East', locality: 'Anna Nagar', city: 'Chennai', state: 'Tamil Nadu', pincode: '600040',
      lat: 13.0840, lng: 80.2095, bedrooms: 1, bathrooms: 1, builtUpArea: 480, furnishing: 'UNFURNISHED',
      price: BigInt(8500), ownerId: seller2.id, localityKey: 'Anna Nagar-Chennai',
      amenities: ['Water Included', 'Security', 'Bus Stop Nearby'],
      isFeatured: false, aiTrustScore: 76,
      images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800'],
    },
    // Pune
    {
      title: '2 BHK River View - Kalyani Nagar Pune',
      description: 'Beautiful 2 BHK apartment with Mula River view. Bright and airy with premium flooring. Close to Koregaon Park restaurants. 15 min from Pune airport.',
      type: 'APARTMENT', listingType: 'BUY',
      address: 'Amanora Park Town, Kalyani Nagar', locality: 'Kalyani Nagar', city: 'Pune', state: 'Maharashtra', pincode: '411006',
      lat: 18.5461, lng: 73.9014, bedrooms: 2, bathrooms: 2, builtUpArea: 1000, furnishing: 'SEMI_FURNISHED',
      price: BigInt(9500000), ownerId: seller.id, localityKey: 'Kalyani Nagar-Pune',
      amenities: ['Swimming Pool', 'Gym', 'Club House', 'Security', 'Parking', 'Garden'],
      isFeatured: true, aiTrustScore: 88,
      images: ['https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=800', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'],
    },
    {
      title: '3 BHK Furnished Flat for Rent - Kalyani Nagar',
      description: 'Tastefully furnished 3 BHK in a high-rise tower. All premium appliances, designer furniture, A/C in all rooms. Available immediately.',
      type: 'APARTMENT', listingType: 'RENT',
      address: 'The Address, North Main Road, Koregaon Park', locality: 'Kalyani Nagar', city: 'Pune', state: 'Maharashtra', pincode: '411006',
      lat: 18.5478, lng: 73.9025, bedrooms: 3, bathrooms: 3, builtUpArea: 1600, furnishing: 'FULLY_FURNISHED',
      price: BigInt(45000), ownerId: seller2.id, localityKey: 'Kalyani Nagar-Pune',
      amenities: ['Gym', 'Swimming Pool', 'Club House', 'Security', '2 Parking', 'Power Backup'],
      isFeatured: false, aiTrustScore: 86,
      images: ['https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800'],
    },
    {
      title: 'Prime Retail Shop - Kalyani Nagar',
      description: 'Ground floor corner shop on main road with high footfall. Excellent visibility. Suitable for restaurant, pharmacy, salon or retail business.',
      type: 'SHOP', listingType: 'COMMERCIAL',
      address: 'Main Road, Kalyani Nagar', locality: 'Kalyani Nagar', city: 'Pune', state: 'Maharashtra', pincode: '411006',
      lat: 18.5440, lng: 73.9000, builtUpArea: 600, furnishing: 'UNFURNISHED',
      price: BigInt(95000), ownerId: seller.id, localityKey: 'Kalyani Nagar-Pune',
      amenities: ['High Footfall', 'Main Road Facing', 'Power Connection', 'Washroom'],
      isFeatured: false, aiTrustScore: 84,
      images: ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800'],
    },
    {
      title: '3 BHK New Launch - Godrej Kalyani Nagar',
      description: 'New launch project from a reputed builder. RERA registered. Pre-launch price with flexible payment plan. 15% appreciation expected in 2 years.',
      type: 'APARTMENT', listingType: 'BUY',
      address: 'Godrej Nurture, Nagar Road, Kalyani Nagar', locality: 'Kalyani Nagar', city: 'Pune', state: 'Maharashtra', pincode: '411006',
      lat: 18.5490, lng: 73.9030, bedrooms: 3, bathrooms: 3, builtUpArea: 1450, furnishing: 'UNFURNISHED',
      price: BigInt(12500000), ownerId: seller.id, localityKey: 'Kalyani Nagar-Pune',
      amenities: ['Sky Garden', 'Swimming Pool', 'Gym', 'Co-working Space', 'EV Charging', 'Solar Power'],
      isFeatured: true, aiTrustScore: 94,
      images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'],
    },
    // Kolkata
    {
      title: '3 BHK Apartment in New Town Rajarhat',
      description: 'Modern apartment in the upcoming New Town area. Well-planned township with all amenities. Close to Eco Park, DLF IT Park, and upcoming Metro connectivity.',
      type: 'APARTMENT', listingType: 'BUY',
      address: 'Merlin Awas, Action Area 1, New Town', locality: 'New Town Rajarhat', city: 'Kolkata', state: 'West Bengal', pincode: '700156',
      lat: 22.5958, lng: 88.4870, bedrooms: 3, bathrooms: 2, builtUpArea: 1350, furnishing: 'UNFURNISHED',
      price: BigInt(7800000), ownerId: seller2.id, localityKey: 'New Town Rajarhat-Kolkata',
      amenities: ['Gym', 'Security', 'Parking', 'Power Backup', 'Children Play Area'],
      isFeatured: false, aiTrustScore: 83,
      images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'],
    },
    {
      title: '2 BHK Rent - New Town for IT Professionals',
      description: 'Comfortable 2 BHK near Sector V and Salt Lake. Semi-furnished with fans, wardrobes and geyser. Peaceful society with 24/7 security. Negotiable rent.',
      type: 'APARTMENT', listingType: 'RENT',
      address: 'Unimark Riviera, New Town', locality: 'New Town Rajarhat', city: 'Kolkata', state: 'West Bengal', pincode: '700156',
      lat: 22.5970, lng: 88.4880, bedrooms: 2, bathrooms: 2, builtUpArea: 900, furnishing: 'SEMI_FURNISHED',
      price: BigInt(16000), ownerId: seller.id, localityKey: 'New Town Rajarhat-Kolkata',
      amenities: ['Security', 'Parking', 'Lift', 'Water Supply', 'Power Backup'],
      isFeatured: false, aiTrustScore: 80,
      images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'],
    },
    // Lucknow
    {
      title: '4 BHK Duplex Villa - Gomti Nagar Lucknow',
      description: 'Spacious duplex villa in Gomti Nagar Extension. Ground + 1 floor with terrace. Well-maintained garden, covered parking for 2 cars. Close to Phoenix mall.',
      type: 'VILLA', listingType: 'BUY',
      address: 'Eldeco Encore, Vibhuti Khand, Gomti Nagar Extension', locality: 'Gomti Nagar', city: 'Lucknow', state: 'Uttar Pradesh', pincode: '226010',
      lat: 26.8650, lng: 80.9936, bedrooms: 4, bathrooms: 4, builtUpArea: 3200, furnishing: 'SEMI_FURNISHED',
      price: BigInt(18000000), ownerId: seller2.id, localityKey: 'Gomti Nagar-Lucknow',
      amenities: ['Garden', 'Terrace', '2 Car Parking', 'Security', 'Generator', 'Water Tank'],
      isFeatured: true, aiTrustScore: 91,
      images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800'],
    },
    {
      title: '2 BHK Flat for Rent - Gomti Nagar',
      description: 'Neat and clean 2 BHK in a well-maintained apartment. Preferred for government employees and families. Immediate availability.',
      type: 'APARTMENT', listingType: 'RENT',
      address: 'Shalimar Gold, Viram Khand, Gomti Nagar', locality: 'Gomti Nagar', city: 'Lucknow', state: 'Uttar Pradesh', pincode: '226010',
      lat: 26.8665, lng: 80.9950, bedrooms: 2, bathrooms: 2, builtUpArea: 1000, furnishing: 'SEMI_FURNISHED',
      price: BigInt(14000), ownerId: seller.id, localityKey: 'Gomti Nagar-Lucknow',
      amenities: ['Security', 'Parking', 'Power Backup', 'Lift', 'Water Supply'],
      isFeatured: false, aiTrustScore: 78,
      images: ['https://images.unsplash.com/photo-1486304873000-235643847519?w=800'],
    },
  ];

  let seeded = 0;
  for (const p of properties) {
    const { images, localityKey, aiTrustScore, ...rest } = p;
    const localityId = localities[localityKey];

    const existing = await prisma.property.findFirst({ where: { title: p.title } });
    if (existing) continue;

    const slug = toSlug(p.title, String(seeded + 1));

    await prisma.property.create({
      data: {
        ...rest,
        slug,
        localityId,
        status: 'ACTIVE' as PropertyStatus,
        isVerified: true,
        isOwnerVerified: true,
        isDuplicateFlag: false,
        isFraudFlag: false,
        aiTrustScore,
        aiSummary: `AI-verified with a trust score of ${aiTrustScore}/100. All documents checked and owner verified.`,
        views: Math.floor(Math.random() * 500) + 50,
        enquiries: Math.floor(Math.random() * 30) + 5,
        saves: Math.floor(Math.random() * 50) + 10,
        postedAt: new Date(),
        images: {
          create: images.map((url, i) => ({
            url,
            isPrimary: i === 0,
            order: i,
          })),
        },
        aiScore: {
          create: {
            trustScore: aiTrustScore,
            fraudRiskScore: Math.max(0, 100 - aiTrustScore - Math.floor(Math.random() * 5)),
            priceAccuracy: 85 + Math.floor(Math.random() * 15),
            contentQuality: 80 + Math.floor(Math.random() * 20),
            verificationScore: 85 + Math.floor(Math.random() * 15),
            isDuplicate: false,
            model: 'metriva-trust-v1',
            signals: {
              hasImages: images.length > 0,
              imageCount: images.length,
              descriptionLength: rest.description.length,
              hasDocuments: true,
              isOwnerVerified: true,
              priceDeviation: Math.random() * 0.1,
              duplicateScore: 0,
              contentQualityScore: 0.9,
              flags: [],
            },
          },
        },
      },
    });
    seeded++;
  }

  console.log(`Properties seeded: ${seeded} new properties`);
  console.log('\nSeed completed!');
  console.log('Demo credentials:');
  console.log('  Admin:  admin@metrivahomes.com / Admin@1234');
  console.log('  Seller: seller@example.com / Seller@1234');
  console.log('  Buyer:  buyer@example.com / Seller@1234');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
