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
    ComboboxChips,
    ComboboxChip,
    ComboboxChipsInput,
    useComboboxAnchor
} from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Option {
    label: string;
    value: string;
}

interface FormMultiComboboxProps<T extends FieldValues> {
    name: Path<T>;
    control: Control<T>;
    label?: string;
    placeholder?: string;
    options: Option[];
    disabled?: boolean;
    required?: boolean;
    className?: string;
    onChange?: (value: string[]) => void;
    maxCount?: number;
}

export function FormMultiCombobox<T extends FieldValues>({
    name,
    control,
    label,
    placeholder = "Select options...",
    options,
    disabled,
    required,
    className,
    onChange,
    maxCount,
}: FormMultiComboboxProps<T>) {
    const anchorRef = useComboboxAnchor();

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState: { error } }) => {
                const values = Array.isArray(field.value) ? field.value : [];
                const selectedOptions = options.filter((o) => values.includes(o.value));

                return (
                    <div className={cn("space-y-1.5", className)}>
                        {label && (
                            <Label className={cn(error && "text-destructive")}>
                                {label} {required && <span className="text-destructive">*</span>}
                            </Label>
                        )}
                        <Combobox
                            multiple
                            value={selectedOptions}
                            onValueChange={(newOptions: any[]) => {
                                const newValues = newOptions.map(o => o.value);
                                if (maxCount && newValues.length > maxCount) return;
                                
                                field.onChange(newValues);
                                if (onChange) {
                                    onChange(newValues);
                                }
                            }}
                            disabled={disabled}
                        >
                            <div ref={anchorRef}>
                                <ComboboxChips className={cn("w-full min-h-10", error && "border-destructive")}>
                                    {selectedOptions.map((opt) => (
                                        <ComboboxChip key={opt.value} value={opt}>
                                            {opt.label}
                                        </ComboboxChip>
                                    ))}
                                    <ComboboxChipsInput placeholder={values.length === 0 ? placeholder : ""} />
                                </ComboboxChips>
                            </div>
                            <ComboboxContent anchor={anchorRef}>
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
