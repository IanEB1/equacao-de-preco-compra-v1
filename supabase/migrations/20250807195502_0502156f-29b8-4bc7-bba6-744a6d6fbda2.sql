-- Add notes field to stock_analyses table
ALTER TABLE public.stock_analyses 
ADD COLUMN notes TEXT DEFAULT '';

-- Add trigger to update updated_at when notes are modified
CREATE TRIGGER update_stock_analyses_updated_at
  BEFORE UPDATE ON public.stock_analyses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();