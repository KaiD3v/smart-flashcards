"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { setUnauthorizedHandler } from "@/lib/api/client";
import { authService } from "@/services/auth.service";
import type { User } from "@/types/api";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refresh: () => Promise<void>;
  setUser: (user: User | null) => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const ME_QUERY_KEY = ["auth", "me"] as const;

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: () => authService.me(),
    retry: false,
    staleTime: 60_000,
  });

  const setUser = useCallback(
    (user: User | null) => {
      queryClient.setQueryData(ME_QUERY_KEY, user ?? undefined);
    },
    [queryClient]
  );

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const signOut = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      queryClient.removeQueries({ queryKey: ME_QUERY_KEY });
      queryClient.clear();
      router.replace("/login");
    }
  }, [queryClient, router]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      queryClient.setQueryData(ME_QUERY_KEY, null);
      const isProtected =
        pathname?.startsWith("/dashboard") ||
        pathname?.startsWith("/subjects") ||
        pathname?.startsWith("/settings");
      if (isProtected) {
        const next = encodeURIComponent(pathname);
        router.replace(`/login?next=${next}`);
      }
    });
    return () => setUnauthorizedHandler(null);
  }, [pathname, queryClient, router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: data ?? null,
      isLoading,
      isAuthenticated: Boolean(data),
      refresh,
      setUser,
      signOut,
    }),
    [data, isLoading, refresh, setUser, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
