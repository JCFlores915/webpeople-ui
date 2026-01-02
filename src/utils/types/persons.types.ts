export type Person = {
  personId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  birthDate?: string | null; // "YYYY-MM-DD"
  documentNumber: string;
  createdDate?: string | null;
  updatedDate?: string | null;
  isActive: boolean;
};

export type CreatePersonRequest = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  birthDate?: string | null;
  documentNumber: string;
};

export type UpdatePersonRequest = CreatePersonRequest & {
  isActive: boolean;
};

export type PagedResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  search?: string | null;
  isActive?: boolean | null;
};
