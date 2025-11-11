import React, { useMemo, useCallback } from 'react';
import { BusinessReportRow, BusinessAccountingState } from '../types';

const createEmptyRow = (id: number): BusinessReportRow => ({
  id,
  date: '',
  service: '',
  cash: '',
  expense: '',
});

interface BusinessAccountingProps {
  data: BusinessAccountingState;
  updateData: (updater: (prevState: BusinessAccountingState) => BusinessAccountingState) => void;
}

const BusinessAccounting: React.FC<BusinessAccountingProps> = ({ data, updateData }) => {
  const { month, accountingData } = data;

  const handleMonthChange = (newMonth: string) => updateData(prev => ({...prev, month: newMonth}));

  const handleInputChange = useCallback((index: number, field: keyof Omit<BusinessReportRow, 'id'>, value: string) => {
    updateData(prev => ({
      ...prev,
      accountingData: prev.accountingData.map((row, i) => i === index ? { ...row, [field]: value } : row)
    }));
  }, [updateData]);
  
  const addNewRow = useCallback(() => {
    updateData(prev => ({
      ...prev,
      accountingData: [...prev.accountingData, createEmptyRow(prev.accountingData.length)]
    }));
  }, [updateData]);

  const getRowRemainingCash = (row: BusinessReportRow) => {
    return (Number(row.cash) || 0) - (Number(row.expense) || 0);
  };

  const getRowTotal = (row: BusinessReportRow) => {
    return (Number(row.service) || 0) + (Number(row.cash) || 0);
  };

  const columnTotals = useMemo(() => {
    return accountingData.reduce(
      (totals, row) => {
        totals.service += Number(row.service) || 0;
        totals.cash += Number(row.cash) || 0;
        totals.expense += Number(row.expense) || 0;
        totals.remainingCash += getRowRemainingCash(row);
        totals.total += getRowTotal(row);
        return totals;
      },
      { service: 0, cash: 0, expense: 0, remainingCash: 0, total: 0 }
    );
  }, [accountingData]);
  
  const renderHeader = () => (
    <thead className="bg-gray-100 text-sm">
       <tr>
        <th colSpan={6} className="p-2 sm:p-3 bg-blue-500 text-white text-xl sm:text-2xl font-bold border-black border">
          BUSINESS ACCOUNTING REPORT
        </th>
      </tr>
      <tr>
        <th colSpan={3} className="p-2 text-left bg-green-500 text-white font-semibold border-black border">
          Jawharat Al Awal Cafe Company
        </th>
        <th colSpan={3} className="p-2 text-left bg-green-500 text-white font-semibold border-black border">
           <div className="flex items-center">
             <span className="mr-2">Month:</span>
             <input type="text" value={month} onChange={e => handleMonthChange(e.target.value)} className="bg-green-500 text-white p-1 rounded focus:outline-none w-full"/>
          </div>
        </th>
      </tr>
      <tr>
        <th className="p-1 sm:p-2 font-semibold border-black border">তারিখ (Date)</th>
        <th className="p-1 sm:p-2 font-semibold border-black border">সেবাকা(service)</th>
        <th className="p-1 sm:p-2 font-semibold border-black border">ক্যাশ (Cash)</th>
        <th className="p-1 sm:p-2 font-semibold border-black border">খরচ (Expense)</th>
        <th className="p-1 sm:p-2 font-semibold border-black border">অবশিষ্ট ক্যাশ (Remaining Cash)</th>
        <th className="p-1 sm:p-2 font-semibold border-black border">মোট (Total)</th>
      </tr>
    </thead>
  );
  
  const renderBody = () => (
    <tbody className="text-sm">
      {accountingData.map((row, index) => {
        const rowRemainingCash = getRowRemainingCash(row);
        const rowTotal = getRowTotal(row);
        return (
          <tr key={row.id} className="even:bg-gray-50">
            {(['date', 'service', 'cash', 'expense'] as const).map(field => (
               <td key={field} className="p-0 border-black border">
                 <input
                   type={field === 'date' ? 'date' : 'text'}
                   inputMode={field !== 'date' ? 'decimal' : undefined}
                   value={row[field]}
                   onChange={(e) => handleInputChange(index, field, e.target.value)}
                   className={`w-full h-full p-1 sm:p-2 bg-transparent focus:outline-none focus:bg-blue-100 ${field !== 'date' ? 'text-right' : ''}`}
                 />
              </td>
            ))}
            <td className="p-1 sm:p-2 text-right font-semibold text-gray-700 bg-gray-100 border-black border">
              {rowRemainingCash !== 0 ? rowRemainingCash.toLocaleString() : ''}
            </td>
            <td className="p-1 sm:p-2 text-right font-semibold text-gray-700 bg-gray-100 border-black border">
              {rowTotal !== 0 ? rowTotal.toLocaleString() : ''}
            </td>
          </tr>
        )
      })}
    </tbody>
  );
  
  const renderFooter = () => (
     <tfoot className="bg-gray-200 font-bold text-sm sm:text-base">
        <tr>
          <td className="p-1 sm:p-2 text-center border-black border">Total</td>
          <td className="p-1 sm:p-2 text-right border-black border">
            {columnTotals.service !== 0 ? columnTotals.service.toLocaleString() : ''}
          </td>
          <td className="p-1 sm:p-2 text-right border-black border">
            {columnTotals.cash !== 0 ? columnTotals.cash.toLocaleString() : ''}
          </td>
          <td className="p-1 sm:p-2 text-right border-black border">
            {columnTotals.expense !== 0 ? columnTotals.expense.toLocaleString() : ''}
          </td>
           <td className="p-1 sm:p-2 text-right border-black border">
            {columnTotals.remainingCash !== 0 ? columnTotals.remainingCash.toLocaleString() : ''}
          </td>
          <td className="p-1 sm:p-2 text-right border-black border">
            {columnTotals.total !== 0 ? columnTotals.total.toLocaleString() : ''}
          </td>
        </tr>
     </tfoot>
  );

  return (
    <div className="p-2 sm:p-4 overflow-x-auto">
      <div className="inline-block min-w-full">
        <table className="min-w-full border-collapse border border-black">
          {renderHeader()}
          {renderBody()}
          {renderFooter()}
        </table>
      </div>
      <div className="mt-4 flex justify-start no-print">
        <button
          onClick={addNewRow}
          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          Add New Row
        </button>
      </div>
    </div>
  );
};

export default BusinessAccounting;
