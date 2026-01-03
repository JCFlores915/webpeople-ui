import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PersonsPage from "./PersonsPage";
import type { PagedResponse, Person } from "@/utils/types/persons.types";

const apiMocks = vi.hoisted(() => ({
    getPersons: vi.fn(),
    createPerson: vi.fn(),
    updatePerson: vi.fn(),
    deletePerson: vi.fn(),
}));

const toastMock = vi.hoisted(() => Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }));

vi.mock("@/api/persons.api", () => ({
    getPersons: (...args: unknown[]) => apiMocks.getPersons(...args),
    createPerson: (...args: unknown[]) => apiMocks.createPerson(...args),
    updatePerson: (...args: unknown[]) => apiMocks.updatePerson(...args),
    deletePerson: (...args: unknown[]) => apiMocks.deletePerson(...args),
}));

vi.mock("sonner", () => ({ toast: toastMock }));

const samplePerson: Person = {
    personId: "1",
    firstName: "John",
    lastName: "Doe",
    email: "john@doe.com",
    phone: null,
    birthDate: null,
    documentNumber: "DOC-1",
    createdDate: null,
    updatedDate: null,
    isActive: true,
};

const sampleResponse: PagedResponse<Person> = {
    items: [samplePerson],
    page: 1,
    pageSize: 10,
    totalItems: 1,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
    search: null,
    isActive: null,
};

function createDeferred<T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}

function renderPage() {
    const client = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    return render(
        <QueryClientProvider client={client}>
            <PersonsPage />
        </QueryClientProvider>
    );
}

beforeEach(() => {
    apiMocks.getPersons.mockReset();
    apiMocks.createPerson.mockReset();
    apiMocks.updatePerson.mockReset();
    apiMocks.deletePerson.mockReset();
    toastMock.mockClear();
    toastMock.success.mockClear();
    toastMock.error.mockClear();
});

describe("PersonsPage", () => {
    it("renders skeleton while loading and then shows rows", async () => {
        const deferred = createDeferred<PagedResponse<Person>>();
        apiMocks.getPersons.mockReturnValueOnce(deferred.promise);

        renderPage();

        expect(document.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0);

        deferred.resolve(sampleResponse);

        await waitFor(() => {
            expect(screen.getByText("John Doe")).toBeInTheDocument();
        });
    });

    it("opens sheet for creating a person", async () => {
        apiMocks.getPersons.mockResolvedValue(sampleResponse);

        renderPage();

        await screen.findByText("John Doe");
        await userEvent.click(screen.getByRole("button", { name: /new person/i }));

        expect(screen.getByText("Create person")).toBeInTheDocument();
    });

    it("submits update when editing a person", async () => {
        apiMocks.getPersons.mockResolvedValue(sampleResponse);
        apiMocks.updatePerson.mockResolvedValue({});

        renderPage();

        await screen.findByText("John Doe");
        await userEvent.click(screen.getByRole("button", { name: /edit/i }));
        await userEvent.click(screen.getByRole("button", { name: /save changes/i }));

        await waitFor(() => {
            expect(apiMocks.updatePerson).toHaveBeenCalledWith("1", {
                firstName: "John",
                lastName: "Doe",
                email: "john@doe.com",
                phone: null,
                birthDate: null,
                documentNumber: "DOC-1",
                isActive: true,
            });
        });
    });
});
