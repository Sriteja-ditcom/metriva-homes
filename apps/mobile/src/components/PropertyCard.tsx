import { View, Text, Image, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Bed, Bath, Maximize2, Shield } from 'lucide-react-native';
import type { Property } from '@metriva/shared';
import { formatPrice, getPrimaryImage, getTrustLevel } from '@metriva/shared';

interface PropertyCardProps {
  property: Property;
  onPress?: () => void;
  style?: ViewStyle;
}

const TRUST_COLORS = { high: '#16a34a', medium: '#d97706', low: '#ea580c', critical: '#dc2626' };

export function PropertyCard({ property, onPress, style }: PropertyCardProps) {
  const { title, price, locality, city, bedrooms, bathrooms, builtUpArea, images, aiTrustScore, listingType, isFeatured } = property;
  const primaryImage = getPrimaryImage(images);
  const trustLevel = aiTrustScore != null ? getTrustLevel(aiTrustScore) : null;

  return (
    <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.95}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: primaryImage }} style={styles.image} resizeMode="cover" />
        <View style={[styles.badge, listingType === 'RENT' ? styles.rentBadge : styles.buyBadge]}>
          <Text style={styles.badgeText}>{listingType}</Text>
        </View>
        {isFeatured && (
          <View style={[styles.badge, styles.featuredBadge, { right: 8, left: undefined }]}>
            <Text style={styles.badgeText}>★ Featured</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.price}>{formatPrice(price)}</Text>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <Text style={styles.location} numberOfLines={1}>📍 {locality}, {city}</Text>

        <View style={styles.statsRow}>
          {bedrooms != null && (
            <View style={styles.stat}>
              <Bed size={13} color="#6b7280" />
              <Text style={styles.statText}>{bedrooms} BHK</Text>
            </View>
          )}
          {bathrooms != null && (
            <View style={styles.stat}>
              <Bath size={13} color="#6b7280" />
              <Text style={styles.statText}>{bathrooms}</Text>
            </View>
          )}
          {builtUpArea && (
            <View style={styles.stat}>
              <Maximize2 size={13} color="#6b7280" />
              <Text style={styles.statText}>{builtUpArea.toLocaleString('en-IN')} sqft</Text>
            </View>
          )}
        </View>

        {trustLevel && aiTrustScore != null && (
          <View style={[styles.trustBadge, { borderColor: TRUST_COLORS[trustLevel] }]}>
            <Shield size={12} color={TRUST_COLORS[trustLevel]} />
            <Text style={[styles.trustText, { color: TRUST_COLORS[trustLevel] }]}>
              Trust: {Math.round(aiTrustScore)}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#ffffff', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#e5e7eb', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  imageContainer: { position: 'relative', height: 160 },
  image: { width: '100%', height: '100%' },
  badge: { position: 'absolute', top: 8, left: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  buyBadge: { backgroundColor: '#2563eb' },
  rentBadge: { backgroundColor: '#16a34a' },
  featuredBadge: { backgroundColor: '#d97706' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  content: { padding: 12 },
  price: { fontSize: 18, fontWeight: '700', color: '#1e40af', marginBottom: 4 },
  title: { fontSize: 13, fontWeight: '600', color: '#111827', marginBottom: 4 },
  location: { fontSize: 12, color: '#6b7280', marginBottom: 10 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 12, color: '#6b7280' },
  trustBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, borderWidth: 1, alignSelf: 'flex-start' },
  trustText: { fontSize: 11, fontWeight: '600' },
});
