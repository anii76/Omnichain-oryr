"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { BarChart3 } from "lucide-react";

const data = [
  { name: "Arbitrum Sepolia", value: 6500, color: "#0ea5e9" },
  { name: "Base Sepolia", value: 3500, color: "#8b5cf6" },
];

export function AllocationChart() {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-primary-400" />
        <h3 className="text-xl font-bold text-white">Cross-Chain Allocation</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, "Value"]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend with Stats */}
        <div className="space-y-3">
          <div className="p-4 bg-slate-800/50 rounded-xl">
            <p className="text-sm text-slate-400 mb-1">Total Value Locked</p>
            <p className="text-3xl font-bold text-white">${total.toLocaleString()}</p>
          </div>

          {data.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-slate-300">{item.name}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-white">
                  ${item.value.toLocaleString()}
                </p>
                <p className="text-xs text-slate-400">
                  {((item.value / total) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

