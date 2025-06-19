import React from 'react';
import { useFinanceTransactions } from '@/lib/hooks/finance';
import StatusBadge from './StatusBadge';

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: {
    name: string;
    type: string; // INCOME or EXPENSE
  };
  amount: number;
  status: string; // PENDING, COMPLETED, FAILED
}

export default function TransactionList() {
  const [page, setPage] = React.useState(1);
  const { data, isLoading, isError } = useFinanceTransactions(page);

  if (isLoading) {
    return <p>Loading transactions...</p>;
  }

  if (isError) {
    return <p>Error loading transactions.</p>;
  }

  const handleNextPage = () => setPage((prev) => prev + 1);
  const handlePreviousPage = () => setPage((prev) => Math.max(prev - 1, 1));

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Transactions</h3>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-200 dark:border-[#374151]">
            <th className="py-2 px-4 text-sm text-gray-500 dark:text-gray-400">Date</th>
            <th className="py-2 px-4 text-sm text-gray-500 dark:text-gray-400">Description</th>
            <th className="py-2 px-4 text-sm text-gray-500 dark:text-gray-400">Category</th>
            <th className="py-2 px-4 text-sm text-gray-500 dark:text-gray-400">Amount</th>
            <th className="py-2 px-4 text-sm text-gray-500 dark:text-gray-400">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.transactions.map((transaction: Transaction) => (
            <tr key={transaction.id} className="border-b border-gray-200 dark:border-[#374151]">
              <td className="py-2 px-4 text-sm text-gray-800 dark:text-gray-200">
                {new Date(transaction.date).toLocaleDateString()}
              </td>
              <td className="py-2 px-4 text-sm text-gray-800 dark:text-gray-200">
                {transaction.description || 'N/A'}
              </td>
              <td className="py-2 px-4 text-sm text-gray-800 dark:text-gray-200">
                {transaction.category.name} ({transaction.category.type})
              </td>
              <td className="py-2 px-4 text-sm text-gray-800 dark:text-gray-200">
                ${transaction.amount.toLocaleString()}
              </td>
              <td className="py-2 px-4 text-sm">
                <StatusBadge status={transaction.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handlePreviousPage}
          disabled={page === 1}
          className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#374151] text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-[#4B5563]"
        >
          Previous
        </button>
        <span className="text-sm text-gray-500 dark:text-gray-400">Page {page}</span>
        <button
          onClick={handleNextPage}
          disabled={data.totalPages && page >= data.totalPages}
          className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#374151] text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-[#4B5563]"
        >
          Next
        </button>
      </div>
    </div>
  );
}