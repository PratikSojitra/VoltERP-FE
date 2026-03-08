"use client";

import * as React from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import {
    Combobox,
    ComboboxInput,
    ComboboxContent,
    ComboboxList,
    ComboboxItem,
    ComboboxEmpty,
} from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Option {
    label: string;
    value: string;
}

interface FormComboboxProps<T extends FieldValues> {
    name: Path<T>;
    control: Control<T>;
    label?: string;
    placeholder?: string;
    options: Option[];
    disabled?: boolean;
    required?: boolean;
    className?: string;
    onChange?: (value: string) => void;
}

export function FormCombobox<T extends FieldValues>({
    name,
    control,
    label,
    placeholder = "Search...",
    options,
    disabled,
    required,
    className,
    onChange,
}: FormComboboxProps<T>) {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState: { error } }) => {
                const selectedOption = options.find((o) => o.value === field.value) || null;

                return (
                    <div className={cn("space-y-1.5", className)}>
                        {label && (
                            <Label className={cn(error && "text-destructive")}>
                                {label} {required && <span className="text-destructive">*</span>}
                            </Label>
                        )}
                        <Combobox
                            value={selectedOption}
                            onValueChange={(val: any) => {
                                const newValue = val ? val.value : "";
                                field.onChange(newValue);
                                if (onChange) {
                                    onChange(newValue);
                                }
                            }}
                            disabled={disabled}
                        >
                            <ComboboxInput
                                placeholder={placeholder}
                                className={cn("w-full h-10", error && "border-destructive")}
                            />
                            <ComboboxContent>
                                <ComboboxList>
                                    <ComboboxEmpty>No results found.</ComboboxEmpty>
                                    {options.map((option) => (
                                        <ComboboxItem key={option.value} value={option}>
                                            {option.label}
                                        </ComboboxItem>
                                    ))}
                                </ComboboxList>
                            </ComboboxContent>
                        </Combobox>
                        {error && (
                            <p className="text-xs text-destructive">{error.message}</p>
                        )}
                    </div>
                );
            }}
        />
    );
}
