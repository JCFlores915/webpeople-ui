import { BrandLogo } from "./BrandLogo";
import { ProfileMenu } from "./ProfileMenu";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function Header() {

    const user = {
        name: "Juan Carlos Flores",
        role: "FullStack Developer",
    };

    return (
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur">
            <div className="mx-auto grid h-16 w-full max-w-6xl grid-cols-2 items-center px-4 sm:px-6">
                <div className="flex justify-start">
                    <BrandLogo />
                </div>

                <div className="flex items-center justify-end gap-2">
                    <ThemeToggle />
                    <ProfileMenu user={user} />
                </div>
            </div>
        </header>
    );
}
