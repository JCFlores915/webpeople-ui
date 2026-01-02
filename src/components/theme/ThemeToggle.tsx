import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme/useTheme";

export function ThemeToggle() {
    const { theme, toggle } = useTheme();

    return (
        <Button variant="ghost" size="icon" onClick={toggle} className="rounded-xl" aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
    );
}
