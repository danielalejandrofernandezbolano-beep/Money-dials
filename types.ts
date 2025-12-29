
export interface Dial {
  id: string;
  name: string;
  value: number;
  description?: string;
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
  [key: string]: any;
}
