import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { authApi } from '../../lib/api';
import { useAuthStore } from '../../store/auth.store';

export default function OtpScreen() {
  const { setAuth } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    if (phone.length !== 10) return Alert.alert('Enter 10-digit phone number');
    setLoading(true);
    try {
      await authApi.sendOtp(phone);
      setOtpSent(true);
    } catch {
      Alert.alert('Error', 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    setLoading(true);
    try {
      const res = await authApi.verifyOtp(phone, otp);
      setAuth(res.data.user, res.data.tokens.accessToken, res.data.refreshToken);
    } catch {
      Alert.alert('Invalid OTP', 'Please try again');
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{otpSent ? 'Enter OTP' : 'Phone Login'}</Text>
      <Text style={styles.subtitle}>{otpSent ? `OTP sent to +91 ${phone}` : 'Enter your phone number'}</Text>
      {!otpSent ? (
        <>
          <View style={styles.phoneRow}>
            <View style={styles.countryCode}><Text style={styles.countryText}>🇮🇳 +91</Text></View>
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="10-digit number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={10} placeholderTextColor="#9ca3af" />
          </View>
          <TouchableOpacity style={styles.button} onPress={sendOtp} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send OTP</Text>}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput style={styles.input} placeholder="Enter 6-digit OTP" value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={6} placeholderTextColor="#9ca3af" />
          <TouchableOpacity style={styles.button} onPress={verifyOtp} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify & Login</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setOtpSent(false)}><Text style={styles.resend}>Change number</Text></TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '700', color: '#111827', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#6b7280', marginBottom: 28 },
  phoneRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  countryCode: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, justifyContent: 'center' },
  countryText: { fontSize: 15, color: '#111827' },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, color: '#111827', marginBottom: 12 },
  button: { backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 12 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  resend: { textAlign: 'center', color: '#2563eb', fontSize: 14 },
});
