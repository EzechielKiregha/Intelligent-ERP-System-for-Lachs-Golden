import {
  Server,
  Plug,
  LifeBuoy,
  Smile,
} from 'lucide-react';

export function StatsSection() {
  const stats = [
    { icon: <LifeBuoy className="w-6 h-6 text-[#A17E25] dark:text-[#D4AF37]" />, value: '24/7', label: 'Support Available' },
    { icon: <Smile className="w-6 h-6 text-[#A17E25] dark:text-[#D4AF37]" />, value: '500+', label: 'Happy Clients' },
    { icon: <Server className="w-6 h-6 text-[#A17E25] dark:text-[#D4AF37]" />, value: '99.9%', label: 'Uptime Guarantee' },
    { icon: <Plug className="w-6 h-6 text-[#A17E25] dark:text-[#D4AF37]" />, value: '50+', label: 'Integration Partners' },
  ];

  return (
    <section id="stats" className="py-16 bg-white dark:bg-[#111827]">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 text-center mb-8">
          Key Metrics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, idx) => (
            <div key={idx} className="p-6 bg-white dark:bg-[#1E293B] rounded-lg shadow flex flex-col items-center">
              <div className="mb-2">{s.icon}</div>
              <p className="text-2xl font-semibold text-gray-800 dark:text-gray-200">{s.value}</p>
              <p className="mt-1 text-[14px] text-gray-500 dark:text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}