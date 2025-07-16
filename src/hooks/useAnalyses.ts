import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AnalysisData, AnalysisFolder } from '@/types/analysis';
import { useAuth } from '@/components/auth/AuthContext';

export const useAnalyses = () => {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<AnalysisData[]>([]);
  const [folders, setFolders] = useState<AnalysisFolder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFolders = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('analysis_folders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching folders:', error);
      return;
    }

    setFolders(data || []);
  };

  const fetchAnalyses = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('stock_analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching analyses:', error);
      return;
    }

    setAnalyses(data || []);
  };

  const createFolder = async (name: string) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('analysis_folders')
      .insert([
        {
          name,
          user_id: user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating folder:', error);
      throw new Error('Falha ao criar pasta');
    }

    await fetchFolders();
    return data;
  };

  const deleteFolder = async (folderId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('analysis_folders')
      .delete()
      .eq('id', folderId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting folder:', error);
      throw new Error('Falha ao excluir pasta');
    }

    await fetchFolders();
    await fetchAnalyses(); // Refresh analyses as well since folder references might have changed
  };

  const saveAnalysis = async (analysisData: Omit<AnalysisData, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('stock_analyses')
      .insert([
        {
          ...analysisData,
          user_id: user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error saving analysis:', error);
      throw new Error('Falha ao salvar análise');
    }

    await fetchAnalyses();
    return data;
  };

  const deleteAnalysis = async (analysisId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('stock_analyses')
      .delete()
      .eq('id', analysisId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting analysis:', error);
      throw new Error('Falha ao excluir análise');
    }

    await fetchAnalyses();
  };

  useEffect(() => {
    if (user) {
      Promise.all([fetchFolders(), fetchAnalyses()]).finally(() => {
        setIsLoading(false);
      });
    } else {
      setAnalyses([]);
      setFolders([]);
      setIsLoading(false);
    }
  }, [user]);

  return {
    analyses,
    folders,
    isLoading,
    createFolder,
    deleteFolder,
    saveAnalysis,
    deleteAnalysis,
    refreshData: () => Promise.all([fetchFolders(), fetchAnalyses()]),
  };
};