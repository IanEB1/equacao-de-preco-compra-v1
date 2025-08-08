-- Add two new dividend columns for 5-year dividend support
ALTER TABLE public.stock_analyses
  ADD COLUMN IF NOT EXISTS dividend_year_4 numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS dividend_year_5 numeric NOT NULL DEFAULT 0;