import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";

import type { CreatePersonRequest, Person, UpdatePersonRequest } from "@/utils/types/persons.types";
import { cn } from "@/lib/utils";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

import { Loader2, User2, Mail, Phone, IdCard, CalendarDays } from "lucide-react";

type Props = {
    open: boolean;
    busy: boolean;
    editing: Person | null;
    onOpenChange: (open: boolean) => void;
    onCreate: (payload: CreatePersonRequest) => void;
    onUpdate: (id: string, payload: UpdatePersonRequest) => void;
};

function useIsMobile(breakpointPx = 640) {
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpointPx);
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < breakpointPx);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [breakpointPx]);
    return isMobile;
}

const schema = z.object({
    firstName: z.string().trim().min(2, "Min 2 characters"),
    lastName: z.string().trim().min(2, "Min 2 characters"),
    email: z.string().trim().email("Invalid email"),
    phone: z.string().trim().optional(),
    birthDate: z
        .string()
        .optional()
        .refine((v) => !v || dayjs(v, "YYYY-MM-DD", true).isValid(), "Invalid date"),
    documentNumber: z.string().trim().min(1, "Document number is required"),
    isActive: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="text-xs text-red-600">{message}</p>;
}

export default function PersonSheetForm({
    open,
    busy,
    editing,
    onOpenChange,
    onCreate,
    onUpdate,
}: Props) {
    const isEdit = !!editing;
    const isMobile = useIsMobile();
    const side = isMobile ? "bottom" : "right";

    const defaultValues = useMemo<FormValues>(() => {
        return {
            firstName: editing?.firstName ?? "",
            lastName: editing?.lastName ?? "",
            email: editing?.email ?? "",
            phone: editing?.phone ?? "",
            birthDate: editing?.birthDate ? dayjs(editing.birthDate).format("YYYY-MM-DD") : "",
            documentNumber: editing?.documentNumber ?? "",
            isActive: editing?.isActive ?? true,
        };
    }, [editing]);

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues,
        mode: "onBlur",
    });

    const isActiveValue = useWatch({
        control: form.control,
        name: "isActive",
    });


    useEffect(() => {
        if (open) form.reset(defaultValues);
    }, [open, defaultValues, form]);

    const submit = form.handleSubmit((v) => {
        if (busy) return;

        const payloadBase: CreatePersonRequest = {
            firstName: v.firstName.trim(),
            lastName: v.lastName.trim(),
            email: v.email.trim(),
            phone: v.phone?.trim() ? v.phone.trim() : null,
            birthDate: v.birthDate?.trim() ? v.birthDate.trim() : null,
            documentNumber: v.documentNumber.trim(),
        };

        if (!editing) onCreate(payloadBase);
        else onUpdate(editing.personId, { ...payloadBase, isActive: !!v.isActive });
    });

    const initials = useMemo(() => {
        const a = (defaultValues.firstName?.[0] ?? "").toUpperCase();
        const b = (defaultValues.lastName?.[0] ?? "").toUpperCase();
        return (a + b).trim() || "U";
    }, [defaultValues.firstName, defaultValues.lastName]);

    return (
        <Sheet
            open={open}
            onOpenChange={(v) => {
                if (busy) return;
                onOpenChange(v);
            }}
        >
            <SheetContent
                side={side as "right" | "bottom"}
                className={cn(
                    "p-0",
                    // Desktop: ancho controlado + full height
                    !isMobile && "w-full sm:max-w-140",
                    // Mobile: sheet tipo bottom, alto controlado, esquina redondeada
                    isMobile && "h-[92vh] rounded-t-2xl"
                )}
                // ✅ Evita cerrar mientras busy (click outside / ESC)
                onEscapeKeyDown={(e) => busy && e.preventDefault()}
                onPointerDownOutside={(e) => busy && e.preventDefault()}
            >
                <div className="flex h-full flex-col">
                    {isMobile && (
                        <div className="flex justify-center pt-2">
                            <div className="h-1.5 w-10 rounded-full bg-slate-200 dark:bg-slate-700" />
                        </div>
                    )}

                    {/* Header (sticky) */}
                    <div className="sticky top-0 z-10 border-b border-border bg-background/80 px-6 py-4 backdrop-blur">
                        <SheetHeader>
                            <SheetTitle className="text-xl">
                                {isEdit ? "Edit person" : "Create person"}
                            </SheetTitle>
                            <SheetDescription>
                                {isEdit
                                    ? "Update the record with safe validation and consistent UX."
                                    : "Create a new record with clean validation and great UX."}
                            </SheetDescription>
                        </SheetHeader>
                    </div>

                    {/* Body (scrollable) */}
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                        <motion.form
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            onSubmit={submit}
                            className="space-y-5"
                        >
                            {isEdit && (
                                <Card className="rounded-2xl border-slate-200/70 p-4 dark:border-slate-800/70">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                            {initials}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
                                                {defaultValues.firstName} {defaultValues.lastName}
                                            </p>
                                            <p className="truncate text-xs text-slate-600 dark:text-slate-400">
                                                {defaultValues.email}
                                            </p>

                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {defaultValues.isActive ? (
                                                    <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-300">
                                                        ACTIVE
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="destructive">INACTIVE</Badge>
                                                )}
                                                <Badge variant="secondary" className="rounded-full">
                                                    {defaultValues.documentNumber}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            )}

                            <Separator />

                            {/* Fields */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2" htmlFor="firstName">
                                        <User2 className="h-4 w-4 text-slate-500" />
                                        First name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="firstName"
                                        disabled={busy}
                                        placeholder="John"
                                        {...form.register("firstName")}
                                        className={cn(
                                            "h-11 rounded-xl",
                                            form.formState.errors.firstName && "border-red-500 focus-visible:ring-red-500"
                                        )}
                                    />
                                    <FieldError message={form.formState.errors.firstName?.message} />
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2" htmlFor="lastName">
                                        <User2 className="h-4 w-4 text-slate-500" />
                                        Last name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="lastName"
                                        disabled={busy}
                                        placeholder="Doe"
                                        {...form.register("lastName")}
                                        className={cn(
                                            "h-11 rounded-xl",
                                            form.formState.errors.lastName && "border-red-500 focus-visible:ring-red-500"
                                        )}
                                    />
                                    <FieldError message={form.formState.errors.lastName?.message} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2" htmlFor="email">
                                    <Mail className="h-4 w-4 text-slate-500" />
                                    Email <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="email"
                                    disabled={busy}
                                    placeholder="john.doe@example.com"
                                    {...form.register("email")}
                                    className={cn(
                                        "h-11 rounded-xl",
                                        form.formState.errors.email && "border-red-500 focus-visible:ring-red-500"
                                    )}
                                />
                                <FieldError message={form.formState.errors.email?.message} />
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2" htmlFor="phone">
                                        <Phone className="h-4 w-4 text-slate-500" />
                                        Phone
                                    </Label>
                                    <Input
                                        id="phone"
                                        disabled={busy}
                                        placeholder="+505..."
                                        {...form.register("phone")}
                                        className="h-11 rounded-xl"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2" htmlFor="birthDate">
                                        <CalendarDays className="h-4 w-4 text-slate-500" />
                                        Birth date
                                    </Label>
                                    <Input
                                        id="birthDate"
                                        disabled={busy}
                                        type="date"
                                        {...form.register("birthDate")}
                                        className={cn(
                                            "h-11 rounded-xl",
                                            form.formState.errors.birthDate && "border-red-500 focus-visible:ring-red-500"
                                        )}
                                    />
                                    <FieldError message={form.formState.errors.birthDate?.message} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2" htmlFor="documentNumber">
                                    <IdCard className="h-4 w-4 text-slate-500" />
                                    Document number <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="documentNumber"
                                    disabled={busy}
                                    placeholder="ID-0001"
                                    {...form.register("documentNumber")}
                                    className={cn(
                                        "h-11 rounded-xl",
                                        form.formState.errors.documentNumber && "border-red-500 focus-visible:ring-red-500"
                                    )}
                                />
                                <FieldError message={form.formState.errors.documentNumber?.message} />
                            </div>

                            {isEdit && (
                                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                                            Active
                                        </p>
                                        <p className="text-xs text-slate-600 dark:text-slate-400">
                                            Inactive users cannot be edited/deleted.
                                        </p>
                                    </div>
                                    <Switch
                                        disabled={busy}
                                        checked={!!isActiveValue}
                                        onCheckedChange={(v) => form.setValue("isActive", v, { shouldDirty: true })}
                                    />

                                </div>
                            )}

                            {/* Spacer para que el contenido no quede debajo del footer sticky */}
                            <div className="h-2" />
                        </motion.form>
                    </div>

                    {/* Footer (sticky) */}
                    <div className="sticky bottom-0 z-10 border-t border-border bg-background/80 px-6 py-4 backdrop-blur">
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                className="h-11 flex-1 rounded-xl"
                                disabled={busy}
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>

                            <Button
                                type="button"
                                className="h-11 flex-1 rounded-xl"
                                disabled={busy}
                                onClick={() => submit()}
                            >
                                {busy ? (
                                    <span className="inline-flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        {isEdit ? "Updating..." : "Creating..."}
                                    </span>
                                ) : (
                                    <span>{isEdit ? "Save changes" : "Create"}</span>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
