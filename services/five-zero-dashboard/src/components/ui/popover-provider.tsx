import React from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';

interface PopoverProviderProps {
    children: React.ReactNode;
}

export function PopoverProvider({ children }: PopoverProviderProps) {
    return <TooltipProvider>{children}</TooltipProvider>;
}