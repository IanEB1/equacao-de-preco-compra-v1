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
  dividends: number[];
  results: CalculationResults;
  createdAt: Date;
  userId?: string;
  folderId?: string;
}

export interface AnalysisFolder {
  id?: string;
  name: string;
  userId?: string;
  createdAt: Date;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}