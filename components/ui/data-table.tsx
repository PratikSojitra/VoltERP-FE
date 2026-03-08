"use client"
import { ChevronLeft, ChevronRight } from "lucide-react"

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    page?: number
    totalPages?: number
    onPageChange?: (page: number) => void
}

export function DataTable<TData, TValue>({
    columns,
    data,
    page,
    totalPages,
    onPageChange,
}: DataTableProps<TData, TValue>) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden text-sm w-full block">
            <Table>
                <TableHeader className="bg-muted/50 text-muted-foreground">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-border">
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id} className="px-6 py-4 font-medium h-auto">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                )
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody className="divide-y divide-border">
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                                className="hover:bg-muted/30 transition-colors group"
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id} className="px-6 py-4">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                                No results found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            {page && totalPages && onPageChange && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
                    <div className="text-sm text-muted-foreground flex-1">
                        Page {page} of {totalPages}
                    </div>
                    <div className="flex items-center gap-2 flex-1 justify-end">
                        <button
                            onClick={() => onPageChange(page - 1)}
                            disabled={page <= 1}
                            className="p-1 rounded-md text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => onPageChange(page + 1)}
                            disabled={page >= totalPages}
                            className="p-1 rounded-md text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
