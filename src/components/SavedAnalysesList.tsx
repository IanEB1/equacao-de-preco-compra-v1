import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, FolderPlus, Plus, Trash2, Calendar, TrendingUp } from 'lucide-react';
import { AnalysisData, AnalysisFolder } from '@/types/analysis';
import { useAnalyses } from '@/hooks/useAnalyses';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const SavedAnalysesList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  
  const { 
    analyses, 
    folders, 
    isLoading, 
    createFolder, 
    deleteFolder, 
    deleteAnalysis 
  } = useAnalyses();
  
  const { toast } = useToast();

  // Filter analyses based on search term and selected folder
  const filteredAnalyses = analyses.filter(analysis => {
    const matchesSearch = analysis.ticker.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFolder = selectedFolder === null || analysis.folder_id === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  const getFolderName = (folderId?: string): string => {
    if (!folderId) return 'Sem pasta';
    const folder = folders.find(f => f.id === folderId);
    return folder?.name || 'Pasta não encontrada';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast({
        title: "Nome inválido",
        description: "Por favor, insira um nome para a pasta.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createFolder(newFolderName.trim());
      setNewFolderName('');
      setIsCreateFolderOpen(false);
      toast({
        title: "Pasta criada",
        description: `A pasta "${newFolderName}" foi criada com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao criar pasta",
        description: "Ocorreu um erro ao criar a pasta. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFolder = async (folderId: string, folderName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a pasta "${folderName}"? As análises dentro dela não serão excluídas.`)) {
      try {
        await deleteFolder(folderId);
        if (selectedFolder === folderId) {
          setSelectedFolder(null);
        }
        toast({
          title: "Pasta excluída",
          description: `A pasta "${folderName}" foi excluída com sucesso.`,
        });
      } catch (error) {
        toast({
          title: "Erro ao excluir pasta",
          description: "Ocorreu um erro ao excluir a pasta. Tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteAnalysis = async (analysisId: string, ticker: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a análise de ${ticker}?`)) {
      try {
        await deleteAnalysis(analysisId);
        toast({
          title: "Análise excluída",
          description: `A análise de ${ticker} foi excluída com sucesso.`,
        });
      } catch (error) {
        toast({
          title: "Erro ao excluir análise",
          description: "Ocorreu um erro ao excluir a análise. Tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando análises...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Análises Salvas</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie suas análises de ações e organize em pastas
            </p>
          </div>
          
          <div className="flex gap-3">
            <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <FolderPlus className="h-4 w-4" />
                  Nova Pasta
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Pasta</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="folder-name">Nome da Pasta</Label>
                    <Input
                      id="folder-name"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="Ex: Ações Defensivas"
                      className="mt-1"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateFolderOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateFolder}>
                      Criar Pasta
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por ticker..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedFolder === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFolder(null)}
            >
              Todas ({analyses.length})
            </Button>
            {folders.map((folder) => (
              <div key={folder.id} className="flex items-center gap-1">
                <Button
                  variant={selectedFolder === folder.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFolder(folder.id!)}
                  className="flex items-center gap-1"
                >
                  {folder.name} ({analyses.filter(a => a.folder_id === folder.id).length})
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteFolder(folder.id!, folder.name)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Analyses Grid */}
        {filteredAnalyses.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {searchTerm || selectedFolder ? 'Nenhuma análise encontrada' : 'Nenhuma análise salva'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || selectedFolder 
                  ? 'Tente ajustar os filtros ou realizar uma nova busca.'
                  : 'Comece criando sua primeira análise na calculadora.'
                }
              </p>
              {!searchTerm && !selectedFolder && (
                <Button asChild>
                  <a href="/calculator">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Análise
                  </a>
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnalyses.map((analysis) => (
              <Card key={analysis.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-bold text-primary">
                        {analysis.ticker}
                      </CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {getFolderName(analysis.folder_id)}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAnalysis(analysis.id!, analysis.ticker)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {formatDate(analysis.created_at)}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Graham 1:</span>
                      <p className="font-semibold">{formatCurrency(analysis.graham_formula_1)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Graham 2:</span>
                      <p className="font-semibold">{formatCurrency(analysis.graham_formula_2)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Bazin:</span>
                      <p className="font-semibold">{formatCurrency(analysis.bazin_formula)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">LPA:</span>
                      <p className="font-semibold">R$ {analysis.lpa.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">Preço Justo Final:</span>
                      <span className="text-lg font-bold text-primary">
                        {formatCurrency(analysis.final_price)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedAnalysesList;