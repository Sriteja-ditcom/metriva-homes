import { PrismaClient, UserRole, ListingType, PropertyType, PropertyStatus, FurnishingStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Admin user ────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@metrivahomes.com' },
    update: {},
    create: {
      email: 'admin@metrivahomes.com',
      passwordHash: adminPassword,
      firstName: 'Metriva',
      lastName: 'Admin',
      role: UserRole.ADMIN,
      isEmailVerified: true,
      subscription: { create: { plan: 'ENTERPRISE' } },
    },
  });
  console.log('✅ Admin user:', admin.email);

  // ── Demo seller ───────────────────────────────────────────────────────────
  const sellerPassword = await bcrypt.hash('Seller@123', 12);
  const seller = await prisma.user.upsert({
    where: { email: 'seller@demo.com' },
    update: {},
    create: {
      email: 'seller@demo.com',
      passwordHash: sellerPassword,
      firstName: 'Ravi',
      lastName: 'Sharma',
      role: UserRole.SELLER,
      isEmailVerified: true,
      subscription: { create: { plan: 'PROFESSIONAL' } },
    },
  });
  console.log('✅ Demo seller:', seller.email);

  // ── Demo buyer ────────────────────────────────────────────────────────────
  const buyerPassword = await bcrypt.hash('Buyer@123', 12);
  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@demo.com' },
    update: {},
    create: {
      email: 'buyer@demo.com',
      passwordHash: buyerPassword,
      firstName: 'Priya',
      lastName: 'Patel',
      role: UserRole.BUYER,
      isEmailVerified: true,
      subscription: { create: { plan: 'FREE' } },
    },
  });
  console.log('✅ Demo buyer:', buyer.email);

  // ── Sample properties ─────────────────────────────────────────────────────
  const properties = [
    { title: '3 BHK Luxury Apartment in Bandra West', slug: '3-bhk-luxury-apartment-bandra-west-001', description: 'Stunning 3 bedroom apartment in the heart of Bandra West with panoramic sea views. The property features a modern kitchen, marble flooring, two covered parking spots, and access to a rooftop infinity pool. Located minutes from Linking Road and Carter Road.', price: 45000000n, city: 'Mumbai', state: 'Maharashtra', locality: 'Bandra West', address: '14A, Sea View Towers, Bandstand, Bandra West', pincode: '400050', listingType: ListingType.BUY, type: PropertyType.APARTMENT, bedrooms: 3, bathrooms: 3, builtUpArea: 1850, furnishing: FurnishingStatus.FULLY_FURNISHED, amenities: ['Swimming Pool', 'Gym', 'Parking', 'Security', 'Club House'], status: PropertyStatus.ACTIVE, isVerified: true, aiTrustScore: 88 },
    { title: '2 BHK Flat for Sale in Koramangala', slug: '2-bhk-flat-sale-koramangala-001', description: 'Well-maintained 2 bedroom flat in Koramangala 5th Block. Close to all tech parks, restaurants, and the HSR layout. The apartment has a modular kitchen, dedicated parking, 24/7 security and power backup. Perfect for young professionals or a small family.', price: 12500000n, city: 'Bangalore', state: 'Karnataka', locality: 'Koramangala', address: '28, 5th Block, Koramangala', pincode: '560034', listingType: ListingType.BUY, type: PropertyType.APARTMENT, bedrooms: 2, bathrooms: 2, builtUpArea: 1100, furnishing: FurnishingStatus.SEMI_FURNISHED, amenities: ['Parking', 'Security', 'Power Backup', 'Lift'], status: PropertyStatus.ACTIVE, isVerified: true, aiTrustScore: 76 },
    { title: '4 BHK Villa with Pool in Whitefield', slug: '4-bhk-villa-pool-whitefield-001', description: 'Exquisite 4 bedroom villa in a gated community in Whitefield. Features a private swimming pool, landscaped garden, home theatre, modular kitchen, and a 3-car garage. The villa is surrounded by lush greenery and offers privacy and luxury in equal measure.', price: 85000000n, city: 'Bangalore', state: 'Karnataka', locality: 'Whitefield', address: 'Villa 7, Palm Meadows, Whitefield', pincode: '560066', listingType: ListingType.BUY, type: PropertyType.VILLA, bedrooms: 4, bathrooms: 5, builtUpArea: 4200, furnishing: FurnishingStatus.FULLY_FURNISHED, amenities: ['Swimming Pool', 'Gym', 'Garden', 'Security', 'Club House', 'Parking'], status: PropertyStatus.ACTIVE, isVerified: true, aiTrustScore: 92 },
    { title: '1 BHK Apartment for Rent in Powai', slug: '1-bhk-apartment-rent-powai-001', description: 'Cozy 1 BHK apartment available for rent in Powai near Hiranandani. Fully furnished with air conditioning, washing machine, and high-speed internet. Walking distance to Hiranandani Hospital, Galleria Mall, and multiple bus stops.', price: 35000n, city: 'Mumbai', state: 'Maharashtra', locality: 'Powai', address: '302, Lake Breeze, Hiranandani Gardens, Powai', pincode: '400076', listingType: ListingType.RENT, type: PropertyType.APARTMENT, bedrooms: 1, bathrooms: 1, builtUpArea: 620, furnishing: FurnishingStatus.FULLY_FURNISHED, amenities: ['Parking', 'Security', 'Gym', 'Lift'], status: PropertyStatus.ACTIVE, isVerified: false, aiTrustScore: 71 },
    { title: 'Commercial Office Space in Cyber City Gurgaon', slug: 'commercial-office-space-cyber-city-gurgaon-001', description: 'Premium Grade A office space available in the heart of Cyber City, Gurgaon. Fully equipped with modern amenities including conference rooms, cafeteria, and 24/7 security. Excellent connectivity to the Delhi Metro and Rapid Metro.', price: 180000n, city: 'Gurgaon', state: 'Haryana', locality: 'Cyber City', address: 'Tower B, DLF Cyber City, Sector 24', pincode: '122002', listingType: ListingType.COMMERCIAL, type: PropertyType.OFFICE, bathrooms: 4, builtUpArea: 3500, furnishing: FurnishingStatus.FULLY_FURNISHED, amenities: ['Parking', 'Security', 'Power Backup', 'Conference Room', 'Cafeteria'], status: PropertyStatus.ACTIVE, isVerified: true, aiTrustScore: 84 },
  ];

  for (const prop of properties) {
    await prisma.property.upsert({
      where: { slug: prop.slug },
      update: {},
      create: {
        ...prop,
        ownerId: seller.id,
        aiSummary: `AI-generated summary: This ${prop.listingType === 'RENT' ? 'rental' : 'sale'} property in ${prop.locality}, ${prop.city} offers excellent value. ${prop.isVerified ? 'Verified listing with high trust score.' : 'Awaiting verification.'}`,
      },
    });
  }
  console.log(`✅ Seeded ${properties.length} sample properties`);

  // ── Localities ────────────────────────────────────────────────────────────
  const localities = [
    { name: 'Bandra West', slug: 'bandra-west-mumbai', city: 'Mumbai', state: 'Maharashtra', lat: 19.0596, lng: 72.8295, avgBuyPrice: 45000000n, avgRentPrice: 85000n },
    { name: 'Koramangala', slug: 'koramangala-bangalore', city: 'Bangalore', state: 'Karnataka', lat: 12.9352, lng: 77.6245, avgBuyPrice: 12000000n, avgRentPrice: 35000n },
    { name: 'Cyber City', slug: 'cyber-city-gurgaon', city: 'Gurgaon', state: 'Haryana', lat: 28.4953, lng: 77.0896, avgBuyPrice: 18000000n, avgRentPrice: 50000n },
    { name: 'Andheri West', slug: 'andheri-west-mumbai', city: 'Mumbai', state: 'Maharashtra', lat: 19.1196, lng: 72.8347, avgBuyPrice: 22000000n, avgRentPrice: 55000n },
    { name: 'Indiranagar', slug: 'indiranagar-bangalore', city: 'Bangalore', state: 'Karnataka', lat: 12.9719, lng: 77.6412, avgBuyPrice: 15000000n, avgRentPrice: 40000n },
  ];

  for (const loc of localities) {
    await prisma.locality.upsert({
      where: { name_city_state: { name: loc.name, city: loc.city, state: loc.state } },
      update: {},
      create: {
        ...loc,
        aiInsights: `${loc.name} is one of the most sought-after localities in ${loc.city}, known for its excellent connectivity, lifestyle amenities, and strong rental demand.`,
      },
    });
  }
  console.log(`✅ Seeded ${localities.length} localities`);

  console.log('\n🎉 Seed complete!\n');
  console.log('  Admin:  admin@metrivahomes.com / Admin@123');
  console.log('  Seller: seller@demo.com / Seller@123');
  console.log('  Buyer:  buyer@demo.com / Buyer@123\n');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
