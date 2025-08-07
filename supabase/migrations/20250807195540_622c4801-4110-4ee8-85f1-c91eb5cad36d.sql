-- Add notes field to stock_analyses table
ALTER TABLE public.stock_analyses 
ADD COLUMN notes TEXT DEFAULT '';