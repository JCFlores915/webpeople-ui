

export function Footer() {
    const year = new Date().getFullYear();
    const env = import.meta.env.MODE;



    return (
        <footer className="h-16 border-t border-border bg-background/60 backdrop-blur">
            <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between px-4 sm:px-6">
                <p className="text-sm text-muted-foreground">
                    © {year} — Developed by <span className="text-foreground font-medium">Juan Carlos Flores</span>
                </p>

                <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                    <span className="rounded-full border border-border bg-card px-3 py-1 text-xs">
                        Env: {env}
                    </span>
                </div>
            </div>
        </footer>
    );
}
