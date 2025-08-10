import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAnalyses } from "@/hooks/useAnalyses";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  Plus, 
  Trash2, 
  FolderPlus, 
  Folder, 
  FileText, 
  ChevronDown, 
  ChevronUp,
  Edit3,
  Check,
  X,
  ArrowUpDown,
  Download,
  Calculator
} from "lucide-react";
import { Link } from "react-router-dom";
import jsPDF from 'jspdf';

const SavedAnalysesList = () => {
  const { analyses, folders, isLoading, createFolder, deleteFolder, deleteAnalysis, updateAnalysisNotes, moveAnalysisToFolder } = useAnalyses();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [expandedAnalyses, setExpandedAnalyses] = useState<Set<string>>(new Set());
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState("");

  const filteredAnalyses = analyses.filter(analysis => {
    const matchesSearch = analysis.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (analysis.notes && analysis.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesFolder = true;
    if (selectedFolder === "none") {
      matchesFolder = !analysis.folder_id;
    } else if (selectedFolder && selectedFolder !== "all") {
      matchesFolder = analysis.folder_id === selectedFolder;
    }
    
    return matchesSearch && matchesFolder;
  });

const getFolderName = (folderId?: string | null) => {
  if (!folderId) return "Sem pasta";
  const folder = folders.find(f => f.id === folderId);
  return folder ? folder.name : "Pasta desconhecida";
};

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      await createFolder(newFolderName.trim());
      setNewFolderName("");
      toast({
        title: "Pasta criada com sucesso!",
        description: `A pasta "${newFolderName}" foi criada.`
      });
    } catch (error) {
      toast({
        title: "Erro ao criar pasta",
        description: "Ocorreu um erro ao criar a pasta. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteFolder = async (folderId: string, folderName: string) => {
    if (!confirm(`Tem certeza que deseja excluir a pasta "${folderName}"? Todas as análises nesta pasta serão movidas para "Sem pasta".`)) {
      return;
    }

    try {
      await deleteFolder(folderId);
      setSelectedFolder(null);
      toast({
        title: "Pasta excluída com sucesso!",
        description: `A pasta "${folderName}" foi excluída.`
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir pasta",
        description: "Ocorreu um erro ao excluir a pasta. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAnalysis = async (analysisId: string, ticker: string) => {
    if (!confirm(`Tem certeza que deseja excluir a análise de ${ticker}?`)) {
      return;
    }

    try {
      await deleteAnalysis(analysisId);
      toast({
        title: "Análise excluída com sucesso!",
        description: `A análise de ${ticker} foi excluída.`
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir análise",
        description: "Ocorreu um erro ao excluir a análise. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateNotes = async (analysisId: string, notes: string) => {
    try {
      await updateAnalysisNotes(analysisId, notes);
      setEditingNotes(null);
      toast({
        title: "Anotações atualizadas!",
        description: "As anotações foram salvas com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar anotações",
        description: "Ocorreu um erro ao salvar as anotações. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleMoveAnalysis = async (analysisId: string, folderId: string | null) => {
    try {
      await moveAnalysisToFolder(analysisId, folderId);
      toast({
        title: "Análise movida com sucesso!",
        description: "A análise foi movida para a pasta selecionada."
      });
    } catch (error) {
      toast({
        title: "Erro ao mover análise",
        description: "Ocorreu um erro ao mover a análise. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleStartEditNotes = (analysisId: string, currentNotes: string) => {
    setEditingNotes(analysisId);
    setNoteValue(currentNotes || "");
  };

  const handleCancelEditNotes = () => {
    setEditingNotes(null);
    setNoteValue("");
  };

  const toggleExpanded = (analysisId: string) => {
    setExpandedAnalyses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(analysisId)) {
        newSet.delete(analysisId);
      } else {
        newSet.add(analysisId);
      }
      return newSet;
    });
  };

  const exportFolderToPDF = async (folderId: string | null) => {
  const folderAnalyses = analyses.filter(analysis => (folderId === null ? !analysis.folder_id : analysis.folder_id === folderId));
  const folderName = getFolderName(folderId);

    if (folderAnalyses.length === 0) {
      toast({
        title: "Nenhuma análise encontrada",
        description: "Esta pasta não contém análises para exportar.",
        variant: "destructive"
      });
      return;
    }

    try {
      const pdf = new jsPDF();
      
      for (let i = 0; i < folderAnalyses.length; i++) {
        const analysis = folderAnalyses[i];
        
        if (i > 0) {
          pdf.addPage();
        }

        // Header
        pdf.setFontSize(20);
        pdf.text(`Análise - ${analysis.ticker}`, 20, 30);
        
        pdf.setFontSize(12);
        pdf.text(`Pasta: ${folderName}`, 20, 45);
        pdf.text(`Data: ${formatDate(analysis.created_at)}`, 20, 55);

        // Linha central separadora
        pdf.setLineWidth(0.5);
        pdf.line(105, 70, 105, 280);

        // COLUNA ESQUERDA - Análise
        pdf.setFontSize(14);
        pdf.text('Preços Calculados:', 20, 75);
        
        pdf.setFontSize(11);
        pdf.text(`Graham 1: ${formatCurrency(analysis.graham_formula_1)}`, 25, 90);
        pdf.text(`Graham 2: ${formatCurrency(analysis.graham_formula_2)}`, 25, 100);
        pdf.text(`Bazin: ${formatCurrency(analysis.bazin_formula)}`, 25, 110);
        
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text(`Preço de Compra: ${formatCurrency(analysis.final_price)}`, 25, 125);
        pdf.setFont(undefined, 'normal');

        // Dados detalhados
        pdf.setFontSize(14);
        pdf.text('Dados Fundamentalistas:', 20, 145);
        
        pdf.setFontSize(11);
        pdf.text(`LPA: ${analysis.lpa.toFixed(2)}`, 25, 160);
        pdf.text(`VPA: ${analysis.vpa.toFixed(2)}`, 25, 170);
        pdf.text(`CAGR: ${analysis.cagr.toFixed(1)}%`, 25, 180);
        
        pdf.text('Dividendos dos últimos 5 anos:', 25, 195);
        pdf.text(`Ano 1: R$ ${analysis.dividend_year_1.toFixed(2)}`, 30, 205);
        pdf.text(`Ano 2: R$ ${analysis.dividend_year_2.toFixed(2)}`, 30, 215);
        pdf.text(`Ano 3: R$ ${analysis.dividend_year_3.toFixed(2)}`, 30, 225);
        pdf.text(`Ano 4: R$ ${analysis.dividend_year_4.toFixed(2)}`, 30, 235);
        pdf.text(`Ano 5: R$ ${analysis.dividend_year_5.toFixed(2)}`, 30, 245);

        // COLUNA DIREITA - Anotações
        if (analysis.notes && analysis.notes.trim()) {
          pdf.setFontSize(14);
          pdf.text('Anotações:', 110, 75);
          
          pdf.setFontSize(11);
          const splitNotes = pdf.splitTextToSize(analysis.notes, 85);
          pdf.text(splitNotes, 110, 90);
        }
      }

      pdf.save(`${folderName} - Análises.pdf`);
      
      toast({
        title: "PDF exportado com sucesso!",
        description: `${folderAnalyses.length} análise(s) exportada(s).`
      });
    } catch (error) {
      toast({
        title: "Erro ao exportar PDF",
        description: "Ocorreu um erro ao gerar o PDF. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando análises...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Análises Salvas</h1>
              <p className="text-slate-400">Gerencie as análises de suas ações</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por ticker ou anotações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
            
            <Select value={selectedFolder || "all"} onValueChange={(value) => setSelectedFolder(value)}>
              <SelectTrigger className="w-48 bg-slate-800/50 border-slate-600 text-white">
                <SelectValue placeholder="Todas as pastas" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="all">Todas as pastas</SelectItem>
                <SelectItem value="none">Sem pasta</SelectItem>
                {folders.map(folder => (
                  <SelectItem key={folder.id} value={folder.id!}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="default" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Nova Pasta
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-600">
                <DialogHeader>
                  <DialogTitle className="text-white">Criar Nova Pasta</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Nome da pasta"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="bg-slate-900/50 border-slate-600 text-white"
                  />
                  <Button 
                    onClick={handleCreateFolder} 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={!newFolderName.trim()}
                  >
                    Criar Pasta
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Folder Management */}
          {selectedFolder && selectedFolder !== "none" && selectedFolder !== "all" && (
            <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-slate-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Folder className="h-5 w-5 text-blue-400" />
                  <span className="text-white font-medium">
                    {getFolderName(selectedFolder)} ({filteredAnalyses.length} análises)
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportFolderToPDF(selectedFolder)}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar PDF
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      const folder = folders.find(f => f.id === selectedFolder);
                      if (folder) handleDeleteFolder(selectedFolder, folder.name);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir Pasta
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Export all for "Sem pasta" */}
          {selectedFolder === "none" && (
            <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-slate-600">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">
                  Sem pasta ({filteredAnalyses.length} análises)
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportFolderToPDF(null)}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Analysis Grid */}
        {filteredAnalyses.length === 0 ? (
          <div className="text-center py-12">
            <Calculator className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">Nenhuma análise encontrada</h3>
            <p className="text-slate-400 mb-6">
              {searchTerm || selectedFolder ? "Tente ajustar os filtros de busca." : "Comece criando sua primeira análise."}
            </p>
            {!searchTerm && !selectedFolder && (
              <Link to="/calculator">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Análise
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnalyses.map((analysis) => (
              <Card key={analysis.id} className="bg-slate-800/70 border-slate-600 hover:border-slate-500 transition-colors">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl text-white">{analysis.ticker}</CardTitle>
                    <Badge variant="outline" className="text-xs border-slate-500 text-slate-300">
                      {getFolderName(analysis.folder_id)}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-400">{formatDate(analysis.created_at)}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Always Visible Data */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-900/50 p-3 rounded-lg">
                      <p className="text-xs text-slate-400 mb-1">Graham 1</p>
                      <p className="text-sm text-green-400 font-medium">{formatCurrency(analysis.graham_formula_1)}</p>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-lg">
                      <p className="text-xs text-slate-400 mb-1">Graham 2</p>
                      <p className="text-sm text-green-400 font-medium">{formatCurrency(analysis.graham_formula_2)}</p>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-lg">
                      <p className="text-xs text-slate-400 mb-1">Bazin</p>
                      <p className="text-sm text-green-400 font-medium">{formatCurrency(analysis.bazin_formula)}</p>
                    </div>
                    <div className="bg-gradient-to-r from-green-600 to-blue-600 p-3 rounded-lg">
                      <p className="text-xs text-white/80 mb-1">Preço de Compra</p>
                      <p className="text-sm text-white font-bold">{formatCurrency(analysis.final_price)}</p>
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">Anotações</span>
                      {editingNotes !== analysis.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStartEditNotes(analysis.id!, analysis.notes)}
                          className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    
                    {editingNotes === analysis.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={noteValue}
                          onChange={(e) => setNoteValue(e.target.value)}
                          placeholder="Adicione suas anotações..."
                          className="bg-slate-900/50 border-slate-600 text-white text-sm resize-none"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleUpdateNotes(analysis.id!, noteValue)}
                            className="bg-green-600 hover:bg-green-700 text-xs"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Salvar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancelEditNotes}
                            className="border-slate-600 text-slate-300 text-xs"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-900/30 p-2 rounded text-xs text-slate-300 min-h-[60px] max-h-[120px] border border-slate-700">
                        <ScrollArea className="h-full max-h-[104px]">
                          <div className="whitespace-pre-wrap pr-2">
                            {analysis.notes || "Nenhuma anotação"}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </div>

                  {/* Expandable Details */}
                  <Collapsible open={expandedAnalyses.has(analysis.id!)} onOpenChange={() => toggleExpanded(analysis.id!)}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full text-slate-300 hover:text-white justify-between p-2">
                        <span className="text-sm">Dados detalhados</span>
                        {expandedAnalyses.has(analysis.id!) ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                        }
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-3 pt-3 border-t border-slate-700">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-400">LPA:</span>
                          <span className="text-white ml-2">{analysis.lpa.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">VPA:</span>
                          <span className="text-white ml-2">{analysis.vpa.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">CAGR Lucros 5 anos:</span>
                          <span className="text-white ml-2">{analysis.cagr.toFixed(1)}%</span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-slate-400 text-xs mb-2">Dividendos (5 anos):</p>
                        <div className="grid grid-cols-5 gap-2 text-xs">
                          <div className="bg-slate-900/50 p-2 rounded text-center">
                            <p className="text-slate-400">Ano 1</p>
                            <p className="text-white">R$ {analysis.dividend_year_1.toFixed(2)}</p>
                          </div>
                          <div className="bg-slate-900/50 p-2 rounded text-center">
                            <p className="text-slate-400">Ano 2</p>
                            <p className="text-white">R$ {analysis.dividend_year_2.toFixed(2)}</p>
                          </div>
                          <div className="bg-slate-900/50 p-2 rounded text-center">
                            <p className="text-slate-400">Ano 3</p>
                            <p className="text-white">R$ {analysis.dividend_year_3.toFixed(2)}</p>
                          </div>
                          <div className="bg-slate-900/50 p-2 rounded text-center">
                            <p className="text-slate-400">Ano 4</p>
                            <p className="text-white">R$ {analysis.dividend_year_4.toFixed(2)}</p>
                          </div>
                          <div className="bg-slate-900/50 p-2 rounded text-center">
                            <p className="text-slate-400">Ano 5</p>
                            <p className="text-white">R$ {analysis.dividend_year_5.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2 border-t border-slate-700">
                    <Select 
                      value={analysis.folder_id || "no-folder"} 
                      onValueChange={(value) => handleMoveAnalysis(analysis.id!, value === "no-folder" ? null : value)}
                    >
                      <SelectTrigger className="flex-1 bg-slate-900/50 border-slate-600 text-white text-xs h-8">
                        <ArrowUpDown className="h-3 w-3 mr-1" />
                        <SelectValue placeholder="Mover para..." />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="no-folder">Sem pasta</SelectItem>
                        {folders.map(folder => (
                          <SelectItem key={folder.id} value={folder.id!}>
                            {folder.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteAnalysis(analysis.id!, analysis.ticker)}
                      className="h-8 px-3"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
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
