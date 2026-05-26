import {
  View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator,
} from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { propertiesApi } from '../../lib/api';

const LISTING_TYPES = ['BUY', 'RENT', 'COMMERCIAL'] as const;
const PROPERTY_TYPES = ['APARTMENT', 'VILLA', 'PLOT', 'OFFICE', 'SHOP', 'WAREHOUSE'] as const;

export default function PostPropertyScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    city: '',
    locality: '',
    address: '',
    listingType: 'BUY' as typeof LISTING_TYPES[number],
    type: 'APARTMENT' as typeof PROPERTY_TYPES[number],
    bedrooms: '',
    bathrooms: '',
    builtUpArea: '',
  });
  const [images, setImages] = useState<{ uri: string; name: string; type: string }[]>([]);

  const { mutate: createProperty, isPending } = useMutation({
    mutationFn: async () => {
      const res = await propertiesApi.create({
        ...form,
        price: Number(form.price),
        bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
        builtUpArea: form.builtUpArea ? Number(form.builtUpArea) : undefined,
      });
      const propertyId = res.data.data.id;
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach((img) => {
          formData.append('images', { uri: img.uri, name: img.name, type: img.type } as unknown as Blob);
        });
        await propertiesApi.uploadImages(propertyId, formData);
      }
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-properties'] });
      Alert.alert('Success', 'Property submitted for review!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    },
    onError: () => Alert.alert('Error', 'Failed to post property. Please try again.'),
  });

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 10,
    });
    if (!result.canceled) {
      const picked = result.assets.map((a) => ({
        uri: a.uri,
        name: a.fileName ?? `photo_${Date.now()}.jpg`,
        type: a.mimeType ?? 'image/jpeg',
      }));
      setImages((prev) => [...prev, ...picked].slice(0, 10));
    }
  };

  const update = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    if (!form.title.trim()) return 'Title is required';
    if (!form.price || isNaN(Number(form.price))) return 'Valid price is required';
    if (!form.city.trim()) return 'City is required';
    if (!form.address.trim()) return 'Address is required';
    if (!form.description.trim() || form.description.length < 50) return 'Description must be at least 50 characters';
    return null;
  };

  const handleSubmit = () => {
    const error = validate();
    if (error) return Alert.alert('Validation Error', error);
    createProperty();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.heading}>Post a Property</Text>
      <Text style={styles.subheading}>Your listing will be reviewed and go live within 24 hours</Text>

      {/* Listing Type */}
      <Field label="Listing Type">
        <View style={styles.row}>
          {LISTING_TYPES.map((t) => (
            <TouchableOpacity
              key={t} style={[styles.option, form.listingType === t && styles.optionActive]}
              onPress={() => update('listingType', t)}
            >
              <Text style={[styles.optionText, form.listingType === t && styles.optionTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Field>

      {/* Property Type */}
      <Field label="Property Type">
        <View style={styles.row}>
          {PROPERTY_TYPES.map((t) => (
            <TouchableOpacity
              key={t} style={[styles.option, form.type === t && styles.optionActive]}
              onPress={() => update('type', t)}
            >
              <Text style={[styles.optionText, form.type === t && styles.optionTextActive]}>{t.replace('_', ' ')}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Field>

      <Field label="Title"><TextInput style={styles.input} value={form.title} onChangeText={(v) => update('title', v)} placeholder="e.g. 3 BHK Spacious Flat in Bandra" placeholderTextColor="#9ca3af" /></Field>
      <Field label="Price (₹)"><TextInput style={styles.input} value={form.price} onChangeText={(v) => update('price', v)} placeholder="e.g. 5000000" keyboardType="numeric" placeholderTextColor="#9ca3af" /></Field>
      <Field label="City"><TextInput style={styles.input} value={form.city} onChangeText={(v) => update('city', v)} placeholder="e.g. Mumbai" placeholderTextColor="#9ca3af" /></Field>
      <Field label="Locality"><TextInput style={styles.input} value={form.locality} onChangeText={(v) => update('locality', v)} placeholder="e.g. Bandra West" placeholderTextColor="#9ca3af" /></Field>
      <Field label="Address"><TextInput style={styles.input} value={form.address} onChangeText={(v) => update('address', v)} placeholder="Full address" placeholderTextColor="#9ca3af" /></Field>

      <View style={styles.threeCol}>
        <View style={{ flex: 1 }}>
          <Field label="Bedrooms"><TextInput style={styles.input} value={form.bedrooms} onChangeText={(v) => update('bedrooms', v)} placeholder="3" keyboardType="numeric" placeholderTextColor="#9ca3af" /></Field>
        </View>
        <View style={{ flex: 1 }}>
          <Field label="Bathrooms"><TextInput style={styles.input} value={form.bathrooms} onChangeText={(v) => update('bathrooms', v)} placeholder="2" keyboardType="numeric" placeholderTextColor="#9ca3af" /></Field>
        </View>
        <View style={{ flex: 1 }}>
          <Field label="Area (sqft)"><TextInput style={styles.input} value={form.builtUpArea} onChangeText={(v) => update('builtUpArea', v)} placeholder="1200" keyboardType="numeric" placeholderTextColor="#9ca3af" /></Field>
        </View>
      </View>

      <Field label="Description">
        <TextInput
          style={[styles.input, styles.textarea]}
          value={form.description}
          onChangeText={(v) => update('description', v)}
          placeholder="Describe your property in detail (min. 50 characters)..."
          placeholderTextColor="#9ca3af"
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />
      </Field>

      {/* Images */}
      <Field label={`Photos (${images.length}/10)`}>
        <TouchableOpacity style={styles.uploadBtn} onPress={pickImages}>
          <Text style={styles.uploadBtnText}>📷 Add Photos</Text>
        </TouchableOpacity>
        {images.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagePreview}>
            {images.map((img, i) => (
              <View key={i} style={styles.imageThumb}>
                <Image source={{ uri: img.uri }} style={styles.thumbImg} contentFit="cover" />
                <TouchableOpacity
                  style={styles.removeImg}
                  onPress={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                >
                  <Text style={styles.removeImgText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
      </Field>

      <TouchableOpacity style={[styles.submitBtn, isPending && styles.submitBtnDisabled]} onPress={handleSubmit} disabled={isPending}>
        {isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit Property</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 20, paddingBottom: 40 },
  heading: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 4 },
  subheading: { fontSize: 13, color: '#6b7280', marginBottom: 24 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#111827' },
  textarea: { height: 120, paddingTop: 12 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb' },
  optionActive: { backgroundColor: '#eff6ff', borderColor: '#2563eb' },
  optionText: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  optionTextActive: { color: '#2563eb' },
  threeCol: { flexDirection: 'row', gap: 10 },
  uploadBtn: { borderWidth: 1.5, borderColor: '#2563eb', borderStyle: 'dashed', borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: '#eff6ff' },
  uploadBtnText: { color: '#2563eb', fontWeight: '600', fontSize: 15 },
  imagePreview: { marginTop: 12 },
  imageThumb: { width: 90, height: 90, borderRadius: 10, marginRight: 10, position: 'relative' },
  thumbImg: { width: '100%', height: '100%', borderRadius: 10 },
  removeImg: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  removeImgText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  submitBtn: { backgroundColor: '#2563eb', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontWeight: '800', fontSize: 17 },
});
