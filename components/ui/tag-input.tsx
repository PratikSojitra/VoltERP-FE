import React, { useState, KeyboardEvent, ChangeEvent } from "react";
import { X } from "lucide-react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

interface TagInputProps {
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    className?: string;
    maxTags?: number;
    disabled?: boolean;
}

export function TagInput({
    value = [],
    onChange,
    placeholder = "Type and press Enter...",
    className,
    maxTags,
    disabled = false
}: TagInputProps) {
    const [inputValue, setInputValue] = useState("");

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTags(inputValue);
        } else if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
            e.preventDefault();
            const newValue = [...value];
            newValue.pop();
            onChange(newValue);
        }
    };

    const addTags = (input: string) => {
        const newTags = input
            .split(/[\n,]+/)
            .map(tag => tag.trim())
            .filter(tag => tag !== "" && !value.includes(tag));

        if (newTags.length === 0) return;

        let combined = [...value, ...newTags];
        if (maxTags && combined.length > maxTags) {
            combined = combined.slice(0, maxTags);
        }

        onChange(combined);
        setInputValue("");
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text");
        addTags(pasted);
    };

    const removeTag = (indexToRemove: number) => {
        if (disabled) return;
        onChange(value.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div className={cn("flex flex-wrap items-center gap-2 p-2 min-h-12 border border-input rounded-md bg-transparent focus-within:ring-1 focus-within:ring-ring shadow-sm", className)}>
            {value.map((tag, index) => (
                <div
                    key={`${tag}-${index}`}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full"
                >
                    <span>{tag}</span>
                    {!disabled && (
                        <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="text-primary hover:text-destructive transition-colors rounded-full p-0.5"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>
            ))}
            {!disabled && (!maxTags || value.length < maxTags) ? (
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    placeholder={value.length === 0 ? placeholder : ""}
                    className="flex-1 min-w-[120px] bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                />
            ) : null}
        </div>
    );
}
