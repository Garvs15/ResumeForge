"use client";

import { logout } from "@/app/auth/login/actions";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
    className?: string;
}

export function LogoutButton({ className }: LogoutButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleLogOut = async () => {
        try {
            setIsLoading(true);
            await logout();
        } catch (error) {
            toast({
                title: "Error Signing Out",
                description: "Please try again",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant="ghost"
            className={cn(
                "flex items-center gap-1.5 px-3 py-1",
                "text-sm font-medium text-purple-600/80 hover:text-purple-800",
                "transition-colors duration-200",
                className
            )}
            onClick={handleLogOut}
            disabled={isLoading}
        >
            <LogOut className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isLoading ? 'Signing Out...' : 'LogOut'}</span>
        </Button>
    );
}