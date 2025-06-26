import { Card, CardHeader, CardContent } from '@/components/ui/card';
import {
  Server,
  Cpu,
  DollarSign,
  Users,
  Cloud,
  Plug,

} from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      icon: <Server className="w-6 h-6 text-[#80410e] dark:text-[#D4AF37]" />,
      title: 'Centralized Data',
      description: 'Unified dashboard with real-time synchronization across all departments.',
    },
    {
      icon: <Cpu className="w-6 h-6 text-[#80410e] dark:text-[#D4AF37]" />,
      title: 'AI-Driven Insights',
      description: 'Advanced analytics and predictive modeling for informed decision-making.',
    },
    {
      icon: <DollarSign className="w-6 h-6 text-[#80410e] dark:text-[#D4AF37]" />,
      title: 'Financial Management',
      description: 'Comprehensive financial tracking and automated reporting systems.',
    },
    {
      icon: <Users className="w-6 h-6 text-[#80410e] dark:text-[#D4AF37]" />,
      title: 'HR Management',
      description: 'Streamlined employee management and automated payroll processing.',
    },
    {
      icon: <Plug className="w-6 h-6 text-[#80410e] dark:text-[#D4AF37]" />,
      title: 'CRM Integration',
      description: 'Enhanced customer relationship management with AI-powered insights.',
    },
    {
      icon: <Cloud className="w-6 h-6 text-[#80410e] dark:text-[#D4AF37]" />,
      title: 'Cloud Architecture',
      description: 'Secure, scalable cloud-based solution for seamless access.',
    },
  ];

  return (
    <section id="features" className="py-16 bg-white dark:bg-[#111827]">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 text-center mb-8">
          Comprehensive Business Solutions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => (
            <Card key={idx} className="p-6 rounded-lg shadow-md bg-sidebar dark:bg-gradient-to-l dark:from-[#b47807] dark:to-[#5a3b02] ">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  {f.icon}
                  <h3 className="text-[18px] font-semibold text-gray-800 dark:text-gray-200">
                    {f.title}
                  </h3>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mt-2 text-[14px] text-gray-500 dark:text-gray-200">{f.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}