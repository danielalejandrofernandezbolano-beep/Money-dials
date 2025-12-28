
export interface Dial {
  id: string;
  name: string;
  value: number;
}

export interface BudgetData {
  income: number;
  fixed: {
    rent: number;
    utilities: number;
    other: number;
  };
  future: {
    savings: number;
    investment: number;
  };
  dials: Dial[];
}

export interface ChartDataItem {
  name: string;
  value: number;
  color: string;
  // Added index signature to resolve TS error with Recharts data mapping
  [key: string]: any;
}
