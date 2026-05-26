import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,     // 5 minutes
      gcTime: 10 * 60 * 1000,        // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if ((error as { response?: { status?: number } }).response?.status &&
            ((error as { response: { status: number } }).response.status < 500)) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
