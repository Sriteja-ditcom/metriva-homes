// ================================================
// Metriva Homes — Shared Utilities
// ================================================

import { TRUST_SCORE } from '../constants';

// ---- Price Formatting ----

export function formatPrice(paise: number, currency = 'INR'): string {
  const rupees = paise / 100;
  if (rupees >= 10_000_000) {
    return `₹${(rupees / 10_000_000).toFixed(2)} Cr`;
  }
  if (rupees >= 100_000) {
    return `₹${(rupees / 100_000).toFixed(2)} L`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(rupees);
}

export function formatPricePerSqft(paise: number): string {
  return `₹${Math.round(paise / 100).toLocaleString('en-IN')}/sqft`;
}

// ---- Area Formatting ----

export function formatArea(sqft: number): string {
  if (sqft >= 43560) {
    return `${(sqft / 43560).toFixed(2)} acres`;
  }
  return `${sqft.toLocaleString('en-IN')} sq.ft`;
}

// ---- Trust Score Helpers ----

export function getTrustLevel(score: number): 'high' | 'medium' | 'low' | 'critical' {
  if (score >= TRUST_SCORE.HIGH) return 'high';
  if (score >= TRUST_SCORE.MEDIUM) return 'medium';
  if (score >= TRUST_SCORE.LOW) return 'low';
  return 'critical';
}

export function getTrustColor(score: number): string {
  const level = getTrustLevel(score);
  const colors = {
    high: '#16a34a',
    medium: '#d97706',
    low: '#ea580c',
    critical: '#dc2626',
  };
  return colors[level];
}

export function getTrustLabel(score: number): string {
  const level = getTrustLevel(score);
  const labels = {
    high: 'Highly Trusted',
    medium: 'Likely Legitimate',
    low: 'Needs Review',
    critical: 'High Risk',
  };
  return labels[level];
}

// ---- Property Helpers ----

export function getPropertySlug(title: string, city: string, id: string): string {
  const slug = `${title}-${city}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
  return `${slug}-${id.slice(-8)}`;
}

export function getPrimaryImage(images: { url: string; isPrimary: boolean }[]): string {
  const primary = images.find((img) => img.isPrimary);
  return primary?.url ?? images[0]?.url ?? '/placeholder-property.jpg';
}

// ---- String Helpers ----

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function formatFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

// ---- Date Helpers ----

export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ---- Validation ----

export function isValidPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone.replace(/\s/g, ''));
}

export function isValidPincode(pincode: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pincode);
}

export function isValidReraNumber(rera: string): boolean {
  return rera.trim().length >= 6;
}

// ---- Search URL Helpers ----

export function buildSearchUrl(filters: Record<string, unknown>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, String(v)));
      } else {
        params.set(key, String(value));
      }
    }
  }
  return params.toString();
}
