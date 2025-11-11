import React, { useMemo, useCallback } from 'react';
import { StatementClosing, StatementExpense, StatementState } from '../types';

const createEmptyExpenseRow = (id: number): StatementExpense => ({
  id,
  details: '',
  amount: '',
});

interface DailyStatementProps {
  data: StatementState;
  updateData: (updater: (prevState: StatementState) => StatementState) => void;
}

const DailyStatement: React.FC<DailyStatementProps> = ({ data, updateData }) => {
  const { day, date, dayClosing, nightClosing, expenses } = data;

  const handleDayChange = (newDay: string) => updateData(prev => ({...prev, day: newDay}));
  const handleDateChange = (newDate: string) => updateData(prev => ({...prev, date: newDate}));

  const handleClosingChange = useCallback((type: 'day' | 'night', field: 'atm' | 'cash', value: string) => {
    const key = type === 'day' ? 'dayClosing' : 'nightClosing';
    updateData(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value }
    }));
  }, [updateData]);

  const handleExpenseChange = useCallback((index: number, field: keyof Omit<StatementExpense, 'id'>, value: string) => {
    updateData(prev => ({
      ...prev,
      expenses: prev.expenses.map((row, i) => i === index ? { ...row, [field]: value } : row)
    }));
  }, [updateData]);
  
  const addExpenseRow = useCallback(() => {
    updateData(prev => ({
      ...prev,
      expenses: [...prev.expenses, createEmptyExpenseRow(prev.expenses.length)]
    }));
  }, [updateData]);

  const dayClosingTotal = useMemo(() => (Number(dayClosing.atm) || 0) + (Number(dayClosing.cash) || 0), [dayClosing]);
  const nightClosingTotal = useMemo(() => (Number(nightClosing.atm) || 0) + (Number(nightClosing.cash) || 0), [nightClosing]);

  const totalClosingAtm = useMemo(() => (Number(dayClosing.atm) || 0) + (Number(nightClosing.atm) || 0), [dayClosing.atm, nightClosing.atm]);
  const totalClosingCash = useMemo(() => (Number(dayClosing.cash) || 0) + (Number(nightClosing.cash) || 0), [dayClosing.cash, nightClosing.cash]);
  const totalClosing = useMemo(() => totalClosingAtm + totalClosingCash, [totalClosingAtm, totalClosingCash]);
  
  const totalExpenses = useMemo(() => expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0), [expenses]);
  const netCash = useMemo(() => totalClosingCash - totalExpenses, [totalClosingCash, totalExpenses]);

  const renderClosingRow = (label: string, value: string | number, isTotal = false) => (
    <div className={`flex justify-between items-center py-1 px-2 gap-2 ${isTotal ? 'font-bold' : ''}`}>
      <span className="text-gray-700 flex-shrink-0">{label}</span>
      <span className="w-full max-w-[150px] p-1 text-right bg-gray-100 rounded">
        {Number(value) > 0 ? Number(value).toLocaleString() : ''}
      </span>
    </div>
  );
  
  const renderClosingInputRow = (label: string, value: string, onChange: (val: string) => void) => (
     <div className="flex justify-between items-center py-1 px-2 gap-2">
      <label className="text-gray-700 flex-shrink-0">{label}</label>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full max-w-[150px] p-1 text-right border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="0"
      />
    </div>
  );

  return (
    <div className="p-2 sm:p-4">
      <header className="p-3 bg-blue-500 text-white text-center rounded-t-lg">
        <h2 className="text-xl sm:text-2xl font-bold">Jawharat Al Awal Cafe Company</h2>
        <h3 className="text-lg sm:text-xl">Daily statement</h3>
      </header>
      
      <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-4 p-2 bg-gray-100 border-b-2 border-gray-300">
        <div className="flex items-center">
          <label htmlFor="day-input" className="font-semibold mr-2 w-12">Day:</label>
          <input id="day-input" type="text" value={day} onChange={e => handleDayChange(e.target.value)} className="p-1 border rounded w-full sm:w-40"/>
        </div>
        <div className="flex items-center">
           <label htmlFor="date-input" className="font-semibold mr-2 w-12">Date:</label>
           <input id="date-input" type="date" value={date} onChange={e => handleDateChange(e.target.value)} className="p-1 border rounded w-full sm:w-auto"/>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Left Side: Closings */}
        <div className="space-y-4 border border-gray-300 rounded-lg p-3">
          {/* Day Closing */}
          <section>
            <h4 className="font-bold text-lg bg-gray-200 p-2 rounded">Day Closing</h4>
            <div className="mt-2 space-y-1">
              {renderClosingInputRow('ATM', dayClosing.atm, val => handleClosingChange('day', 'atm', val))}
              {renderClosingInputRow('Cash', dayClosing.cash, val => handleClosingChange('day', 'cash', val))}
              {renderClosingRow('Total', dayClosingTotal, true)}
            </div>
          </section>
          
           {/* Night Closing */}
          <section>
            <h4 className="font-bold text-lg bg-gray-200 p-2 rounded">Night Closing</h4>
            <div className="mt-2 space-y-1">
              {renderClosingInputRow('ATM', nightClosing.atm, val => handleClosingChange('night', 'atm', val))}
              {renderClosingInputRow('Cash', nightClosing.cash, val => handleClosingChange('night', 'cash', val))}
              {renderClosingRow('Total', nightClosingTotal, true)}
            </div>
          </section>
          
          {/* Total Closing */}
          <section>
            <h4 className="font-bold text-lg bg-gray-200 p-2 rounded">Total Closing</h4>
            <div className="mt-2 space-y-1">
              {renderClosingRow('ATM', totalClosingAtm)}
              {renderClosingRow('Cash', totalClosingCash)}
              {renderClosingRow('Total', totalClosing, true)}
            </div>
          </section>
        </div>

        {/* Right Side: Expenses */}
        <div className="border border-gray-300 rounded-lg p-3">
           <h4 className="font-bold text-lg bg-gray-200 p-2 rounded text-center">Expenses/Invoices</h4>
           <div className="overflow-x-auto mt-2">
             <table className="min-w-full">
               <thead className="bg-gray-100">
                 <tr>
                   <th className="p-1 sm:p-2 text-left font-semibold border">Details</th>
                   <th className="p-1 sm:p-2 text-left font-semibold border w-28 sm:w-32">Amount</th>
                 </tr>
               </thead>
               <tbody>
                 {expenses.map((expense, index) => (
                   <tr key={expense.id}>
                     <td className="p-0 border">
                       <input type="text" value={expense.details} onChange={e => handleExpenseChange(index, 'details', e.target.value)} className="w-full p-1 sm:p-2 bg-transparent focus:outline-none"/>
                     </td>
                     <td className="p-0 border">
                       <input type="text" inputMode="decimal" value={expense.amount} onChange={e => handleExpenseChange(index, 'amount', e.target.value)} className="w-full p-1 sm:p-2 text-right bg-transparent focus:outline-none"/>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
           <div className="mt-2 flex justify-start no-print">
            <button
              onClick={addExpenseRow}
              className="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Expense
            </button>
          </div>
        </div>
      </div>
      
      {/* Footer Totals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 font-bold text-base sm:text-lg">
        <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-200 rounded-lg">
          <span className="mr-4">Net Cash</span>
          <span className="w-2/5 p-1 text-right bg-white rounded border border-gray-400">
            {netCash.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-200 rounded-lg">
          <span className="mr-4">Total Expenses</span>
          <span className="w-2/5 p-1 text-right bg-white rounded border border-gray-400">
            {totalExpenses > 0 ? totalExpenses.toLocaleString() : ''}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DailyStatement;
