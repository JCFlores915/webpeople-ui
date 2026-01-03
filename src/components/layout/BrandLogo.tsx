import { motion } from "framer-motion";
import { Users } from "lucide-react";

export function BrandLogo() {
    return (
        <motion.div
            className="flex items-center gap-2 select-none"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
        >
            <motion.div
                whileHover={{ rotate: 8, scale: 1.03 }}
                transition={{ type: "spring", stiffness: 500, damping: 18 }}
                className="flex h-9 w-9 items-center justify-center rounded-2xl border border-border bg-card"
                aria-hidden="true"
            >
                <Users className="h-4 w-4" />
            </motion.div>

            <div className="leading-tight">
                <p className="text-sm font-semibold tracking-tight text-foreground">
                    WebApiPeople
                </p>
                <p className="text-[11px] text-muted-foreground">
                    People Catalog Dashboard
                </p>
            </div>
        </motion.div>
    );
}
