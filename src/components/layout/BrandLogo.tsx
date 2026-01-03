import { motion } from "framer-motion";
import logoWhite from "@/assets/logo-white.png";
import logoBlack from "@/assets/logo-black.png";
import { useTheme } from "@/components/theme/useTheme";
export function BrandLogo() {

    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
        <motion.div
            className="flex items-center gap-2 select-none"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
        >

            <div className="leading-tight">
                <img
                    src={isDark ? logoWhite : logoBlack}
                    alt="Logo"
                    className=" h-full w-32 object-contain "
                    draggable={false}
                />
            </div>
        </motion.div>
    );
}
