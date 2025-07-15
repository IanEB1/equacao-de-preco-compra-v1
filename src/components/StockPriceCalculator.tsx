import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AnalysisData } from "@/types/analysis";
import { useAnalyses } from "@/hooks/useAnalyses";
import { Calculator, TrendingUp, DollarSign } from "lucide-react";

interface CalculationResults {
  graham: number;
  proj: number;
  bazin: number;
  finalPrice: number;
}

const StockPriceCalculator = () => {
  const [ticker, setTicker] = useState("");
  const [lpa, setLpa] = useState("");
  const [vpa, setVpa] = useState("");
  const [cagr, setCagr] = useState("");
  const [d1, setD1] = useState("");
  const [d2, setD2] = useState("");
  const [d3, setD3] = useState("");
  const [results, setResults] = useState<CalculationResults | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { saveAnalysis: saveToDatabase } = useAnalyses();

  const calculatePrice = () => {
    const lpaNum = parseFloat(lpa);
    const vpaNum = parseFloat(vpa);
    const cagrNum = parseFloat(cagr);
    const d1Num = parseFloat(d1);
    const d2Num = parseFloat(d2);
    const d3Num = parseFloat(d3);
    
    // Check if all required fields are filled (all except ticker)
    if (!lpaNum || !vpaNum || !cagrNum || !d1Num || !d2Num || !d3Num) {
      toast({
        title: "Dados obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios para gerar a análise.",
        variant: "destructive"
      });
      return;
    }

    // Cálculos das fórmulas originais
    const graham = Math.sqrt(10.5 * lpaNum * vpaNum);
    const proj = lpaNum * (7 + 2 * (cagrNum / 100));
    const bazin = (d1Num + d2Num + d3Num) / 0.18;
    const finalPrice = (graham + proj * 1.5 + bazin * 0.5) / 3 * 0.8;
    setResults({
      graham,
      proj,
      bazin,
      finalPrice
    });
  };

  const clearData = () => {
    setTicker("");
    setLpa("");
    setVpa("");
    setCagr("");
    setD1("");
    setD2("");
    setD3("");
    setResults(null);
  };

  const saveAnalysis = async () => {
    if (!results || !ticker.trim()) {
      toast({
        title: "Análise não encontrada",
        description: "Gere uma análise antes de salvar.",
        variant: "destructive"
      });
      return;
    }

    // Validate that all required fields are filled
    const lpaNum = parseFloat(lpa);
    const vpaNum = parseFloat(vpa);
    const d1Num = parseFloat(d1);
    const d2Num = parseFloat(d2);
    const d3Num = parseFloat(d3);

    if (!lpaNum || !vpaNum || !d1Num || !d2Num || !d3Num) {
      toast({
        title: "Dados incompletos",
        description: "Todos os campos obrigatórios devem estar preenchidos para salvar.",
        variant: "destructive"
      });
      return;
    }

    const analysisData = {
      ticker: ticker.toUpperCase(),
      lpa: lpaNum,
      vpa: vpaNum,
      cagr: parseFloat(cagr) || 0,
      dividend_year_1: d1Num,
      dividend_year_2: d2Num,
      dividend_year_3: d3Num,
      graham_formula_1: results.graham,
      graham_formula_2: results.proj,
      bazin_formula: results.bazin,
      final_price: results.finalPrice,
      folder_id: undefined
    };

    try {
      await saveToDatabase(analysisData);
      toast({
        title: "Análise salva com sucesso!",
        description: `A análise de ${ticker.toUpperCase()} foi salva.`
      });
    } catch (error) {
      console.error('Erro ao salvar análise:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar a análise. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] px-4 py-8">
      {/* Header com botão voltar */}
      <div className="max-w-6xl mx-auto mb-8">
        <Button variant="outline" size="sm" onClick={() => navigate('/data-entry-choice')} className="flex items-center gap-2 mb-6 border-slate-600 text-slate-300 hover:bg-slate-700">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>

      {/* Cabeçalho Principal */}
      <div className="max-w-6xl mx-auto text-center mb-12">
        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Calculator className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">
          Equação de Preço-Compra
        </h1>
        <p className="text-slate-400 text-lg">
          Análise fundamentalista baseada nas metodologias adaptadas de Graham e Bazin
        </p>
      </div>

      {/* Grid Principal com dois cards */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
        {/* Card Esquerdo - Dados da Empresa */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-blue-400" />
              <CardTitle className="text-white text-xl">Dados da Empresa</CardTitle>
            </div>
            <CardDescription className="text-slate-400">
              Digite os dados fundamentalistas da ação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Campo do Ticker */}
            <div className="space-y-2">
              <Label htmlFor="ticker" className="text-white font-medium">
                Ticker da Ação
              </Label>
              <Input id="ticker" type="text" placeholder="Ex: PETR4" value={ticker} onChange={e => setTicker(e.target.value.toUpperCase())} className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500" maxLength={10} />
            </div>

            {/* LPA */}
            <div className="space-y-2">
              <Label htmlFor="lpa" className="text-white font-medium">
                LPA (Lucro por Ação)
              </Label>
              <Input id="lpa" type="number" step="0.01" placeholder="Ex: 2.50" value={lpa} onChange={e => setLpa(e.target.value)} className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500" />
            </div>

            {/* VPA */}
            <div className="space-y-2">
              <Label htmlFor="vpa" className="text-white font-medium">
                VPA (Valor Patrimonial por Ação)
              </Label>
              <Input id="vpa" type="number" step="0.01" placeholder="Ex: 12.30" value={vpa} onChange={e => setVpa(e.target.value)} className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500" />
            </div>

            {/* CAGR */}
            <div className="space-y-2">
              <Label htmlFor="cagr" className="text-white font-medium">
                CAGR Lucros 5 anos (%)
              </Label>
              <Input id="cagr" type="number" step="0.1" placeholder="Ex: 15.5" value={cagr} onChange={e => setCagr(e.target.value)} className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500" />
            </div>

            {/* Dividendos */}
            <div className="space-y-2">
              <Label className="text-white font-medium">
                Dividendos dos últimos 3 anos (R$)
              </Label>
              <div className="grid grid-cols-3 gap-3">
                <Input type="number" step="0.01" placeholder="Ano 1" value={d1} onChange={e => setD1(e.target.value)} className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 text-center" />
                <Input type="number" step="0.01" placeholder="Ano 2" value={d2} onChange={e => setD2(e.target.value)} className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 text-center" />
                <Input type="number" step="0.01" placeholder="Ano 3" value={d3} onChange={e => setD3(e.target.value)} className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 text-center" />
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <Button onClick={calculatePrice} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2" disabled={!lpa || !vpa || !cagr || !d1 || !d2 || !d3}>
                <Calculator className="h-4 w-4" />
                Gerar Análise
              </Button>
              <Button onClick={clearData} variant="outline" className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700">
                Limpar Dados
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card Direito - Análise de Preço */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <DollarSign className="h-6 w-6 text-green-400" />
              <CardTitle className="text-white text-xl">Análise de Preço</CardTitle>
            </div>
            <CardDescription className="text-slate-400">
              Resultados conservadores usados para a bolsa brasileira
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!results ? <div className="text-center py-16">
                <Calculator className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">
                  Preencha os dados para ver a análise
                </p>
              </div> : <div className="space-y-6">
                {/* Resultados individuais */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                    <p className="text-slate-400 text-sm mb-1">Graham 1</p>
                    <p className="text-green-400 font-bold text-lg">
                      R$ {results.graham.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                    <p className="text-slate-400 text-sm mb-1">Graham 2</p>
                    <p className="text-green-400 font-bold text-lg">
                      R$ {results.proj.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                    <p className="text-slate-400 text-sm mb-1">Bazin</p>
                    <p className="text-green-400 font-bold text-lg">
                      R$ {results.bazin.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Preço Final */}
                <div className="text-center p-6 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl">
                  <p className="text-white/80 text-sm mb-2">Preço Justo Final</p>
                  <p className="text-white text-3xl font-bold mb-2">
                    R$ {results.finalPrice.toFixed(2)}
                  </p>
                  <p className="text-white/70 text-sm">
                    Com margem de segurança de 20%
                  </p>
                </div>

                {/* Botão Salvar */}
                {isAuthenticated && <Button 
                    onClick={saveAnalysis} 
                    className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
                    disabled={!results || !ticker || !lpa || !vpa || !d1 || !d2 || !d3}
                  >
                    <Save className="h-4 w-4" />
                    Salvar Análise
                  </Button>}

                {/* Fórmulas */}
                <div className="space-y-3 mt-6 pt-6 border-t border-slate-700">
                  <h4 className="text-white font-medium text-sm">Fórmulas Utilizadas:</h4>
                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span>• Graham 1:</span>
                      <span>√(10,5 × LPA × VPA)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Graham 2:</span>
                      <span>LPA × (7 + 2 × CAGR ÷ 100)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Bazin:</span>
                      <span>Soma Dividendos ÷ 0,18</span>
                    </div>
                    <div className="flex justify-between font-medium text-slate-200 pt-1 border-t border-slate-600">
                      <span>• Fórmula Final:</span>
                      <span>((Graham1 + Graham2 × 1,5 + Bazin × 0,5) ÷ 3) × 0,8</span>
                    </div>
                  </div>
                </div>
              </div>}

            {/* Link da metodologia */}
            <div className="pt-4 border-t border-slate-700">
              <p className="text-slate-400 text-sm mb-2">
                Artigo da Equação de Preço-Compra:{" "}
                <a href="https://docs.google.com/document/d/1VLlfO2ERz7OTz9Bjluwm9ucfO7qk7dhaajsFcr8O1-U/edit?usp=sharing" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                  Acesse o documento
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
};

export default StockPriceCalculator;
