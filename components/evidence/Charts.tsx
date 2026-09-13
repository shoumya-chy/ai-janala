"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  LabelList,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Count, HeatRow, RecommendByClarity, RecommendByPersona } from "@/lib/survey-data";
import { CHART_COLORS as C } from "@/lib/survey-data";

const AXIS_TICK = { fill: "#6b7280", fontSize: 12 };
const GRID_STROKE = "#e5e7eb";
const CHART_FONT = "Inter, ui-sans-serif, system-ui, sans-serif";
const RADIAN = Math.PI / 180;

// Custom pie-slice label: an explicit <text> element (rather than returning
// a bare string to Recharts' default label renderer) so we can pin
// font-family ourselves. Without this, some browser/OS font-fallback
// configurations can substitute the SVG text's digits with the wrong
// script's numeral glyphs.
function donutSliceLabel(props: {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
}) {
  const { cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent } = props;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      fill="#ffffff"
      fontFamily={CHART_FONT}
      fontSize={13}
      fontWeight={700}
    >
      {`${Math.round((percent ?? 0) * 100)}%`}
    </text>
  );
}

// ---------------------------------------------------------------------------
// Generic horizontal bar (single hue) - used for persona/channel/district/
// topic/pain/improve counts, where the count is one series and the
// categories are the identity, so a single repeated hue is correct.
// ---------------------------------------------------------------------------
export function HorizontalBarChart({
  data,
  color = C.brandGreen,
  rowHeight = 34,
}: {
  data: readonly Count[];
  color?: string;
  rowHeight?: number;
}) {
  const height = Math.max(120, data.length * rowHeight);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data as Count[]}
        layout="vertical"
        margin={{ top: 4, right: 36, bottom: 4, left: 8 }}
        barCategoryGap={10}
      >
        <CartesianGrid horizontal={false} stroke={GRID_STROKE} />
        <XAxis type="number" tick={AXIS_TICK} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="label"
          width={190}
          interval={0}
          tick={{ fill: "#374151", fontSize: 13 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: "rgba(0,106,78,0.06)" }}
          formatter={(value: unknown) => [`${value} responses`, ""]}
          labelStyle={{ color: "#111827", fontWeight: 600 }}
        />
        <Bar dataKey="count" fill={color} radius={[0, 4, 4, 0]} maxBarSize={22}>
          <LabelList
            dataKey="count"
            position="right"
            style={{ fill: "#374151", fontSize: 12, fontWeight: 600 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ---------------------------------------------------------------------------
// Donut chart - for clean 3-way part-to-whole splits (language, device,
// overall recommend). Direct percentage labels on every slice, plus a
// legend, satisfy the "relief" requirement for the aqua slot's sub-3:1
// contrast against the white surface.
// ---------------------------------------------------------------------------
export function DonutChart({
  data,
  colors,
  centerLabel,
  centerValue,
}: {
  data: readonly Count[];
  colors: string[];
  centerLabel?: string;
  centerValue?: string;
}) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data as Count[]}
            dataKey="count"
            nameKey="label"
            innerRadius={62}
            outerRadius={92}
            paddingAngle={2}
            stroke="#fff"
            strokeWidth={2}
            label={donutSliceLabel}
            labelLine={false}
          >
            {data.map((entry, i) => (
              <Cell key={entry.label} fill={colors[i % colors.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: unknown) => [`${value} (${((Number(value) / total) * 100).toFixed(1)}%)`, ""]} />
          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 13 }} />
        </PieChart>
      </ResponsiveContainer>
      {centerLabel && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-9">
          <span className="text-2xl font-bold text-gray-900">{centerValue}</span>
          <span className="text-xs text-gray-500">{centerLabel}</span>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Clarity / trust histograms, side by side bars, 1 hue each (2 series total,
// legend + axis make identity unambiguous).
// ---------------------------------------------------------------------------
export function ScoreHistogram({
  data,
  color,
  label,
}: {
  data: readonly Count[];
  color: string;
  label: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data as Count[]} margin={{ top: 20, right: 8, bottom: 4, left: 8 }} barCategoryGap="20%">
        <CartesianGrid vertical={false} stroke={GRID_STROKE} />
        <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false}>
          <Label value={`${label} score (1-5)`} position="insideBottom" offset={-2} style={{ fontSize: 11, fill: "#9ca3af" }} />
        </XAxis>
        <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={30} />
        <Tooltip formatter={(value: unknown) => [`${value} responses`, label]} />
        <Bar dataKey="count" fill={color} radius={[4, 4, 0, 0]} maxBarSize={56}>
          <LabelList dataKey="count" position="top" style={{ fill: "#374151", fontSize: 12, fontWeight: 600 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ---------------------------------------------------------------------------
// Recommend (Yes / Maybe / No) by persona - a sentiment scale, so it takes
// the diverging treatment: Yes and No are opposite poles (blue / red), Maybe
// is the neutral midpoint (gray). Rendered as a 100%-stacked horizontal bar
// with every segment percentage-labeled.
// ---------------------------------------------------------------------------
export function RecommendByPersonaChart({ data }: { data: readonly RecommendByPersona[] }) {
  const height = Math.max(160, data.length * 46);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data as RecommendByPersona[]}
        layout="vertical"
        margin={{ top: 4, right: 12, bottom: 4, left: 8 }}
        barCategoryGap={14}
      >
        <XAxis type="number" hide domain={[0, 100]} />
        <YAxis
          type="category"
          dataKey="persona"
          width={150}
          interval={0}
          tick={{ fill: "#374151", fontSize: 13 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip formatter={(value: unknown, name: unknown) => [`${value}%`, name as string]} />
        <Legend verticalAlign="top" height={28} iconType="circle" wrapperStyle={{ fontSize: 13 }} />
        <Bar dataKey="yes" name="Yes" stackId="rec" fill={C.blue} maxBarSize={26}>
          <LabelList dataKey="yes" position="center" formatter={(v: unknown) => (Number(v) >= 12 ? `${v}%` : "")} style={{ fill: "#fff", fontSize: 11, fontWeight: 600 }} />
        </Bar>
        <Bar dataKey="maybe" name="Maybe" stackId="rec" fill={C.neutral} maxBarSize={26}>
          <LabelList dataKey="maybe" position="center" formatter={(v: unknown) => (Number(v) >= 12 ? `${v}%` : "")} style={{ fill: "#fff", fontSize: 11, fontWeight: 600 }} />
        </Bar>
        <Bar dataKey="no" name="No" stackId="rec" fill={C.red} radius={[0, 4, 4, 0]} maxBarSize={26}>
          <LabelList dataKey="no" position="center" formatter={(v: unknown) => (Number(v) >= 12 ? `${v}%` : "")} style={{ fill: "#fff", fontSize: 11, fontWeight: 600 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ---------------------------------------------------------------------------
// Recommend rate by clarity score - single hue (blue, matching "Yes" above).
// ---------------------------------------------------------------------------
export function RecommendByClarityChart({ data }: { data: readonly RecommendByClarity[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data as RecommendByClarity[]} margin={{ top: 20, right: 8, bottom: 20, left: 8 }} barCategoryGap="25%">
        <CartesianGrid vertical={false} stroke={GRID_STROKE} />
        <XAxis dataKey="clarity" tick={AXIS_TICK} axisLine={false} tickLine={false}>
          <Label value="Clarity score given" position="insideBottom" offset={-14} style={{ fontSize: 11, fill: "#9ca3af" }} />
        </XAxis>
        <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={36} unit="%" domain={[0, 100]} />
        <Tooltip formatter={(value: unknown) => [`${value}% would recommend`, "Yes"]} />
        <Bar dataKey="yesPct" fill={C.blue} radius={[4, 4, 0, 0]} maxBarSize={64}>
          <LabelList dataKey="yesPct" position="top" formatter={(v: unknown) => `${v}%`} style={{ fill: "#374151", fontSize: 12, fontWeight: 600 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ---------------------------------------------------------------------------
// Heatmap - persona x language / persona x device. Sequential single hue
// (blue), magnitude = share within that persona. Hand-rolled CSS grid: a
// 6x3 table needs no charting library and gives full control over labels.
// ---------------------------------------------------------------------------
const SEQ_BLUE = ["#eef5fd", "#cde2fb", "#9ec5f4", "#6da7ec", "#3987e5", "#256abf", "#184f95", "#0d366b"];

function seqStep(pct: number) {
  const idx = Math.min(SEQ_BLUE.length - 1, Math.floor((pct / 100) * (SEQ_BLUE.length - 1) + 0.5));
  return SEQ_BLUE[idx];
}
function textOn(pct: number) {
  return pct >= 55 ? "#ffffff" : "#1f2937";
}

export function Heatmap({ rows, columns }: { rows: readonly HeatRow[]; columns: string[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] border-separate" style={{ borderSpacing: 4 }}>
        <thead>
          <tr>
            <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Persona</th>
            {columns.map((c) => (
              <th key={c} className="px-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.persona}>
              <td className="whitespace-nowrap pr-3 text-sm font-medium text-gray-800">{row.persona}</td>
              {columns.map((c) => {
                const val = Number(row[c] ?? 0);
                return (
                  <td key={c} className="p-0">
                    <div
                      className="flex h-11 min-w-[64px] items-center justify-center rounded-md text-sm font-semibold"
                      style={{ backgroundColor: seqStep(val), color: textOn(val) }}
                      title={`${row.persona} - ${c}: ${val}%`}
                    >
                      {val}%
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}