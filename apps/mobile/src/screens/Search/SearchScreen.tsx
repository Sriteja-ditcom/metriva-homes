import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useState, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { propertiesApi } from '../../lib/api';
import { PropertyCard } from '../../components/PropertyCard';
import { SearchStackParamList } from '../../navigation/MainNavigator';
import { MAJOR_CITIES } from '@metriva/shared';

type Nav = NativeStackNavigationProp<SearchStackParamList, 'SearchList'>;

const LISTING_TYPES = ['BUY', 'RENT', 'COMMERCIAL'] as const;
type ListingType = typeof LISTING_TYPES[number];

export default function SearchScreen() {
  const navigation = useNavigation<Nav>();
  const [city, setCity] = useState('');
  const [listingType, setListingType] = useState<ListingType>('BUY');
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['properties', 'search', city, listingType, page],
    queryFn: () => propertiesApi.search({ city: city || undefined, listingType, page, limit: 20 }).then((r) => r.data.data),
    placeholderData: (prev) => prev,
  });

  const handleSearch = useCallback(() => setPage(1), []);

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          placeholder="Search by city..."
          value={city}
          onChangeText={setCity}
          onSubmitEditing={handleSearch}
          placeholderTextColor="#9ca3af"
          returnKeyType="search"
        />
      </View>

      <View style={styles.tabs}>
        {LISTING_TYPES.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, listingType === t && styles.tabActive]}
            onPress={() => { setListingType(t); setPage(1); }}
          >
            <Text style={[styles.tabText, listingType === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.cityChips}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={MAJOR_CITIES.slice(0, 8)}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.chip, city === item && styles.chipActive]}
              onPress={() => { setCity(city === item ? '' : item); setPage(1); }}
            >
              <Text style={[styles.chipText, city === item && styles.chipTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#2563eb" /></View>
      ) : (
        <FlatList
          data={data?.items ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PropertyCard property={item} onPress={() => navigation.navigate('PropertyDetail', { id: item.id })} />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.center}><Text style={styles.emptyText}>No properties found</Text></View>
          }
          ListFooterComponent={isFetching ? <ActivityIndicator style={styles.footer} color="#2563eb" /> : null}
          onEndReached={() => { if (data?.meta?.hasMore) setPage((p) => p + 1); }}
          onEndReachedThreshold={0.3}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  searchBar: { backgroundColor: '#fff', padding: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  input: { backgroundColor: '#f3f4f6', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 11, fontSize: 15, color: '#111827' },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 12, paddingBottom: 12, gap: 8 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f3f4f6', alignItems: 'center' },
  tabActive: { backgroundColor: '#2563eb' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  tabTextActive: { color: '#fff' },
  cityChips: { backgroundColor: '#fff', paddingHorizontal: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  chip: { paddingHorizontal: 14, paddingVertical: 7, backgroundColor: '#f3f4f6', borderRadius: 20, marginRight: 8 },
  chipActive: { backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#2563eb' },
  chipText: { fontSize: 13, color: '#6b7280' },
  chipTextActive: { color: '#2563eb', fontWeight: '600' },
  list: { padding: 12, gap: 12 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 15, color: '#9ca3af' },
  footer: { paddingVertical: 16 },
});
