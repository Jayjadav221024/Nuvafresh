import React, { useState } from 'react';
import { Boxes, AlertTriangle, ArrowUpDown, RefreshCw, CheckCircle2 } from 'lucide-react';

const SEED_INVENTORY = [
  { sku: 'NV-VEG-SPIN-250', name: 'Hydro-Cleaned Baby Spinach (250g)', stock: 48, threshold: 15, status: 'In Stock' },
  { sku: 'NV-GHEE-BIL-500', name: 'Desi Gir Cow A2 Bilona Ghee (500ml)', stock: 8, threshold: 10, status: 'Low Stock' },
  { sku: 'NV-OIL-MUST-1L', name: 'Wood Cold-Pressed Mustard Oil (1L)', stock: 35, threshold: 10, status: 'In Stock' },
  { sku: 'NV-ATTA-KHAP-5K', name: 'Ancient Emmer Khapli Wheat Atta (5 Kg)', stock: 4, threshold: 10, status: 'Low Stock' },
  { sku: 'NV-JUICE-ORNG-300', name: 'Cold-Pressed Valencia Orange Juice (300ml)', stock: 2, threshold: 10, status: 'Critical' },
  { sku: 'NV-VEG-TOM-500', name: 'Ozone-Purified Cherry Tomatoes (500g)', stock: 25, threshold: 10, status: 'In Stock' },
];

const AdminInventory = () => {
  const [items, setItems] = useState(SEED_INVENTORY);

  const handleStockUpdate = (sku, newStock) => {
    setItems(items.map(item => {
      if (item.sku === sku) {
        const status = newStock <= 2 ? 'Critical' : newStock <= item.threshold ? 'Low Stock' : 'In Stock';
        return { ...item, stock: newStock, status };
      }
      return item;
    }));
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white font-display">
          Inventory & Threshold Management
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Monitor real-time warehouse stock, low-stock threshold triggers, and automated replenishment alerts.
        </p>
      </div>

      {/* Inventory Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 uppercase tracking-wider font-extrabold bg-neutral-100/70 dark:bg-neutral-800/60">
                <th className="py-3 px-3">SKU Identifier</th>
                <th className="py-3 px-3">Product Name</th>
                <th className="py-3 px-3 text-right">Current Stock Qty</th>
                <th className="py-3 px-3 text-right">Low Stock Threshold</th>
                <th className="py-3 px-3">Inventory Health</th>
                <th className="py-3 px-3 text-right">Quick Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {items.map((item) => (
                <tr key={item.sku} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="py-4 font-mono text-[11px] text-neutral-500 font-bold">
                    {item.sku}
                  </td>
                  <td className="py-4 font-bold text-neutral-900 dark:text-white">
                    {item.name}
                  </td>
                  <td className="py-4 font-black text-right text-base text-neutral-900 dark:text-white font-display">
                    {item.stock}
                  </td>
                  <td className="py-4 text-right text-neutral-500 font-medium">
                    &lt; {item.threshold} units
                  </td>
                  <td className="py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      item.status === 'In Stock'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : item.status === 'Low Stock'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => handleStockUpdate(item.sku, item.stock + 10)}
                        className="px-2 py-1 rounded-lg bg-[#2d472c] hover:bg-[#20341f] text-white text-[10px] font-bold"
                      >
                        +10 Units
                      </button>
                      <button
                        onClick={() => handleStockUpdate(item.sku, Math.max(0, item.stock - 5))}
                        className="px-2 py-1 rounded-lg bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 text-neutral-700 dark:text-neutral-300 text-[10px] font-bold"
                      >
                        -5
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminInventory;
