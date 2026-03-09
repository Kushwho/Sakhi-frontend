"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <ProfileProvider>{children}</ProfileProvider>
        </AuthProvider>
    );
}
