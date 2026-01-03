import React from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

const HEADER_H = 64;
const FOOTER_H = 64;

export function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-screen bg-background text-foreground">
            <div className="fixed inset-x-0 top-0 z-50 h-16">
                <Header />
            </div>

            <div className="fixed inset-x-0 bottom-0 z-50 h-16">
                <Footer />
            </div>

            <main
                className="h-full overflow-y-auto"
                style={{ paddingTop: HEADER_H, paddingBottom: FOOTER_H }}
            >
                <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
                    {children}
                </div>
            </main>
        </div>
    );
}
