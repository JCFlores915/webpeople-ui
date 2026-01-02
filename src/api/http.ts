import axios from "axios";
import type { ApiProblem } from "../utils/types/api.type.ts";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
});



export function getApiError(err: unknown): { message: string; status?: number; data?: ApiProblem } {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const data = err.response?.data as ApiProblem | undefined;

    const message =
      data?.detail ||
      data?.title ||
      (status ? `${status}: ${err.message}` : err.message);

    return { message, status, data };
  }
  return { message: "Unexpected error" };
}
