import axios, { type AxiosInstance } from "axios";
import { env } from "@/lib/env";

export const api: AxiosInstance = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
  timeout: 60_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && onUnauthorized) {
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);
