import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  FolderOpen, 
  Plus, 
  Trash2, 
  Search, 
  Calendar,
  TrendingUp,
  Eye,
  Folder,
  FileText
} from 'lucide-react';
import { AnalysisData, AnalysisFolder } from '@/types/analysis';

// Mock data - será substituído por dados do Supabase
const mockFolders: AnalysisFolder[] = [
  {
    id: '1',
    name: 'Ações de Dividendos',
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Small Caps',
    createdAt: new Date('2024-01-20')
  }
];

const mockAnalyses: AnalysisData[] = [
  {
    id: '1',
    ticker: 'PETR4',
    lpa: 2.5,
    vpa: 15.8,
    cagr: 8.5,
    dividends: [0.5, 0.6, 0.7],
    results: {
      graham: 20.45,
      proj: 25.75,
      bazin: 10.0,
      finalPrice: 18.96
    },
    createdAt: new Date('2024-01-22'),
    folderId: '1'
  },
  {
    id: '2',
    ticker: 'VALE3',
    lpa: 8.2,
    vpa: 42.1,
    cagr: 6.2,
    dividends: [1.2, 1.5, 1.8],
    results: {
      graham: 58.67,
      proj: 67.46,
      bazin: 25.0,
      finalPrice: 48.37
    },
    createdAt: new Date('2024-01-25'),
    folderId: '2'
  },
  {
    id: '3',
    ticker: 'BBDC4',
    lpa: 3.1,
    vpa: 18.5,
    cagr: 7.8,
    dividends: [0.8, 0.9, 1.1],
    results: {
      graham: 23.94,
      proj: 29.14,
      bazin: 15.56,
      finalPrice: 22.13
    },
    createdAt: new Date('2024-01-28')
  }
];

const SavedAnalysesList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [analyses] = useState<AnalysisData[]>(mockAnalyses);
  const [folders] = useState<AnalysisFolder[]>(mockFolders);

  const filteredAnalyses = analyses.filter(analysis => {
    const matchesSearch = analysis.ticker.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFolder = selectedFolder ? analysis.folderId === selectedFolder : true;
    return matchesSearch && matchesFolder;
  });

  const getFolderName = (folderId?: string) => {
    if (!folderId) return 'Sem pasta';
    return folders.find(f => f.id === folderId)?.name || 'Pasta desconhecida';
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
              Análises Salvas
            </h1>
            <p className="text-muted-foreground">
              Gerencie suas análises de preço justo organizadas por pastas
            </p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button variant="outline" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Pasta
            </Button>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Análise
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
              Todas
            </Button>
            {folders.map(folder => (
              <Button
                key={folder.id}
                variant={selectedFolder === folder.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFolder(folder.id!)}
                className="flex items-center gap-1"
              >
                <Folder className="h-3 w-3" />
                {folder.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Pastas */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {folders.map(folder => (
            <Card key={folder.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5 text-finance-primary" />
                    <CardTitle className="text-lg">{folder.name}</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    {analyses.filter(a => a.folderId === folder.id).length} análises
                  </span>
                  <span>{formatDate(folder.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Lista de Análises */}
        <div className="space-y-4">
          {filteredAnalyses.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhuma análise encontrada</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Tente ajustar os filtros de busca' : 'Faça sua primeira análise para vê-la aqui'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredAnalyses.map(analysis => (
              <Card key={analysis.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-primary p-2 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold">{analysis.ticker}</h3>
                          <Badge variant="secondary">{getFolderName(analysis.folderId)}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(analysis.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-success">
                        {formatCurrency(analysis.results.finalPrice)}
                      </div>
                      <p className="text-sm text-muted-foreground">Preço Justo</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        Ver
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Detalhes extras */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">LPA:</span>
                        <span className="ml-1 font-medium">{formatCurrency(analysis.lpa)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">VPA:</span>
                        <span className="ml-1 font-medium">{formatCurrency(analysis.vpa)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">CAGR:</span>
                        <span className="ml-1 font-medium">{analysis.cagr}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Graham:</span>
                        <span className="ml-1 font-medium">{formatCurrency(analysis.results.graham)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedAnalysesList;