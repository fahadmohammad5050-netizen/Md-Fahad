import React, { useState, useMemo, useCallback } from 'react';
import { SalesRow, SalesPerson, SalesState } from '../types';

const SALESPEOPLE: SalesPerson[] = ['bilal', 'shahjahan', 'belal', 'shakil', 'cash'];

const createEmptyRow = (id: number): SalesRow => ({
  id,
  bilal: '',
  shahjahan: '',
  belal: '',
  shakil: '',
  cash: '',
});

interface DailySalesCountProps {
  data: SalesState;
  updateData: (updater: (prevState: SalesState) => SalesState) => void;
}

const DailySalesCount: React.FC<DailySalesCountProps> = ({ data, updateData }) => {
  const { salesData, salesPersonDisplayNames, currentDate } = data;
  const [errors, setErrors] = useState<Record<number, Partial<Record<SalesPerson, boolean>>>>({});

  const handleHeaderChange = useCallback((person: SalesPerson, value: string) => {
    updateData(prev => ({
      ...prev,
      salesPersonDisplayNames: { ...prev.salesPersonDisplayNames, [person]: value }
    }));
  }, [updateData]);
  
  const handleDateChange = useCallback((newDate: string) => {
    updateData(prev => ({...prev, currentDate: newDate }));
  }, [updateData]);

  const handleInputChange = useCallback((rowIndex: number, person: SalesPerson, value: string) => {
    const isValid = value === '' || /^-?\d*\.?\d*$/.test(value);

    setErrors(prev => {
        const newRowErrors = { ...(prev[rowIndex] || {}) };
        if (isValid) {
            delete newRowErrors[person];
        } else {
            newRowErrors[person] = true;
        }
        
        if (Object.keys(newRowErrors).length === 0) {
            const newErrors = {...prev};
            delete newErrors[rowIndex];
            return newErrors;
        }
        return { ...prev, [rowIndex]: newRowErrors };
    });

    updateData(prev => ({
      ...prev,
      salesData: prev.salesData.map((row, index) =>
        index === rowIndex ? { ...row, [person]: value } : row
      )
    }));
  }, [updateData]);
  
  const handleBlur = useCallback((rowIndex: number, person: SalesPerson) => {
    const value = salesData[rowIndex][person];
    if (Number(value) === 0 && value !== '') {
      updateData(prev => ({
        ...prev,
        salesData: prev.salesData.map((row, index) =>
          index === rowIndex ? { ...row, [person]: '' } : row
        )
      }));
    }
  }, [salesData, updateData]);

  const addNewRow = useCallback(() => {
    updateData(prev => ({
      ...prev,
      salesData: [...prev.salesData, createEmptyRow(prev.salesData.length)]
    }));
  }, [updateData]);

  const columnTotals = useMemo(() => {
    const totals: Record<SalesPerson, number> = { bilal: 0, shahjahan: 0, belal: 0, shakil: 0, cash: 0 };
    for (const row of salesData) {
      for (const person of SALESPEOPLE) {
        totals[person] += Number(row[person]) || 0;
      }
    }
    return totals;
  }, [salesData]);

  const grandTotal = useMemo(() => {
    return Object.values(columnTotals).reduce((sum, total) => sum + total, 0);
  }, [columnTotals]);
  
  const renderHeader = () => (
    <thead className="bg-gray-100">
      <tr>
        <th colSpan={SALESPEOPLE.length + 1} className="p-3 sm:p-4 bg-blue-200 text-gray-800 text-xl sm:text-2xl font-bold border-black border">
          Daily Sales Count
        </th>
      </tr>
      <tr>
        <th className="p-2 text-left bg-green-500 text-white font-semibold border-black border-r" colSpan={2}>
          <div className="flex items-center">
             <span className="mr-2">Date:</span>
             <input type="date" value={currentDate} onChange={e => handleDateChange(e.target.value)} className="bg-green-500 text-white p-1 rounded focus:outline-none"/>
          </div>
        </th>
        <th className="p-2 text-center bg-green-500 text-white font-bold border-black border-l text-lg sm:text-xl" colSpan={SALESPEOPLE.length - 1}>
          {grandTotal !== 0 ? `Total: ${grandTotal.toLocaleString()}` : ''}
        </th>
      </tr>
      <tr>
        <th className="p-2 w-12 sm:w-16 text-center bg-pink-300 text-gray-800 font-semibold border-black border">#</th>
        {SALESPEOPLE.map(person => (
          <th key={person} className="p-0 bg-pink-300 text-gray-800 font-semibold border-black border align-middle">
            <input
              type="text"
              value={salesPersonDisplayNames[person]}
              onChange={e => handleHeaderChange(person, e.target.value)}
              className="w-full p-1 sm:p-2 bg-transparent text-center font-semibold focus:outline-none focus:bg-pink-100 transition-colors duration-200"
              aria-label={`Edit column name for ${salesPersonDisplayNames[person]}`}
            />
          </th>
        ))}
      </tr>
    </thead>
  );

  const renderBody = () => (
    <tbody>
      {salesData.map((row, rowIndex) => {
        return (
          <tr key={row.id} className="even:bg-gray-50">
            <td className="p-0 text-center font-medium text-gray-500 border-black border">{rowIndex + 1}</td>
            {SALESPEOPLE.map(person => {
              const hasError = !!errors[rowIndex]?.[person];
              return (
              <td key={person} className="p-0 border-black border">
                <input
                  type="text"
                  inputMode="decimal"
                  value={row[person]}
                  onChange={e => handleInputChange(rowIndex, person, e.target.value)}
                  onBlur={() => handleBlur(rowIndex, person)}
                  className={`w-full h-full p-1 sm:p-2 text-right bg-transparent focus:outline-none focus:bg-blue-100 ${
                    hasError ? 'ring-2 ring-inset ring-red-500' : ''
                  }`}
                  placeholder="0"
                  aria-invalid={hasError}
                />
              </td>
            )})}
          </tr>
        );
      })}
    </tbody>
  );

  const renderFooter = () => (
    <tfoot className="bg-green-300 font-bold text-gray-800 text-sm sm:text-base">
      <tr>
        <td className="p-1 sm:p-2 text-center border-black border">Total</td>
        {SALESPEOPLE.map(person => (
          <td key={person} className="p-1 sm:p-2 text-right border-black border">
            {columnTotals[person] !== 0 ? columnTotals[person].toLocaleString() : ''}
          </td>
        ))}
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

export default DailySalesCount;
