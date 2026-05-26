import { useQuery } from '@tanstack/react-query';
import { propertiesApi } from '../lib/api';
import type { Property } from '@metriva/shared';

export function useFeaturedProperties() {
  return useQuery({
    queryKey: ['properties', 'featured'],
    queryFn: () => propertiesApi.getFeatured().then((r) => r.data as Property[]),
    staleTime: 5 * 60 * 1000,
  });
}

export function useProperties(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: () => propertiesApi.search(filters ?? {}).then((r) => ({ items: r.data as Property[], meta: r.meta })),
    staleTime: 30 * 1000,
  });
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: ['property', id],
    queryFn: () => propertiesApi.getById(id).then((r) => r.data as Property),
    enabled: !!id,
  });
}
