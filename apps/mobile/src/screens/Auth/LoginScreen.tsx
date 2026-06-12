import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';
import { authApi } from '../../lib/api';
import { useAuthStore } from '../../store/auth.store';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      setAuth(res.data.user, res.data.tokens.accessToken, res.data.refreshToken);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? 'Login failed';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Sign in to your account</Text>

      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail}
        keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#9ca3af" />

      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword}
        secureTextEntry placeholderTextColor="#9ca3af" />

      <TouchableOpacity onPress={() => navigation.navigate('Otp' as never)} style={styles.otpLink}>
        <Text style={styles.otpLinkText}>Login with OTP instead →</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.footerLink}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '700', color: '#111827', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#6b7280', marginBottom: 28 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, color: '#111827', marginBottom: 12 },
  otpLink: { alignSelf: 'flex-end', marginBottom: 20 },
  otpLinkText: { fontSize: 13, color: '#2563eb', fontWeight: '500' },
  button: { backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 16 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center' },
  footerText: { color: '#6b7280', fontSize: 14 },
  footerLink: { color: '#2563eb', fontSize: 14, fontWeight: '600' },
});
