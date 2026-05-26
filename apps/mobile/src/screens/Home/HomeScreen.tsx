import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Search, MapPin } from 'lucide-react-native';
import { useFeaturedProperties } from '../../hooks/useProperties';
import { PropertyCard } from '../../components/PropertyCard';
import { MAJOR_CITIES } from '@metriva/shared';
import type { HomeStackParamList } from '../../navigation/MainNavigator';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: featured = [], isLoading } = useFeaturedProperties();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Find Your</Text>
          <Text style={styles.headline}>Dream Home 🏠</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={18} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search city, locality..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity style={styles.searchBtn}>
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Quick filter tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
        {(['BUY', 'RENT', 'COMMERCIAL'] as const).map((tab) => (
          <TouchableOpacity key={tab} style={styles.tab}>
            <Text style={styles.tabText}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Popular Cities */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Cities</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {MAJOR_CITIES.slice(0, 8).map((city) => (
            <TouchableOpacity key={city} style={styles.cityChip}>
              <MapPin size={12} color="#2563eb" />
              <Text style={styles.cityChipText}>{city}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Featured Properties */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Properties</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        {isLoading ? (
          <ActivityIndicator color="#2563eb" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={featured.slice(0, 6)}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
            renderItem={({ item }) => (
              <PropertyCard
                property={item}
                onPress={() => navigation.navigate('PropertyDetail', { id: item.id })}
                style={{ width: 260 }}
              />
            )}
          />
        )}
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#2563eb',
  },
  greeting: { fontSize: 16, color: '#bfdbfe', fontWeight: '500' },
  headline: { fontSize: 28, color: '#ffffff', fontWeight: '700', marginTop: 2 },
  searchContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#2563eb',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#111827' },
  searchBtn: { backgroundColor: '#ffffff', borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center' },
  searchBtnText: { color: '#2563eb', fontWeight: '600', fontSize: 14 },
  tabsScroll: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff' },
  tab: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: '#eff6ff', marginRight: 8 },
  tabText: { color: '#2563eb', fontSize: 13, fontWeight: '600' },
  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  seeAll: { fontSize: 13, color: '#2563eb', fontWeight: '500' },
  cityChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: '#eff6ff', borderRadius: 20, marginRight: 8 },
  cityChipText: { fontSize: 12, color: '#2563eb', fontWeight: '500' },
});
