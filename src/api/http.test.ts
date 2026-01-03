import { describe, expect, it, vi } from "vitest";
import { getApiError } from "./http";

type AxiosMockError = {
  isAxiosError: true;
  message: string;
  response?: {
    status?: number;
    data?: unknown;
  };
};

const axiosMock = vi.hoisted(() => {
  const isAxiosError = (value: unknown): value is AxiosMockError =>
    Boolean((value as AxiosMockError)?.isAxiosError);
  return {
    isAxiosError,
    create: vi.fn(),
  };
});

vi.mock("axios", () => ({
  default: {
    create: axiosMock.create,
    isAxiosError: axiosMock.isAxiosError,
  },
  isAxiosError: axiosMock.isAxiosError,
}));

describe("getApiError", () => {
  it("returns detail message from ApiProblem", () => {
    const error: AxiosMockError = {
      isAxiosError: true,
      message: "Request failed",
      response: {
        status: 400,
        data: { detail: "Invalid payload", status: 400 },
      },
    };

    const result = getApiError(error);
    expect(result).toEqual({ message: "Invalid payload", status: 400, data: { detail: "Invalid payload", status: 400 } });
  });

  it("falls back to status and axios message when no detail provided", () => {
    const error: AxiosMockError = {
      isAxiosError: true,
      message: "Network Error",
      response: {
        status: 503,
        data: { title: "Unavailable" },
      },
    };

    const result = getApiError(error);
    expect(result).toEqual({ message: "Unavailable", status: 503, data: { title: "Unavailable" } });
  });

  it("returns unexpected error for non-axios values", () => {
    expect(getApiError(new Error("boom"))).toEqual({ message: "Unexpected error" });
    expect(getApiError(null)).toEqual({ message: "Unexpected error" });
  });
});
