import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Dimensions, ActivityIndicator, Alert, Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertiesApi } from '../../lib/api';
import { formatPrice, timeAgo, getTrustLevel, getTrustLabel } from '@metriva/shared';
import { usePropertyStore } from '../../store/property.store';
import { HomeStackParamList } from '../../navigation/MainNavigator';

type Route = RouteProp<HomeStackParamList, 'PropertyDetail'>;

const { width } = Dimensions.get('window');

const TRUST_COLORS: Record<string, string> = {
  high: '#16a34a', medium: '#d97706', low: '#ea580c', critical: '#dc2626',
};

export default function PropertyDetailScreen() {
  const { params } = useRoute<Route>();
  const queryClient = useQueryClient();
  const savedIds = usePropertyStore((s) => s.savedIds);
  const isSaved = savedIds.has(params.id);

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', params.id],
    queryFn: () => propertiesApi.getById(params.id).then((r) => r.data.data),
  });

  const { mutate: toggleSave } = useMutation({
    mutationFn: () => propertiesApi.toggleSave(params.id),
    onMutate: () => {
      usePropertyStore.getState().toggleSaved(params.id);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-properties'] });
    },
  });

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#2563eb" /></View>;
  }

  if (!property) {
    return <View style={styles.center}><Text style={styles.notFound}>Property not found</Text></View>;
  }

  const primaryImage = property.images.find((img: { isPrimary: boolean }) => img.isPrimary) ?? property.images[0];
  const trustLevel = property.aiTrustScore != null ? getTrustLevel(property.aiTrustScore) : null;
  const trustColor = trustLevel ? TRUST_COLORS[trustLevel] : '#6b7280';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero image */}
      <View style={styles.imageContainer}>
        {primaryImage && (
          <Image source={{ uri: primaryImage.url }} style={styles.image} contentFit="cover" />
        )}
        <View style={styles.imageOverlay}>
          <TouchableOpacity style={styles.saveBtn} onPress={() => toggleSave()}>
            <Text style={{ fontSize: 20 }}>{isSaved ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>
        {property.images.length > 1 && (
          <View style={styles.imageBadge}>
            <Text style={styles.imageBadgeText}>+{property.images.length - 1} photos</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        {/* Price + Title */}
        <Text style={styles.price}>{formatPrice(property.price)}</Text>
        <Text style={styles.title}>{property.title}</Text>
        <Text style={styles.location}>📍 {property.address}, {property.locality}, {property.city}</Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          {property.bedrooms != null && <StatChip icon="🛏" value={`${property.bedrooms} BHK`} />}
          {property.bathrooms != null && <StatChip icon="🚿" value={`${property.bathrooms} Bath`} />}
          {property.builtUpArea && <StatChip icon="📐" value={`${property.builtUpArea.toLocaleString('en-IN')} sqft`} />}
        </View>

        {/* Trust Score */}
        {property.aiTrustScore != null && (
          <View style={[styles.card, { borderLeftColor: trustColor, borderLeftWidth: 4 }]}>
            <Text style={styles.cardTitle}>Trust Score</Text>
            <View style={styles.trustRow}>
              <View style={styles.trustBar}>
                <View style={[styles.trustFill, { width: `${property.aiTrustScore}%`, backgroundColor: trustColor }]} />
              </View>
              <Text style={[styles.trustScore, { color: trustColor }]}>{Math.round(property.aiTrustScore)}/100</Text>
            </View>
            <Text style={[styles.trustLabel, { color: trustColor }]}>{getTrustLabel(property.aiTrustScore)}</Text>
          </View>
        )}

        {/* AI Summary */}
        {property.aiSummary && (
          <View style={[styles.card, styles.aiCard]}>
            <Text style={styles.aiTitle}>✨ AI Summary</Text>
            <Text style={styles.aiText}>{property.aiSummary}</Text>
          </View>
        )}

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About this property</Text>
          <Text style={styles.description}>{property.description}</Text>
        </View>

        {/* Amenities */}
        {property.amenities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenities}>
              {property.amenities.map((a: string) => (
                <View key={a} style={styles.amenityChip}>
                  <Text style={styles.amenityText}>{a}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Posted info */}
        <Text style={styles.postedAt}>Posted {timeAgo(property.postedAt)}{property.isVerified ? '  ✅ Verified' : ''}</Text>

        {/* Contact buttons */}
        <View style={styles.contactRow}>
          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => Alert.alert('Contact Owner', `Call ${property.owner?.firstName}?`, [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Call', onPress: () => Linking.openURL('tel:') },
            ])}
          >
            <Text style={styles.callBtnText}>📞 Request Callback</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.msgBtn}>
            <Text style={styles.msgBtnText}>💬 Message</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

function StatChip({ icon, value }: { icon: string; value: string }) {
  return (
    <View style={styles.statChip}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFound: { fontSize: 16, color: '#9ca3af' },
  imageContainer: { width, height: 280, position: 'relative' },
  image: { width: '100%', height: '100%' },
  imageOverlay: { position: 'absolute', top: 12, right: 12 },
  saveBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.9)', justifyContent: 'center', alignItems: 'center' },
  imageBadge: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  imageBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  content: { padding: 20 },
  price: { fontSize: 26, fontWeight: '800', color: '#1d4ed8', marginBottom: 4 },
  title: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 6 },
  location: { fontSize: 14, color: '#6b7280', marginBottom: 16 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f3f4f6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  statIcon: { fontSize: 16 },
  statValue: { fontSize: 13, fontWeight: '600', color: '#111827' },
  card: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 14, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 10 },
  trustRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 6 },
  trustBar: { flex: 1, height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, overflow: 'hidden' },
  trustFill: { height: '100%', borderRadius: 4 },
  trustScore: { fontSize: 14, fontWeight: '700' },
  trustLabel: { fontSize: 12, fontWeight: '600' },
  aiCard: { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' },
  aiTitle: { fontSize: 13, fontWeight: '700', color: '#1d4ed8', marginBottom: 8 },
  aiText: { fontSize: 14, color: '#1e40af', lineHeight: 22 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
  description: { fontSize: 14, color: '#6b7280', lineHeight: 22 },
  amenities: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenityChip: { backgroundColor: '#f3f4f6', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
  amenityText: { fontSize: 13, color: '#374151' },
  postedAt: { fontSize: 12, color: '#9ca3af', marginBottom: 24 },
  contactRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  callBtn: { flex: 1, backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  callBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  msgBtn: { flex: 1, borderWidth: 1.5, borderColor: '#2563eb', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  msgBtnText: { color: '#2563eb', fontWeight: '700', fontSize: 15 },
});
