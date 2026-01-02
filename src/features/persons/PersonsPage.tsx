import { useMemo, useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import type { Person, CreatePersonRequest, UpdatePersonRequest } from "@/utils/types/persons.types";
import { getPersons, createPerson, updatePerson, deletePerson } from "@/api/persons.api";
import { getApiError } from "@/api/http";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Plus, Search, PhoneOff, Pencil, Trash2 } from "lucide-react";
import PersonSheetForm from "./PersonSheetForm";

function useDebounced<T>(value: T, delay = 350) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);
    return debounced;
}

function useIsMobile(breakpointPx = 640) {
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpointPx);
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < breakpointPx);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [breakpointPx]);
    return isMobile;
}

export default function PersonsPage() {
    const qc = useQueryClient();
    const isMobile = useIsMobile();

    // Query state
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState("");
    const [isActive, setIsActive] = useState<"active" | "inactive" | "all">("active");

    const debouncedSearch = useDebounced(search, 350);

    // Sheet state
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Person | null>(null);

    const isActiveFilter = isActive === "all" ? null : isActive === "active";

    const queryKey = useMemo(
        () => ["persons", { page, pageSize, search: debouncedSearch, isActive: isActiveFilter }],
        [page, pageSize, debouncedSearch, isActiveFilter]
    );

    const personsQ = useQuery({
        queryKey,
        queryFn: () => getPersons({ page, pageSize, search: debouncedSearch, isActive: isActiveFilter }),
        placeholderData: (prev) => prev,
    });

    const data = personsQ.data;
    const items = data?.items ?? [];
    const total = Number(data?.totalItems ?? 0);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    // MUTATIONS
    const createM = useMutation({
        mutationFn: (payload: CreatePersonRequest) => createPerson(payload),
        onSuccess: async () => {
            toast.success("Person created");
            setOpen(false);
            await qc.invalidateQueries({ queryKey: ["persons"] });
        },
        onError: (err) => {
            const e = getApiError(err);
            toast.error("Create failed", { description: e.message });
        },
    });

    const updateM = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdatePersonRequest }) => updatePerson(id, payload),
        onSuccess: async () => {
            toast.success("Person updated");
            setOpen(false);
            setEditing(null);
            await qc.invalidateQueries({ queryKey: ["persons"] });
        },
        onError: (err) => {
            const e = getApiError(err);
            toast.error("Update failed", { description: e.message });
        },
    });

    const deleteM = useMutation({
        mutationFn: (id: string) => deletePerson(id),
        onSuccess: async () => {
            toast.success("Person deleted");
            await qc.invalidateQueries({ queryKey: ["persons"] });
        },
        onError: (err) => {
            const e = getApiError(err);
            toast.error("Delete failed", { description: e.message });
        },
    });

    const busy =
        personsQ.isFetching || createM.isPending || updateM.isPending || deleteM.isPending;

    const openCreate = () => {
        setEditing(null);
        setOpen(true);
    };

    const openEdit = (p: Person) => {
        setEditing(p);
        setOpen(true);
    };

    const statusBadge = (active: boolean) =>
        active ? (
            <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15">ACTIVE</Badge>
        ) : (
            <Badge variant="destructive">INACTIVE</Badge>
        );

    const phoneBadge = (phone?: string | null) =>
        phone?.trim() ? (
            <span className="text-sm text-foreground">{phone}</span>
        ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-1 text-xs font-medium text-amber-700">
                <PhoneOff className="h-3.5 w-3.5" /> No phone
            </span>
        );

    return (
        <div className="min-h-screen bg-background">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(80%_60%_at_50%_0%,hsl(var(--muted))_0%,transparent_60%)]" />
            <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="space-y-5"
                >
                    {/* Header */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div className="space-y-1">
                            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
                                People Catalog
                            </h1>
                        </div>

                        <div className="flex items-center gap-2">
                            <ThemeToggle />
                            <Button
                                onClick={openCreate}
                                className="h-11 gap-2 rounded-xl"
                                disabled={busy}
                            >
                                <Plus className="h-4 w-4" />
                                New person
                            </Button>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <Card className="rounded-2xl border-slate-200/70 p-4 shadow-sm">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    value={search}
                                    onChange={(e) => {
                                        setPage(1);
                                        setSearch(e.target.value);
                                    }}
                                    placeholder="Search by name, email, document..."
                                    className="h-11 rounded-xl pl-10"
                                />
                            </div>

                            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                                <Select
                                    value={isActive}
                                    onValueChange={(v) => {
                                        setPage(1);
                                        setIsActive(v as "active" | "inactive" | "all");
                                    }}
                                >
                                    <SelectTrigger className="h-11 w-full rounded-xl sm:w-45">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="all">All</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={String(pageSize)}
                                    onValueChange={(v) => {
                                        setPage(1);
                                        setPageSize(Number(v));
                                    }}
                                >
                                    <SelectTrigger className="h-11 w-full rounded-xl sm:w-37.5">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[5, 10, 20, 50, 100].map((n) => (
                                            <SelectItem key={n} value={String(n)}>
                                                {n} / page
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </Card>

                    {/* Content */}
                    <Card className="rounded-2xl border-slate-200/70 p-0 shadow-sm">
                        {/* Loading / Error */}
                        {personsQ.isLoading ? (
                            <div className="p-4 sm:p-6">
                                <div className="space-y-3">
                                    <Skeleton className="h-6 w-48 rounded-lg" />
                                    <Skeleton className="h-11 w-full rounded-xl" />
                                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                        {Array.from({ length: isMobile ? 3 : 6 }).map((_, i) => (
                                            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : personsQ.isError ? (
                            <div className="p-6">
                                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                    {getApiError(personsQ.error).message}
                                </div>
                            </div>
                        ) : items.length === 0 ? (
                            <div className="p-10 text-center">
                                <div className="mx-auto max-w-sm space-y-2">
                                    <p className="text-base font-medium text-foreground">No results</p>
                                    <p className="text-sm text-foreground/70">
                                        Try adjusting your search or filters.
                                    </p>
                                    <div className="pt-2">
                                        <Button onClick={openCreate} className="rounded-xl">
                                            Create first person
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table */}
                                {!isMobile ? (
                                    <div className="p-4 sm:p-6">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="border-slate-200/70">
                                                    <TableHead className="w-65">Name</TableHead>
                                                    <TableHead>Email</TableHead>
                                                    <TableHead className="w-42.5">Phone</TableHead>
                                                    <TableHead className="w-42.5">Document</TableHead>
                                                    <TableHead className="w-30">Status</TableHead>
                                                    <TableHead className="w-42.5" />
                                                </TableRow>
                                            </TableHeader>

                                            <TableBody>
                                                <AnimatePresence initial={false}>
                                                    {items.map((p) => (
                                                        <motion.tr
                                                            key={p.personId}
                                                            initial={{ opacity: 0, y: 6 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -6 }}
                                                            transition={{ duration: 0.18 }}
                                                            className="border-b border-slate-200/60"
                                                        >
                                                            <TableCell className="py-4">
                                                                <div className="font-medium text-foreground">
                                                                    {p.firstName} {p.lastName}
                                                                </div>
                                                            </TableCell>

                                                            <TableCell className="py-4 text-foreground">{p.email}</TableCell>
                                                            <TableCell className="py-4 text-foreground">{phoneBadge(p.phone)}</TableCell>
                                                            <TableCell className="py-4">
                                                                <span className="text-sm text-foreground">{p.documentNumber}</span>
                                                            </TableCell>
                                                            <TableCell className="py-4">{statusBadge(p.isActive)}</TableCell>

                                                            <TableCell className="py-4">
                                                                {p.isActive ? (
                                                                    <div className="flex justify-end gap-2">
                                                                        <Button
                                                                            variant="secondary"
                                                                            className="h-9 rounded-xl"
                                                                            disabled={busy}
                                                                            onClick={() => openEdit(p)}
                                                                        >
                                                                            <Pencil className="mr-2 h-4 w-4" />
                                                                            Edit
                                                                        </Button>

                                                                        <Button
                                                                            variant="destructive"
                                                                            className="h-9 rounded-xl"
                                                                            disabled={busy}
                                                                            onClick={() => {
                                                                                toast("Delete person?", {
                                                                                    description:
                                                                                        "This action will mark the person as inactive (soft delete).",
                                                                                    action: {
                                                                                        label: deleteM.isPending ? "Deleting..." : "Confirm",
                                                                                        onClick: () => deleteM.mutate(p.personId),
                                                                                    },
                                                                                });
                                                                            }}
                                                                        >
                                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                                            Delete
                                                                        </Button>
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-right text-sm text-slate-500">—</div>
                                                                )}
                                                            </TableCell>
                                                        </motion.tr>
                                                    ))}
                                                </AnimatePresence>
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    /* Mobile Cards */
                                    <div className="p-4">
                                        <div className="grid gap-3">
                                            <AnimatePresence initial={false}>
                                                {items.map((p) => (
                                                    <motion.div
                                                        key={p.personId}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="rounded-2xl border border-slate-200/70  p-4 shadow-sm"
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                <div className="text-base font-semibold text-foreground">
                                                                    {p.firstName} {p.lastName}
                                                                </div>
                                                                <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">{p.email}</div>
                                                            </div>
                                                            {statusBadge(p.isActive)}
                                                        </div>

                                                        <Separator className="my-3" />

                                                        <div className="flex flex-wrap gap-2">
                                                            {phoneBadge(p.phone)}
                                                            <Badge variant="secondary" className="rounded-full">
                                                                {p.documentNumber}
                                                            </Badge>
                                                        </div>

                                                        {p.isActive && (
                                                            <div className="mt-4 flex gap-2">
                                                                <Button
                                                                    variant="secondary"
                                                                    className="h-10 flex-1 rounded-xl"
                                                                    disabled={busy}
                                                                    onClick={() => openEdit(p)}
                                                                >
                                                                    <Pencil className="mr-2 h-4 w-4" />
                                                                    Edit
                                                                </Button>
                                                                <Button
                                                                    variant="destructive"
                                                                    className="h-10 flex-1 rounded-xl"
                                                                    disabled={busy}
                                                                    onClick={() => deleteM.mutate(p.personId)}
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                )}

                                {/* Footer Pagination */}
                                <div className="flex flex-col gap-3 border-t border-slate-200/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="text-sm text-foreground">
                                        Showing{" "}
                                        <span className="font-medium text-foreground">{items.length}</span>{" "}
                                        of{" "}
                                        <span className="font-medium text-foreground">{total}</span>
                                    </div>

                                    <div className="flex items-center justify-between gap-2 sm:justify-end">
                                        <Button
                                            variant="secondary"
                                            className="h-10 rounded-xl"
                                            disabled={busy || page <= 1}
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        >
                                            Prev
                                        </Button>

                                        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                                            Page <span className="font-medium text-slate-900">{page}</span> / {totalPages}
                                        </div>

                                        <Button
                                            variant="secondary"
                                            className="h-10 rounded-xl"
                                            disabled={busy || page >= totalPages}
                                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </Card>
                </motion.div>

                <PersonSheetForm
                    open={open}
                    busy={createM.isPending || updateM.isPending}
                    editing={editing}
                    onOpenChange={(v) => {
                        setOpen(v);
                        if (!v) setEditing(null);
                    }}
                    onCreate={(payload) => createM.mutate(payload)}
                    onUpdate={(id, payload) => updateM.mutate({ id, payload })}
                />
            </div>
        </div>
    );
}
