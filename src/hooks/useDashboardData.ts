export function useDashboardData() {
  const stats = [
    { title: 'Total Revenue', value: '$2.4M', insight: 'Revenue trend: +15%' },
    { title: 'Employees', value: '248', insight: 'Employee growth: +5%' },
    { title: 'Inventory Items', value: '1,842', insight: 'Stock levels stable' },
    { title: 'Orders', value: '486', insight: 'Order trend: +8%' },
  ];

  const chartData = {
    labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    datasets: [
      {
        label: 'Revenue',
        data: [200000, 220000, 240000, 260000, 280000, 300000],
        backgroundColor: '#A17E25',
        borderColor: '#8C6A1A',
        borderWidth: 1,
      },
    ],
  };

  return { stats, chartData };
}
