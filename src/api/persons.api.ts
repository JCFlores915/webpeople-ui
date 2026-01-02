import { http } from "./http";
import type { CreatePersonRequest, Person, UpdatePersonRequest, PagedResponse } from "../utils/types/persons.types";

export type PersonsQuery = {
  page: number;
  pageSize: number;
  search?: string;
  isActive?: boolean | null;
};

export async function getPersons(q: PersonsQuery): Promise<PagedResponse<Person>> {
  const params: Record<string, unknown> = { page: q.page, pageSize: q.pageSize };
  if (q.search?.trim()) params.search = q.search.trim();
  if (q.isActive !== null && q.isActive !== undefined) params.isActive = q.isActive;

  const res = await http.get("/api/persons", { params });
  return res.data;
}

export async function createPerson(payload: CreatePersonRequest): Promise<Person> {
  const res = await http.post("/api/persons", payload);
  return res.data;
}

export async function updatePerson(personId: string, payload: UpdatePersonRequest): Promise<void> {
  await http.put(`/api/persons/${personId}`, payload);
}

export async function deletePerson(personId: string): Promise<void> {
  await http.delete(`/api/persons/${personId}`);
}
