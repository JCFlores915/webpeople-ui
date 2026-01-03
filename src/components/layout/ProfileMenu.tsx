import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Github, Linkedin } from "lucide-react";

type UserInfo = {
    name: string;
    role?: string;
    avatarUrl?: string;
};

export function ProfileMenu({ user }: { user: UserInfo }) {
    const initials =
        user.name
            .split(" ")
            .slice(0, 2)
            .map((x) => x[0]?.toUpperCase())
            .join("") || "U";
    console.log(user);
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="h-10 gap-2 rounded-2xl px-2 hover:bg-muted/60"
                >
                    <motion.div whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 500, damping: 22 }}>
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                    </motion.div>

                    <div className="hidden text-left sm:block">
                        <p className="text-sm font-medium leading-4 text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.role ?? "User"}</p>
                    </div>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 rounded-2xl">
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Networks
                </DropdownMenuLabel>

                <DropdownMenuItem className="gap-2"
                    onClick={() => window.open("www.linkedin.com/in/jcfloresdev", "_blank")}
                >
                    <Linkedin className="h-4 w-4" />
                    Linkedin
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    className="gap-2"
                    onClick={() => window.open("https://github.com/JCFlores915", "_blank")}
                >
                    <Github className="h-4 w-4" />
                    GitHub
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
