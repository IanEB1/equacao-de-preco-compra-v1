import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, Download, FileText } from 'lucide-react';
const DataEntryChoice = () => {
  const navigate = useNavigate();
  const handleManualEntry = () => {
    navigate('/calculator');
  };
  const handleAutoEntry = () => {
    // Futuramente será implementado com API
    alert('Busca automática será implementada em breve!');
  };
  return <div className="container mx-auto px-6 py-16 min-h-[80vh] flex items-center">
      <div className="max-w-7xl mx-auto text-center w-full">
        <h1 className="text-4xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
          Como você deseja inserir os dados?
        </h1>
        <p className="text-lg text-muted-foreground mb-8">Escolha a forma mais conveniente para calcular o preço de compra para sua ação</p>

        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Entrada Manual */}
          <Card className="border-2 hover:border-primary transition-colors cursor-pointer group">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-gradient-primary rounded-full group-hover:scale-110 transition-transform">
                  <Calculator className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-xl">Digitar Dados Manualmente</CardTitle>
              <CardDescription className="text-base">
                Insira os dados financeiros da empresa manualmente para uma análise personalizada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Controle total sobre os dados
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Análise imediata
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Funciona offline
                </li>
              </ul>
              <Button onClick={handleManualEntry} className="w-full bg-gradient-primary hover:opacity-90" size="lg">
                Começar Análise Manual
              </Button>
            </CardContent>
          </Card>

          {/* Busca Automática */}
          <Card className="border-2 border-muted hover:border-muted transition-colors opacity-75">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-muted rounded-full">
                  <Download className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              <CardTitle className="text-xl text-muted-foreground">
                Buscar Dados Automaticamente
              </CardTitle>
              <CardDescription className="text-base">Busque os dados financeiros automaticamente através de API especializada</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Dados sempre atualizados
                </li>
                <li className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Economiza tempo
                </li>
                <li className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Reduz erros de digitação
                </li>
              </ul>
              <Button onClick={handleAutoEntry} disabled className="w-full" variant="secondary" size="lg">
                Em Breve
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
};
export default DataEntryChoice;