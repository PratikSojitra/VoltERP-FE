"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    maxWidth?: string;
    onSubmit?: (e: React.FormEvent) => void;
    className?: string;
}

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    footer,
    maxWidth = "sm:max-w-xl",
    onSubmit,
    className
}: ModalProps) {
    const content = (
        <>
            <div className={cn("px-6 pb-6", className)}>
                {children}
            </div>
            {footer && (
                <DialogFooter className="m-0 px-6 py-2 border-t border-border bg-muted/30">
                    {footer}
                </DialogFooter>
            )}
        </>
    );

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className={cn(maxWidth, "p-0 overflow-hidden flex flex-col")}>
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
                </DialogHeader>
                {onSubmit ? (
                    <form className="flex flex-col flex-1" onSubmit={onSubmit}>
                        {content}
                    </form>
                ) : (
                    <div className="flex flex-col flex-1">
                        {content}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
