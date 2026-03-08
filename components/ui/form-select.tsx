"use client";

import * as React from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Option {
    label: string;
    value: string;
}

interface FormSelectProps<T extends FieldValues> {
    name: Path<T>;
    control: Control<T>;
    label?: string;
    placeholder?: string;
    options: Option[];
    disabled?: boolean;
    required?: boolean;
    className?: string;
}

export function FormSelect<T extends FieldValues>({
    name,
    control,
    label,
    placeholder = "Select an option",
    options,
    disabled,
    required,
    className,
}: FormSelectProps<T>) {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState: { error } }) => (
                <div className={cn("space-y-1.5", className)}>
                    {label && (
                        <Label className={cn(error && "text-destructive")}>
                            {label} {required && <span className="text-destructive">*</span>}
                        </Label>
                    )}
                    <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={disabled}
                    >
                        <SelectTrigger className={cn("w-full", error && "border-destructive")}>
                            <SelectValue placeholder={placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                            {options.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {error && (
                        <p className="text-xs text-destructive">{error.message}</p>
                    )}
                </div>
            )}
        />
    );
}
