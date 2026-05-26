import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Shield, Sparkles, Home } from 'lucide-react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';

const { width } = Dimensions.get('window');
type Nav = NativeStackNavigationProp<AuthStackParamList, 'Onboarding'>;

const FEATURES = [
  { icon: Shield, title: 'AI Trust Scores', desc: 'Every listing verified by AI' },
  { icon: Sparkles, title: 'Fraud Detection', desc: 'Fake listings caught before you see them' },
  { icon: Home, title: 'India-First', desc: 'Designed for Indian real estate' },
];

export default function OnboardingScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.logo}>🏠 Metriva Homes</Text>
        <Text style={styles.headline}>Find Your Home,{'\n'}Trust Guaranteed</Text>
        <Text style={styles.subheading}>India's AI-powered real estate platform</Text>
      </View>

      <View style={styles.features}>
        {FEATURES.map((f) => (
          <View key={f.title} style={styles.feature}>
            <f.icon size={24} color="#2563eb" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.primaryBtnText}>Get Started Free</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.secondaryBtnText}>I already have an account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  hero: { backgroundColor: '#2563eb', paddingTop: 80, paddingBottom: 40, paddingHorizontal: 28, alignItems: 'center' },
  logo: { fontSize: 20, color: '#bfdbfe', fontWeight: '600', marginBottom: 20 },
  headline: { fontSize: 32, fontWeight: '800', color: '#ffffff', textAlign: 'center', lineHeight: 40, marginBottom: 10 },
  subheading: { fontSize: 15, color: '#bfdbfe', textAlign: 'center' },
  features: { padding: 28, gap: 20 },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  featureDesc: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  buttons: { padding: 24, gap: 12 },
  primaryBtn: { backgroundColor: '#2563eb', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  primaryBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  secondaryBtn: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  secondaryBtnText: { color: '#374151', fontSize: 15, fontWeight: '500' },
});
