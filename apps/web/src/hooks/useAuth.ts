import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, usersApi } from '../lib/api';
import { useAuthStore } from '../store/auth.store';
import type { User } from '@metriva/shared';

export function useCurrentUser() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['me'],
    queryFn: () => usersApi.getMe().then((r) => r.data as User),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const { setAuth } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { email: string; password: string }) => authApi.login(data),
    onSuccess: (response) => {
      const { user, tokens } = response.data;
      setAuth(user, tokens.accessToken);
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      role?: string;
    }) => authApi.register(data),
  });
}

export function useLogout() {
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      logout();
      queryClient.clear();
    },
  });
}

export function useSendOtp() {
  return useMutation({
    mutationFn: (phone: string) => authApi.sendOtp(phone),
  });
}

export function useVerifyOtp() {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: ({ phone, otp }: { phone: string; otp: string }) =>
      authApi.verifyOtp(phone, otp),
    onSuccess: (response) => {
      const { user, tokens } = response.data;
      setAuth(user, tokens.accessToken);
    },
  });
}
