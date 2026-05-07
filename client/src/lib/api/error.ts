import { AxiosError } from "axios";
import type { ApiError, ApiIssue } from "@/types/api";

type BackendErrorBody = {
  message?: string;
  issues?: ApiIssue[];
  details?: unknown;
};

export function normalizeError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    const data = error.response?.data as BackendErrorBody | undefined;
    const status = error.response?.status ?? 0;
    const message =
      data?.message ??
      (status === 0
        ? "Cannot reach the server. Check your connection."
        : error.message ?? "Unexpected error");
    return {
      status,
      message,
      issues: data?.issues,
    };
  }
  if (error instanceof Error) {
    return { status: 0, message: error.message };
  }
  return { status: 0, message: "Unexpected error" };
}

export function isUnauthorized(error: unknown): boolean {
  return error instanceof AxiosError && error.response?.status === 401;
}
