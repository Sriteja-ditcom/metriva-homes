import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { propertiesApi } from '../../lib/api';
import { PropertyCard } from '../../components/PropertyCard';
import { SavedStackParamList } from '../../navigation/MainNavigator';

type Nav = NativeStackNavigationProp<SavedStackParamList, 'SavedList'>;

export default function SavedScreen() {
  const navigation = useNavigation<Nav>();
  const { data: saved = [], isLoading } = useQuery({
    queryKey: ['saved-properties'],
    queryFn: () => propertiesApi.getSaved().then((r) => r.data.data),
  });

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#2563eb" /></View>;
  }

  return (
    <FlatList
      data={saved}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <PropertyCard
          property={item}
          onPress={() => navigation.navigate('PropertyDetail', { id: item.id })}
        />
      )}
      contentContainerStyle={[styles.list, saved.length === 0 && styles.emptyList]}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>❤️</Text>
          <Text style={styles.emptyTitle}>No saved properties</Text>
          <Text style={styles.emptySubtitle}>Properties you save will appear here</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, gap: 12 },
  emptyList: { flex: 1 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: '#9ca3af' },
});
