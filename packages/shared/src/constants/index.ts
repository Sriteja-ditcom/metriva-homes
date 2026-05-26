// ================================================
// Metriva Homes — Shared Constants
// ================================================

export const APP_NAME = 'Metriva Homes';
export const APP_TAGLINE = "India's Trusted Real Estate Platform";
export const COMPANY_NAME = 'Metriva Technologies';

// ---- Trust Score Thresholds ----
export const TRUST_SCORE = {
  HIGH: 80,
  MEDIUM: 60,
  LOW: 40,
  CRITICAL: 0,
} as const;

export const TRUST_SCORE_LABELS = {
  HIGH: 'Highly Trusted',
  MEDIUM: 'Likely Legitimate',
  LOW: 'Needs Review',
  CRITICAL: 'High Risk',
} as const;

// ---- Property Limits ----
export const PROPERTY_LIMITS = {
  FREE: { listings: 1, images: 5, featuredDays: 0 },
  BASIC: { listings: 5, images: 10, featuredDays: 7 },
  PROFESSIONAL: { listings: 20, images: 20, featuredDays: 30 },
  ENTERPRISE: { listings: 100, images: 30, featuredDays: 90 },
} as const;

// ---- Pricing (in paise) ----
export const PRICING = {
  FEATURED_LISTING_7_DAYS: 49900,    // ₹499
  FEATURED_LISTING_30_DAYS: 149900,  // ₹1,499
  BASIC_MONTHLY: 99900,              // ₹999/month
  PROFESSIONAL_MONTHLY: 299900,      // ₹2,999/month
  ENTERPRISE_MONTHLY: 999900,        // ₹9,999/month
} as const;

// ---- Pagination ----
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// ---- File Upload ----
export const MAX_IMAGE_SIZE_MB = 10;
export const MAX_IMAGES_PER_PROPERTY = 30;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// ---- Rate Limiting ----
export const RATE_LIMITS = {
  GLOBAL_PER_15_MIN: 100,
  AUTH_PER_15_MIN: 10,
  OTP_PER_HOUR: 3,
  AI_PER_HOUR: 20,
  SEARCH_PER_MIN: 30,
} as const;

// ---- Cache TTLs (seconds) ----
export const CACHE_TTL = {
  FEATURED_LISTINGS: 300,        // 5 minutes
  LOCALITY_INSIGHTS: 86400,      // 24 hours
  PROPERTY_DETAIL: 60,           // 1 minute
  SEARCH_RESULTS: 30,            // 30 seconds
  USER_PROFILE: 300,             // 5 minutes
  SUBSCRIPTION_PLANS: 3600,      // 1 hour
} as const;

// ---- Property Types (display labels) ----
export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  APARTMENT: 'Apartment',
  HOUSE: 'Independent House',
  VILLA: 'Villa',
  PLOT: 'Plot / Land',
  COMMERCIAL: 'Commercial',
  OFFICE: 'Office Space',
  SHOP: 'Shop',
  WAREHOUSE: 'Warehouse',
  FARMHOUSE: 'Farmhouse',
};

export const LISTING_TYPE_LABELS: Record<string, string> = {
  BUY: 'Buy',
  RENT: 'Rent',
  COMMERCIAL: 'Commercial',
};

// ---- Indian Cities (top real estate markets) ----
export const MAJOR_CITIES = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Pune',
  'Kolkata',
  'Ahmedabad',
  'Jaipur',
  'Noida',
  'Gurugram',
  'Navi Mumbai',
  'Thane',
  'Faridabad',
  'Ghaziabad',
  'Lucknow',
  'Chandigarh',
  'Kochi',
  'Coimbatore',
  'Indore',
] as const;

// ---- Amenities ----
export const COMMON_AMENITIES = [
  'Gym',
  'Swimming Pool',
  'Club House',
  'Children Play Area',
  'Security / CCTV',
  'Power Backup',
  'Lift',
  'Parking',
  'Garden / Park',
  'Intercom',
  'RO Water',
  'Gas Pipeline',
  'Sewage Treatment',
  'Rainwater Harvesting',
  'Indoor Games',
  'Jogging Track',
  'Visitor Parking',
  'Maintenance Staff',
  'Shopping Center',
  'Multipurpose Hall',
] as const;

// ---- Facing Directions ----
export const FACING_DIRECTIONS = ['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'] as const;

// ---- Error Codes ----
export const ERROR_CODES = {
  // Auth
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
  OTP_EXPIRED: 'OTP_EXPIRED',
  OTP_INVALID: 'OTP_INVALID',

  // Resources
  NOT_FOUND: 'NOT_FOUND',
  PROPERTY_NOT_FOUND: 'PROPERTY_NOT_FOUND',
  USER_NOT_FOUND: 'USER_NOT_FOUND',

  // Authorization
  FORBIDDEN: 'FORBIDDEN',
  UNAUTHORIZED: 'UNAUTHORIZED',
  INSUFFICIENT_PLAN: 'INSUFFICIENT_PLAN',

  // Payments
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  INVALID_SIGNATURE: 'INVALID_SIGNATURE',

  // AI
  AI_SERVICE_UNAVAILABLE: 'AI_SERVICE_UNAVAILABLE',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DUPLICATE_LISTING: 'DUPLICATE_LISTING',

  // Server
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
} as const;
