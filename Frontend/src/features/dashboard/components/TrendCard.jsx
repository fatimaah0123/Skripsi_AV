import React from 'react';
import {
  BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const PIE_COLORS   = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];
const STATUS_COLOR = {
  Active:            '#10b981',
  Maintenance:       '#f59e0b',
  Onduty:            '#3b82f6',
  Done:              '#10b981',
  InProgress:        '#3b82f6',
  Assigned:          '#8b5cf6',
  Rejected:          '#ef4444',
  WaitingAssignment: '#f59e0b',
  WaitingApproval:   '#f97316',
};
const FAILURE_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16'];

const formatMonth = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-stone-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl border border-stone-700">
        <p className="font-bold mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: <span className="font-semibold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Menampilkan label persentase di tengah setiap potongan donut chart
const renderPercentLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (!percent) return null;

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={700}
      style={{ pointerEvents: 'none' }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// Komponen kustom untuk membungkus teks ke bawah dengan jarak vertikal yang aman dari garis
const RenderCustomTick = ({ x, y, payload }) => {
  if (!payload || !payload.value) return null;
  
  // Memecah teks berdasarkan huruf kapital (contoh: "InProgress" -> ["In", "Progress"])
  const words = payload.value.match(/[A-Z][a-z]+/g) || [payload.value];

  return (
    <g transform={`translate(${x},${y})`}>
      {/* Nilai dy diubah ke 18 agar memberikan jarak (gap) dari garis penunjuk grafik */}
      <text x={0} y={0} dy={18} textAnchor="middle" fill="#57534e" fontSize={9} className="font-medium">
        {words.map((word, index) => (
          <tspan x={0} dy={index === 0 ? 0 : 11} key={index}>
            {word}
          </tspan>
        ))}
      </text>
    </g>
  );
};

const ChartCard = ({ title, children }) => (
  <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl p-5 shadow-sm">
    <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200 mb-4 border-b border-stone-100 dark:border-stone-800 pb-2">
      {title}
    </h3>
    {children}
  </div>
);

const TrendCard = ({
  machineStatus      = [],
  engineerStatus     = [],
  ticketStatus       = [],
  monthlyMaintenance = [],
  failureTypes       = [],
}) => {
  const formattedMonthly = monthlyMaintenance.map((item) => ({
    ...item,
    formattedMonth: formatMonth(item.month),
    total: Number(item.total),
  }));

  const failureData = failureTypes.map((item) => ({
    ...item,
    total: Number(item.total),
  }));

  const formattedMachineStatus = machineStatus.map((item) => ({
    ...item,
    total: Number(item.total),
  }));

  const formattedEngineerStatus = engineerStatus.map((item) => ({
    ...item,
    total: Number(item.total),
  }));

  const formattedTicketStatus = ticketStatus.map((item) => ({
    ...item,
    total: Number(item.total),
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <ChartCard title="Status Mesin Industri">
          {formattedMachineStatus.length === 0 ? (
            <div className="h-44 flex items-center justify-center text-sm text-stone-600 dark:text-stone-300">
              Belum ada data status mesin.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={formattedMachineStatus}
                  dataKey="total"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={65}
                  innerRadius={35}
                  paddingAngle={3}
                  label={renderPercentLabel}
                  labelLine={false}
                >
                  {formattedMachineStatus.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={STATUS_COLOR[entry.status] || PIE_COLORS[i % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Status Engineer / User">
          {formattedEngineerStatus.length === 0 ? (
            <div className="h-44 flex items-center justify-center text-sm text-stone-600 dark:text-stone-300">
              Belum ada data status engineer.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={formattedEngineerStatus}
                  dataKey="total"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={65}
                  innerRadius={35}
                  paddingAngle={3}
                  label={renderPercentLabel}
                  labelLine={false}
                >
                  {formattedEngineerStatus.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={STATUS_COLOR[entry.status] || PIE_COLORS[i % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Status Tiket Pemeliharaan">
          {formattedTicketStatus.length === 0 ? (
            <div className="h-44 flex items-center justify-center text-sm text-stone-600 dark:text-stone-300">
              Belum ada data status tiket.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              {/* Mengatur bottom margin agar ada ruang ekstra untuk baris teks kedua & keterangan sumbu X */}
              <BarChart data={formattedTicketStatus} margin={{ top: 10, right: 10, left: 5, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis 
                  dataKey="status" 
                  interval={0} 
                  height={55}
                  tickLine={false} // Menyembunyikan garis penunjuk kecil bawaan agar terlihat bersih
                  tick={<RenderCustomTick />}
                  label={{
                    value: 'Status Tiket',
                    position: 'insideBottom',
                    offset: -5,
                    style: { fontSize: 11, fontWeight: 600, fill: '#57534e' },
                  }}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  allowDecimals={false}
                  label={{
                    value: 'Jumlah Tiket',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fontSize: 11, fontWeight: 600, fill: '#57534e', textAnchor: 'middle' },
                  }}
                />
                <Tooltip />
                <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                  {formattedTicketStatus.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={STATUS_COLOR[entry.status] || PIE_COLORS[i % PIE_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
        <div className="md:col-span-3">
          <ChartCard title="Tren Pemeliharaan Bulanan">
            {formattedMonthly.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-sm text-stone-600 dark:text-stone-300">
                Belum ada data pemeliharaan bulanan.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={formattedMonthly} margin={{ top: 10, right: 16, left: 5, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis
                    dataKey="formattedMonth"
                    tick={{ fontSize: 11 }}
                    label={{
                      value: 'Bulan',
                      position: 'insideBottom',
                      offset: -5,
                      style: { fontSize: 11, fontWeight: 600, fill: '#57534e' },
                    }}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    allowDecimals={false}
                    label={{
                      value: 'Jumlah Tiket',
                      angle: -90,
                      position: 'insideLeft',
                      style: { fontSize: 11, fontWeight: 600, fill: '#57534e', textAnchor: 'middle' },
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Pemeliharaan"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#3b82f6' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        <div className="md:col-span-2">
          <ChartCard title="Jenis Kerusakan Paling Sering Terjadi">
            {failureData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-sm text-stone-600 dark:text-stone-300">
                Belum ada data jenis kerusakan.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(200, failureData.length * 42 + 20)}>
                <BarChart
                  data={failureData}
                  layout="vertical"
                  margin={{ top: 4, right: 24, left: 8, bottom: 24 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11 }}
                    allowDecimals={false}
                    label={{
                      value: 'Jumlah Kejadian',
                      position: 'insideBottom',
                      offset: -5,
                      style: { fontSize: 11, fontWeight: 600, fill: '#57534e' },
                    }}
                  />
                  <YAxis
                    type="category"
                    dataKey="type"
                    tick={{ fontSize: 11 }}
                    width={160}
                    label={{
                      value: 'Jenis Kerusakan',
                      angle: -90,
                      position: 'insideLeft',
                      style: { fontSize: 11, fontWeight: 600, fill: '#57534e', textAnchor: 'middle' },
                    }}
                  />
                  <Tooltip formatter={(val) => [val, 'Kejadian']} />
                  <Bar dataKey="total" radius={[0, 6, 6, 0]} barSize={22}>
                    {failureData.map((entry, i) => (
                      <Cell key={i} fill={FAILURE_COLORS[i % FAILURE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

export default TrendCard;