"use client";

import { Area, AreaChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { activityData } from "../../mock/dashboard";

export function ActivityChart() {
  return <div className="h-[220px] w-full" aria-label="Governed AI actions over the last seven days">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={activityData} margin={{ top: 12, right: 4, left: -28, bottom: 0 }}>
        <defs><linearGradient id="actionFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6aa8ff" stopOpacity={0.28} /><stop offset="100%" stopColor="#6aa8ff" stopOpacity={0} /></linearGradient></defs>
        <CartesianGrid vertical={false} stroke="rgb(255 255 255 / 0.055)" strokeDasharray="3 5" />
        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#707985", fontSize: 10 }} dy={8} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#707985", fontSize: 10 }} />
        <Tooltip contentStyle={{ background: "#13161a", border: "1px solid #252a31", borderRadius: 8, fontSize: 12, boxShadow: "0 14px 40px rgb(0 0 0 / 35%)" }} cursor={{ stroke: "#343b45" }} />
        <Area type="monotone" dataKey="actions" name="Governed actions" stroke="#6aa8ff" strokeWidth={1.7} fill="url(#actionFill)" />
        <Line type="monotone" dataKey="blocked" name="Policy blocks" stroke="#ef6262" strokeWidth={1.3} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  </div>;
}
