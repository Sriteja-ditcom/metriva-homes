import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Switch,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '../../lib/api';
import { useAuthStore } from '../../store/auth.store';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { data: profile } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => userApi.getMe().then((r) => r.data.data),
    enabled: !!user,
  });

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`
    : user?.firstName ?? 'User';

  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.email}>{profile?.email ?? user?.email}</Text>
        {profile?.isEmailVerified && <Text style={styles.verified}>✅ Verified</Text>}
      </View>

      {/* Subscription */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Subscription Plan</Text>
        <View style={styles.planRow}>
          <Text style={styles.plan}>{profile?.subscription?.plan ?? 'FREE'}</Text>
          <TouchableOpacity style={styles.upgradeBtn}>
            <Text style={styles.upgradeBtnText}>Upgrade</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.card}>
        {[
          { label: 'My Listings', icon: '🏠' },
          { label: 'Payment History', icon: '💳' },
          { label: 'Notifications', icon: '🔔' },
          { label: 'Help & Support', icon: '💬' },
          { label: 'Privacy Policy', icon: '🔒' },
          { label: 'Terms of Service', icon: '📄' },
        ].map((item, index, arr) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.menuItem, index < arr.length - 1 && styles.menuItemBorder]}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Metriva Homes v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 20 },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 28, fontWeight: '700', color: '#fff' },
  name: { fontSize: 20, fontWeight: '700', color: '#111827' },
  email: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  verified: { fontSize: 13, color: '#16a34a', marginTop: 6 },
  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 13, fontWeight: '600', color: '#6b7280', marginBottom: 12 },
  planRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  plan: { fontSize: 18, fontWeight: '800', color: '#7c3aed' },
  upgradeBtn: { backgroundColor: '#7c3aed', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10 },
  upgradeBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  menuIcon: { fontSize: 20, width: 28 },
  menuLabel: { flex: 1, fontSize: 15, color: '#111827' },
  menuArrow: { fontSize: 22, color: '#9ca3af', marginTop: -2 },
  logoutBtn: { backgroundColor: '#fee2e2', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginBottom: 20 },
  logoutText: { color: '#dc2626', fontWeight: '700', fontSize: 16 },
  version: { textAlign: 'center', fontSize: 12, color: '#d1d5db', marginBottom: 8 },
});
