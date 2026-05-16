// src/app/dashboard/inventory/page.tsx
"use client";
import { API_BASE_URL } from "@/lib/api";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import {
    createColumnHelper, flexRender, getCoreRowModel, useReactTable, getSortedRowModel
} from "@tanstack/react-table";
import { Plus, Search, Package, AlertTriangle, Edit, Trash2 } from "lucide-react";

type Product = {
    id: string;
    name: string;
    sku: string;
    category: string;
    price: number;
    stockQty: number;
    lowStock: number;
};

const columnHelper = createColumnHelper<Product>();

export default function InventoryPage() {
    const { token } = useAuthStore();
    const [data, setData] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch real data from backend
    const fetchInventory = async () => {
        setLoading(true);
        try {const res = await fetch(`${API_BASE_URL}/api/products/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const json = await res.json();
            setData(json);
        } catch (err) {
            console.error("Failed to fetch inventory", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, [token]);

    // Define Table Columns
    const columns = [
        columnHelper.accessor("name", {
            header: "Product Name",
            cell: info => <span className="font-medium text-white">{info.getValue()}</span>,
        }),
        columnHelper.accessor("sku", {
            header: "SKU",
            cell: info => <span className="text-zinc-400 font-mono text-sm">{info.getValue()}</span>,
        }),
        columnHelper.accessor("category", {
            header: "Category",
            cell: info => (
                <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-zinc-300">
                    {info.getValue()}
                </span>
            ),
        }),
        columnHelper.accessor("price", {
            header: "Price",
            cell: info => <span className="text-emerald-400">${info.getValue().toFixed(2)}</span>,
        }),
        columnHelper.accessor("stockQty", {
            header: "Stock",
            cell: info => {
                const qty = info.getValue();
                const lowStock = info.row.original.lowStock;
                const isLow = qty <= lowStock;
                return (
                    <div className="flex items-center gap-2">
                        <span className={isLow ? "text-red-400 font-bold" : "text-white"}>{qty}</span>
                        {isLow && <AlertTriangle className="w-4 h-4 text-red-500" />}
                    </div>
                );
            },
        }),
        // columnHelper.display({
        //   id: "actions",
        //   header: "Actions",
        //   cell: () => (
        //     <div className="flex items-center gap-3">
        //       <button className="text-zinc-400 hover:text-indigo-400 transition-colors"><Edit className="w-4 h-4" /></button>
        //       <button className="text-zinc-400 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
        //     </div>
        //   ),
        // })

        columnHelper.display({
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const product = row.original;

                const handleDelete = async () => {
                    const confirmed = window.confirm(
                        `Delete "${product.name}"? This action cannot be undone.`
                    );

                    if (!confirmed) return;

                    try {
                        const res = await fetch(
                            `${API_BASE_URL}/api/products/${product.id}`,
                            {
                                method: "DELETE",
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        );

                        const json = await res.json();

                        if (!res.ok) {
                            alert(json.detail || "Failed to delete product");
                            return;
                        }

                        alert("Product deleted successfully");
                        fetchInventory(); // Refresh table
                    } catch (error) {
                        console.error("Delete failed:", error);
                        alert("Delete failed");
                    }
                };

                const handleRestock = async () => {
                    const qtyStr = prompt(
                        `Enter quantity to add to "${product.name}":`
                    );

                    if (!qtyStr) return;

                    const quantity = parseInt(qtyStr);

                    if (isNaN(quantity) || quantity <= 0) {
                        alert("Please enter a valid positive number");
                        return;
                    }

                    try {
                        const res = await fetch(
                            `http://localhost:8000/api/products/${product.id}/restock`,
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify({ quantity }),
                            }
                        );

                        const json = await res.json();

                        if (!res.ok) {
                            alert(json.detail || "Failed to restock");
                            return;
                        }

                        alert(
                            `Stock updated successfully.\nNew stock: ${json.product.stockQty}`
                        );

                        fetchInventory(); // Refresh table
                    } catch (error) {
                        console.error("Restock failed:", error);
                        alert("Restock failed");
                    }
                };

                return (
                    <div className="flex items-center gap-3">
                        {/* Restock Button */}
                        <button
                            onClick={handleRestock}
                            className="text-zinc-400 hover:text-emerald-400 transition-colors"
                            title="Restock Product"
                        >
                            <Edit className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                            onClick={handleDelete}
                            className="text-zinc-400 hover:text-red-400 transition-colors"
                            title="Delete Product"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                );
            },
        })
    ];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <div className="max-w-7xl mx-auto space-y-6">

            {/* Header section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Package className="w-8 h-8 text-indigo-500" /> Inventory
                    </h1>
                    <p className="text-zinc-400 mt-1">Manage your products and stock levels.</p>
                </div>

                <button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all">
                    <button
                        onClick={async () => {
                            try {
                                // -----------------------------
                                // Product Name
                                // -----------------------------
                                const name = prompt("Enter product name:");
                                if (!name || !name.trim()) {
                                    alert("Product name is required.");
                                    return;
                                }

                                // -----------------------------
                                // SKU
                                // -----------------------------
                                const sku = prompt("Enter SKU (must be unique):");
                                if (!sku || !sku.trim()) {
                                    alert("SKU is required.");
                                    return;
                                }

                                // -----------------------------
                                // Category
                                // -----------------------------
                                const category = prompt("Enter category:");
                                if (!category || !category.trim()) {
                                    alert("Category is required.");
                                    return;
                                }

                                // -----------------------------
                                // Selling Price
                                // -----------------------------
                                const priceStr = prompt("Enter selling price:");
                                if (!priceStr) return;

                                const price = parseFloat(priceStr);
                                if (isNaN(price) || price <= 0) {
                                    alert("Selling price must be greater than 0.");
                                    return;
                                }

                                // -----------------------------
                                // Cost Price
                                // -----------------------------
                                const costPriceStr = prompt("Enter cost price:");
                                if (!costPriceStr) return;

                                const costPrice = parseFloat(costPriceStr);
                                if (isNaN(costPrice) || costPrice < 0) {
                                    alert("Cost price must be 0 or greater.");
                                    return;
                                }

                                // -----------------------------
                                // Initial Stock
                                // -----------------------------
                                const stockQtyStr = prompt("Enter initial stock quantity:");
                                if (!stockQtyStr) return;

                                const stockQty = parseInt(stockQtyStr, 10);
                                if (isNaN(stockQty) || stockQty < 0) {
                                    alert("Stock quantity must be 0 or greater.");
                                    return;
                                }

                                // -----------------------------
                                // Low Stock Threshold
                                // -----------------------------
                                const lowStockStr = prompt(
                                    "Enter low stock alert threshold:",
                                    "5"
                                );

                                if (!lowStockStr) return;

                                const lowStock = parseInt(lowStockStr, 10);
                                if (isNaN(lowStock) || lowStock < 0) {
                                    alert("Low stock threshold must be 0 or greater.");
                                    return;
                                }

                                // -----------------------------
                                // Optional Description
                                // -----------------------------
                                const description =
                                    prompt("Enter description (optional):") || "";

                                // -----------------------------
                                // Payload
                                // -----------------------------
                                const payload = {
                                    name: name.trim(),
                                    sku: sku.trim(),
                                    category: category.trim(),
                                    price,
                                    costPrice,
                                    stockQty,
                                    lowStock,
                                    description,
                                    imageUrl: null,
                                };

                                // -----------------------------
                                // API Request
                                // -----------------------------
                                const res = await fetch(
                                    "http://localhost:8000/api/products/",
                                    {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                            Authorization: `Bearer ${token}`,
                                        },
                                        body: JSON.stringify(payload),
                                    }
                                );

                                const json = await res.json();

                                if (!res.ok) {
                                    // FastAPI may return validation details or a simple detail string
                                    let message = "Failed to create product.";

                                    if (typeof json.detail === "string") {
                                        message = json.detail;
                                    } else if (Array.isArray(json.detail)) {
                                        message = json.detail
                                            .map((err: any) => err.msg)
                                            .join("\n");
                                    }

                                    alert(message);
                                    return;
                                }

                                alert(`Product "${json.name}" created successfully!`);

                                // Refresh inventory table
                                fetchInventory();
                            } catch (error) {
                                console.error("Create product failed:", error);
                                alert("Something went wrong while creating the product.");
                            }
                        }}
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Add Product
                    </button>
                </button>
            </div>

            {/* Main Table Card */}
            <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-lg">
                <div className="p-4 border-b border-white/5 flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search inventory..."
                            className="w-full bg-zinc-950/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-zinc-950/80 text-zinc-400 border-b border-white/5">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id} className="px-6 py-4 font-medium">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-10 text-zinc-500">Loading inventory...</td></tr>
                            ) : data.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-10 text-zinc-500">No products found. Seed the database!</td></tr>
                            ) : (
                                table.getRowModel().rows.map(row => (
                                    <tr key={row.id} className="hover:bg-white/5 transition-colors group">
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id} className="px-6 py-4 text-zinc-300">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}