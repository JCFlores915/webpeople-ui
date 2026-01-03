import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import PersonSheetForm from "./PersonSheetForm";
import type { Person } from "@/utils/types/persons.types";

const baseProps = () => ({
    open: true,
    busy: false,
    editing: null as Person | null,
    onOpenChange: vi.fn(),
    onCreate: vi.fn(),
    onUpdate: vi.fn(),
});

describe("PersonSheetForm", () => {
    it("shows validation errors when submitting empty form", async () => {
        const props = baseProps();
        render(<PersonSheetForm {...props} />);

        await userEvent.click(screen.getByRole("button", { name: /create/i }));

        const minErrors = await screen.findAllByText("Min 2 characters");
        expect(minErrors.length).toBeGreaterThanOrEqual(2);
        expect(screen.getByText("Invalid email")).toBeInTheDocument();
        expect(screen.getByText("Document number is required")).toBeInTheDocument();
        expect(props.onCreate).not.toHaveBeenCalled();
    });

    it("submits trimmed payload for create", async () => {
        const props = baseProps();
        render(<PersonSheetForm {...props} />);

        await userEvent.type(screen.getByPlaceholderText("John"), "  John");
        await userEvent.type(screen.getByPlaceholderText("Doe"), " Doe  ");
        await userEvent.type(screen.getByPlaceholderText("john.doe@example.com"), " john@doe.com ");
        await userEvent.type(screen.getByPlaceholderText("+505..."), "   ");
        await userEvent.type(screen.getByLabelText(/Birth date/i), "1990-01-02");
        await userEvent.type(screen.getByPlaceholderText("ID-0001"), "  ABC123  ");

        await userEvent.click(screen.getByRole("button", { name: /create/i }));

        await waitFor(() => {
            expect(props.onCreate).toHaveBeenCalledWith({
                firstName: "John",
                lastName: "Doe",
                email: "john@doe.com",
                phone: null,
                birthDate: "1990-01-02",
                documentNumber: "ABC123",
            });
        });
    });

    it("invokes update with toggled active flag in edit mode", async () => {
        const editing: Person = {
            personId: "99",
            firstName: "Ada",
            lastName: "Lovelace",
            email: "ada@math.io",
            phone: "+100",
            birthDate: "1815-12-10",
            documentNumber: "DOC-1",
            createdDate: null,
            updatedDate: null,
            isActive: true,
        };

        const props = { ...baseProps(), editing, onUpdate: vi.fn() };
        render(<PersonSheetForm {...props} />);

        await userEvent.click(screen.getByRole("switch"));
        await userEvent.click(screen.getByRole("button", { name: /save changes/i }));

        await waitFor(() => {
            expect(props.onUpdate).toHaveBeenCalledWith("99", {
                firstName: "Ada",
                lastName: "Lovelace",
                email: "ada@math.io",
                phone: "+100",
                birthDate: "1815-12-10",
                documentNumber: "DOC-1",
                isActive: false,
            });
        });
    });
});
