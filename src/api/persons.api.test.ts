import { describe, expect, it, beforeEach, vi } from "vitest";
import type { Person, PagedResponse } from "@/utils/types/persons.types";

const httpMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}));

vi.mock("./http", () => ({
  http: httpMock,
}));

import { createPerson, deletePerson, getPersons, updatePerson } from "./persons.api";

const sampleResponse: PagedResponse<Person> = {
  items: [
    {
      personId: "1",
      firstName: "John",
      lastName: "Doe",
      email: "john@doe.com",
      phone: null,
      birthDate: null,
      documentNumber: "ABC",
      createdDate: null,
      updatedDate: null,
      isActive: true,
    },
  ],
  page: 1,
  pageSize: 10,
  totalItems: 1,
  totalPages: 1,
  hasNext: false,
  hasPrevious: false,
  search: null,
  isActive: null,
};

beforeEach(() => {
  httpMock.get.mockReset();
  httpMock.post.mockReset();
  httpMock.put.mockReset();
  httpMock.delete.mockReset();
});

describe("getPersons", () => {
  it("passes trimmed search and isActive params", async () => {
    httpMock.get.mockResolvedValue({ data: sampleResponse });

    const result = await getPersons({ page: 2, pageSize: 20, search: "  John  ", isActive: true });

    expect(httpMock.get).toHaveBeenCalledWith("/api/Persons", {
      params: { page: 2, pageSize: 20, search: "John", isActive: true },
    });
    expect(result).toBe(sampleResponse);
  });

  it("omits optional params when not provided", async () => {
    httpMock.get.mockResolvedValue({ data: sampleResponse });

    await getPersons({ page: 1, pageSize: 5, search: "", isActive: null });

    expect(httpMock.get).toHaveBeenCalledWith("/api/Persons", {
      params: { page: 1, pageSize: 5 },
    });
  });
});

describe("mutations", () => {
  it("creates, updates, and deletes people", async () => {
    httpMock.post.mockResolvedValue({ data: sampleResponse.items[0] });
    httpMock.put.mockResolvedValue({});
    httpMock.delete.mockResolvedValue({});

    const created = await createPerson({
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@doe.com",
      phone: null,
      birthDate: null,
      documentNumber: "XYZ",
    });

    await updatePerson("1", {
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@doe.com",
      phone: null,
      birthDate: null,
      documentNumber: "XYZ",
      isActive: true,
    });

    await deletePerson("1");

    expect(httpMock.post).toHaveBeenCalledWith("/api/Persons", {
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@doe.com",
      phone: null,
      birthDate: null,
      documentNumber: "XYZ",
    });
    expect(created).toEqual(sampleResponse.items[0]);
    expect(httpMock.put).toHaveBeenCalledWith("/api/Persons/1", {
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@doe.com",
      phone: null,
      birthDate: null,
      documentNumber: "XYZ",
      isActive: true,
    });
    expect(httpMock.delete).toHaveBeenCalledWith("/api/Persons/1");
  });
});
