// ================================================
// Metriva Homes — Shared TypeScript Types
// Used by: apps/api, apps/web, apps/mobile
// ================================================

// ---- Enums ----

export type UserRole = 'BUYER' | 'SELLER' | 'BROKER' | 'BUILDER' | 'ADMIN';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';

export type PropertyType =
  | 'APARTMENT'
  | 'HOUSE'
  | 'VILLA'
  | 'PLOT'
  | 'COMMERCIAL'
  | 'OFFICE'
  | 'SHOP'
  | 'WAREHOUSE'
  | 'FARMHOUSE';

export type ListingType = 'BUY' | 'RENT' | 'COMMERCIAL';

export type PropertyStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'ACTIVE'
  | 'SOLD'
  | 'RENTED'
  | 'EXPIRED'
  | 'REJECTED'
  | 'SUSPENDED';

export type FurnishingStatus = 'UNFURNISHED' | 'SEMI_FURNISHED' | 'FULLY_FURNISHED';

export type SubscriptionPlan = 'FREE' | 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE';

export type FraudReportStatus = 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';

export type NotificationType =
  | 'PROPERTY_ALERT'
  | 'ENQUIRY'
  | 'PAYMENT'
  | 'SYSTEM'
  | 'FRAUD_UPDATE'
  | 'LISTING_APPROVED'
  | 'LISTING_REJECTED';

export type PaymentPurpose = 'FEATURED_LISTING' | 'SUBSCRIPTION' | 'BOOST';

export type PaymentStatus = 'PENDING' | 'CAPTURED' | 'FAILED' | 'REFUNDED';

// ---- Core Entities ----

export interface User {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  broker?: Broker;
  builder?: Builder;
  subscription?: Subscription;
}

export interface PublicUser {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  createdAt: string;
}

export interface Broker {
  id: string;
  userId: string;
  licenseNumber?: string;
  agencyName?: string;
  agencyLogo?: string;
  experience?: number;
  specializations: string[];
  localities: string[];
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  verifiedAt?: string;
  user?: PublicUser;
}

export interface Builder {
  id: string;
  userId: string;
  companyName: string;
  companyLogo?: string;
  reraNumber?: string;
  established?: number;
  totalProjects: number;
  rating: number;
  isVerified: boolean;
  verifiedAt?: string;
  user?: PublicUser;
}

export interface Property {
  id: string;
  ownerId: string;
  brokerId?: string;
  builderId?: string;
  projectId?: string;
  localityId?: string;
  title: string;
  description: string;
  type: PropertyType;
  listingType: ListingType;
  status: PropertyStatus;
  address: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  lat?: number;
  lng?: number;
  bedrooms?: number;
  bathrooms?: number;
  balconies?: number;
  floorNumber?: number;
  totalFloors?: number;
  builtUpArea?: number;
  carpetArea?: number;
  plotArea?: number;
  facing?: string;
  furnishing?: FurnishingStatus;
  parking?: number;
  price: number;
  pricePerSqft?: number;
  maintenanceCharge?: number;
  amenities: string[];
  nearbyPlaces?: NearbyPlaces;
  isVerified: boolean;
  isOwnerVerified: boolean;
  aiTrustScore?: number;
  aiSummary?: string;
  isDuplicateFlag: boolean;
  isFraudFlag: boolean;
  isFeatured: boolean;
  featuredTill?: string;
  views: number;
  enquiries: number;
  saves: number;
  postedAt: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  images: PropertyImage[];
  aiScore?: AiScore;
  owner?: PublicUser;
  broker?: Broker;
}

export interface PropertyImage {
  id: string;
  propertyId: string;
  url: string;
  caption?: string;
  isPrimary: boolean;
  order: number;
  createdAt: string;
}

export interface AiScore {
  id: string;
  propertyId: string;
  trustScore: number;
  fraudRiskScore: number;
  priceAccuracy?: number;
  contentQuality?: number;
  verificationScore?: number;
  signals: AiSignals;
  isDuplicate: boolean;
  duplicateOf?: string;
  model: string;
  createdAt: string;
  updatedAt: string;
}

export interface AiSignals {
  hasImages: boolean;
  imageCount: number;
  descriptionLength: number;
  hasDocuments: boolean;
  isOwnerVerified: boolean;
  priceDeviation: number;
  duplicateScore: number;
  contentQualityScore: number;
  flags: string[];
}

export interface Locality {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
  pincode?: string;
  avgBuyPrice?: number;
  avgRentPrice?: number;
  connectivity?: LocalityConnectivity;
  amenities?: LocalityAmenities;
  aiInsights?: string;
  popularityScore: number;
}

export interface LocalityConnectivity {
  hasMetro: boolean;
  hasHighway: boolean;
  hasRailway: boolean;
  nearestAirportKm?: number;
  nearestMetroKm?: number;
}

export interface LocalityAmenities {
  schools: number;
  hospitals: number;
  malls: number;
  parks: number;
  restaurants: number;
}

export interface NearbyPlaces {
  schools?: { name: string; distanceKm: number }[];
  hospitals?: { name: string; distanceKm: number }[];
  malls?: { name: string; distanceKm: number }[];
  metro?: { name: string; distanceKm: number }[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, string>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface FraudReport {
  id: string;
  reporterId: string;
  propertyId: string;
  reason: string;
  description?: string;
  evidence: string[];
  status: FraudReportStatus;
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: string;
  startDate: string;
  endDate?: string;
  features?: SubscriptionFeatures;
}

export interface SubscriptionFeatures {
  maxListings: number;
  featuredListings: number;
  prioritySupport: boolean;
  analytics: boolean;
  aiInsights: boolean;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: string;
  providerId?: string;
  purpose: PaymentPurpose;
  createdAt: string;
}

export interface SearchAlert {
  id: string;
  userId: string;
  name: string;
  filters: PropertySearchFilters;
  isActive: boolean;
  frequency: 'INSTANT' | 'DAILY' | 'WEEKLY';
  lastSentAt?: string;
  createdAt: string;
}

// ---- Request/Response Types ----

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  meta?: PaginationMeta;
  error?: ApiError;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, string[]>;
}

// ---- Search & Filter Types ----

export interface PropertySearchFilters {
  query?: string;
  city?: string;
  locality?: string;
  type?: PropertyType;
  listingType?: ListingType;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number[];
  bathrooms?: number;
  furnishing?: FurnishingStatus;
  minArea?: number;
  maxArea?: number;
  amenities?: string[];
  isVerified?: boolean;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'area_asc' | 'area_desc' | 'trust_score';
  page?: number;
  limit?: number;
}

export interface AuthTokens {
  accessToken: string;
  expiresIn: number;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}
