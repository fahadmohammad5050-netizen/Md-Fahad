export interface SalesRow {
  id: number;
  bilal: string;
  shahjahan: string;
  belal: string;
  shakil: string;
  cash: string;
}

export type SalesPerson = keyof Omit<SalesRow, 'id'>;

export interface StatementExpense {
  id: number;
  details: string;
  amount: string;
}

export interface StatementClosing {
  atm: string;
  cash: string;
}

export interface BusinessReportRow {
  id: number;
  date: string;
  service: string;
  cash: string;
  expense: string;
}

// State types for each component
export interface SalesState {
  salesData: SalesRow[];
  salesPersonDisplayNames: Record<SalesPerson, string>;
  currentDate: string;
}

export interface StatementState {
  day: string;
  date: string;
  dayClosing: StatementClosing;
  nightClosing: StatementClosing;
  expenses: StatementExpense[];
}

export interface BusinessAccountingState {
  month: string;
  accountingData: BusinessReportRow[];
}

// A single type representing the entire app's data state
export interface AppData {
  sales: SalesState;
  statement: StatementState;
  accounting: BusinessAccountingState;
}
