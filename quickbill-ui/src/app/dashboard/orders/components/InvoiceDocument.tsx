"use client";

import { Printer, Receipt } from "lucide-react";
import { format } from "date-fns";

// ================= TYPES =================

interface OrderItem {
  productId?: string;

  name: string;

  quantity: number;

  priceAtTime?: number;

  price?: number;
}

export interface Order {
  _id?: string;

  id?: string;

  customerName?: string;

  customerPhone?: string;

  customerEmail?: string;

  status?: string;

  createdAt?: string;

  date?: string | Date;

  items: OrderItem[];

  subtotal?: number;

  totalAmount?: number;

  tax?: number;

  discount?: number;

  grandTotal?: number;

  total?: number;
}

interface InvoiceProps {
  order: Order;
}

// ================= COMPONENT =================

export default function InvoiceDocument({
  order,
}: InvoiceProps) {

  const handlePrint = () => {
    window.print();
  };

  // Safe Values
  const invoiceId =
    order.id ||
    order._id ||
    "N/A";

  const invoiceDate =
    order.createdAt ||
    order.date;

  const subtotal =
    order.subtotal ||
    order.totalAmount ||
    0;

  const tax =
    order.tax || 0;

  const total =
    order.grandTotal ||
    order.total ||
    0;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-5xl mx-auto p-4 md:p-8">

      {/* ACTION BAR */}
      <div className="w-full flex justify-between items-center mb-6 print:hidden">

        <h2 className="text-xl font-semibold text-zinc-100 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-indigo-400" />
          Order Confirmed
        </h2>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(99,102,241,0.35)]"
        >
          <Printer className="w-4 h-4" />
          Print Invoice
        </button>
      </div>

      {/* INVOICE */}
      <div
        id="printable-invoice"
        className="w-full bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 md:p-12 shadow-2xl print:bg-white print:border-none print:shadow-none print:text-black"
      >

        {/* HEADER */}
        <div className="flex justify-between items-start border-b border-zinc-800 print:border-gray-300 pb-8 mb-8">

          <div>
            <h1 className="text-3xl font-bold text-zinc-100 print:text-black tracking-tight">
              Quick
              <span className="text-indigo-500 print:text-black">
                Bill
              </span>
            </h1>

            <p className="text-zinc-400 print:text-gray-600 mt-2 text-sm leading-6">
              Smart Retail POS System
              <br />
              Rajkot, Gujarat
              <br />
              support@quickbill.ai
            </p>
          </div>

          <div className="text-right">

            <h2 className="text-2xl font-bold text-zinc-100 print:text-black mb-2">
              INVOICE
            </h2>

            <p className="text-zinc-400 print:text-gray-600 text-sm">
              <span className="font-medium text-zinc-300 print:text-black">
                Invoice #:
              </span>{" "}
              {String(invoiceId).slice(-8).toUpperCase()}
            </p>

            <p className="text-zinc-400 print:text-gray-600 text-sm mt-2">
              <span className="font-medium text-zinc-300 print:text-black">
                Date:
              </span>{" "}
              {invoiceDate
                ? format(
                    new Date(invoiceDate),
                    "MMM dd, yyyy"
                  )
                : "N/A"}
            </p>

            <p className="text-zinc-400 print:text-gray-600 text-sm mt-2">
              <span className="font-medium text-zinc-300 print:text-black">
                Status:
              </span>{" "}
              {order.status || "COMPLETED"}
            </p>
          </div>
        </div>

        {/* CUSTOMER */}
        <div className="mb-10">

          <h3 className="text-xs font-semibold tracking-widest uppercase text-zinc-500 print:text-gray-500 mb-3">
            Billed To
          </h3>

          <p className="text-lg font-semibold text-zinc-100 print:text-black">
            {order.customerName ||
              "Walk-in Customer"}
          </p>

          {order.customerEmail && (
            <p className="text-zinc-400 print:text-gray-600 text-sm mt-1">
              {order.customerEmail}
            </p>
          )}

          {order.customerPhone && (
            <p className="text-zinc-400 print:text-gray-600 text-sm mt-1">
              {order.customerPhone}
            </p>
          )}
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border border-zinc-800 print:border-gray-300 mb-10">

          <table className="w-full border-collapse">

            <thead className="bg-zinc-800/50 print:bg-gray-100 border-b border-zinc-800 print:border-gray-300">

              <tr>
                <th className="px-5 py-4 text-left text-sm font-medium text-zinc-300 print:text-black">
                  Product
                </th>

                <th className="px-5 py-4 text-center text-sm font-medium text-zinc-300 print:text-black">
                  Qty
                </th>

                <th className="px-5 py-4 text-right text-sm font-medium text-zinc-300 print:text-black">
                  Unit Price
                </th>

                <th className="px-5 py-4 text-right text-sm font-medium text-zinc-300 print:text-black">
                  Total
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-800/50 print:divide-gray-200">

              {order.items.map(
                (item, index) => {

                  const price =
                    item.priceAtTime ||
                    item.price ||
                    0;

                  const itemTotal =
                    price * item.quantity;

                  return (
                    <tr
                      key={index}
                      className="text-zinc-300 print:text-black"
                    >
                      <td className="px-5 py-4 text-sm">
                        {item.name}
                      </td>

                      <td className="px-5 py-4 text-sm text-center">
                        {item.quantity}
                      </td>

                      <td className="px-5 py-4 text-sm text-right">
                        ₹{price.toFixed(2)}
                      </td>

                      <td className="px-5 py-4 text-sm text-right font-semibold">
                        ₹{itemTotal.toFixed(2)}
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>

        {/* TOTALS */}
        <div className="flex justify-end">

          <div className="w-full max-w-sm space-y-4">

            <div className="flex justify-between text-zinc-400 print:text-gray-600 text-sm">
              <span>Subtotal</span>

              <span>
                ₹{subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-zinc-400 print:text-gray-600 text-sm">
              <span>Tax</span>

              <span>
                ₹{tax.toFixed(2)}
              </span>
            </div>

            {order.discount ? (
              <div className="flex justify-between text-zinc-400 print:text-gray-600 text-sm">
                <span>Discount</span>

                <span>
                  - ₹{order.discount.toFixed(2)}
                </span>
              </div>
            ) : null}

            <div className="flex justify-between text-xl font-bold text-zinc-100 print:text-black border-t border-zinc-800 print:border-gray-300 pt-4">
              <span>Total</span>

              <span className="text-emerald-400 print:text-black">
                ₹{total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-16 pt-8 border-t border-zinc-800 print:border-gray-300 text-center">

          <p className="text-zinc-500 print:text-gray-500 text-sm">
            Thank you for shopping with QuickBill.
          </p>

          <p className="text-zinc-600 print:text-gray-500 text-xs mt-2">
            This invoice was generated digitally by QuickBill POS.
          </p>
        </div>
      </div>
    </div>
  );
}