"use client";

import { cn } from "@/lib/utils";

interface MobileShellProps {
    children: React.ReactNode;
    className?: string;
    /** Background gradient style */
    bg?: "default" | "blue" | "none";
}

/**
 * MobileShell — constrains all pages to a mobile-width container (430px max).
 * On desktop, the left/right sides show the base background color,
 * creating a vertical mobile-app focused aesthetic.
 */
export function MobileShell({ children, className, bg = "default" }: MobileShellProps) {
    const bgClass = bg === "blue"
        ? "sakhi-gradient-blue"
        : bg === "default"
            ? "sakhi-gradient-bg"
            : "";

    return (
        <div className="min-h-dvh bg-sakhi-bg">
            <div
                className={cn(
                    "mobile-shell",
                    bgClass,
                    className
                )}
            >
                {children}
            </div>
        </div>
    );
}
