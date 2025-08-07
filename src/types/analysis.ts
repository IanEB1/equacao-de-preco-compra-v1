export interface CalculationResults {
  graham: number;
  proj: number;
  bazin: number;
  finalPrice: number;
}

export interface AnalysisData {
  id?: string;
  ticker: string;
  lpa: number;
  vpa: number;
  cagr: number;
  dividend_year_1: number;
  dividend_year_2: number;
  dividend_year_3: number;
  graham_formula_1: number;
  graham_formula_2: number;
  bazin_formula: number;
  final_price: number;
  notes: string;
  created_at: string;
  updated_at?: string;
  user_id?: string;
  folder_id?: string;
}

export interface AnalysisFolder {
  id?: string;
  name: string;
  user_id?: string;
  created_at: string;
  updated_at?: string;
}