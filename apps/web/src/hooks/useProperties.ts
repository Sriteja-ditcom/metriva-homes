import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { propertiesApi } from '../lib/api';
import { usePropertyStore } from '../store/property.store';
import type { Property, PropertySearchFilters } from '@metriva/shared';

export function useProperties(filters?: PropertySearchFilters) {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: () =>
      propertiesApi.search(filters as Record<string, unknown>).then((r) => r),
    staleTime: 30 * 1000,
  });
}

export function useFeaturedProperties() {
  return useQuery({
    queryKey: ['properties', 'featured'],
    queryFn: () => propertiesApi.getFeatured().then((r) => r.data as Property[]),
    staleTime: 5 * 60 * 1000,
  });
}

export function useProperty(id: string) {
  const addRecentlyViewed = usePropertyStore((s) => s.addRecentlyViewed);

  return useQuery({
    queryKey: ['property', id],
    queryFn: () =>
      propertiesApi.getById(id).then((r) => {
        addRecentlyViewed(id);
        return r.data as Property;
      }),
    enabled: !!id,
    staleTime: 60 * 1000,
  });
}

export function useSavedProperties() {
  return useQuery({
    queryKey: ['properties', 'saved'],
    queryFn: () => propertiesApi.getSaved().then((r) => r.data as Property[]),
  });
}

export function useMyProperties() {
  return useQuery({
    queryKey: ['properties', 'mine'],
    queryFn: () => propertiesApi.getMine().then((r) => r.data as Property[]),
  });
}

export function useToggleSave(propertyId: string) {
  const queryClient = useQueryClient();
  const toggleSaved = usePropertyStore((s) => s.toggleSaved);

  return useMutation({
    mutationFn: () => propertiesApi.toggleSave(propertyId),
    onMutate: () => toggleSaved(propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties', 'saved'] });
    },
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) => propertiesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties', 'mine'] });
    },
  });
}
