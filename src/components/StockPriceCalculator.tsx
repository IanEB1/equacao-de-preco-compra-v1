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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CalculationResults {
  graham: number;
  proj: number;
  bazin: number;
  finalPrice: number;
}

const StockPriceCalculator = () => {
  const [ticker, setTicker] = useState("");
  
  // Input validation functions
  const validateTicker = (value: string) => {
    return value.replace(/[^A-Za-z0-9]/g, '').slice(0, 10);
  };
  const [lpaMode, setLpaMode] = useState<"current" | "avg5">("current");
  const [lpa, setLpa] = useState("");
  const [profit1, setProfit1] = useState("");
  const [profit2, setProfit2] = useState("");
  const [profit3, setProfit3] = useState("");
  const [profit4, setProfit4] = useState("");
  const [profit5, setProfit5] = useState("");
  const [shares, setShares] = useState("");
  const [vpa, setVpa] = useState("");
  const [currentProfit, setCurrentProfit] = useState("");
  const [profit5YearsAgo, setProfit5YearsAgo] = useState("");
  const [d1, setD1] = useState("");
  const [d2, setD2] = useState("");
  const [d3, setD3] = useState("");
  const [d4, setD4] = useState("");
  const [d5, setD5] = useState("");
  const [results, setResults] = useState<CalculationResults | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { saveAnalysis: saveToDatabase } = useAnalyses();
const calculatePrice = () => {
  const vpaNum = parseFloat(vpa);
  const currentProfitNum = parseFloat(currentProfit);
  const profit5YearsAgoNum = parseFloat(profit5YearsAgo);

  // Calcular CAGR internamente
  let calculatedCagr = 0;
  if (!isNaN(currentProfitNum) && !isNaN(profit5YearsAgoNum) && profit5YearsAgoNum !== 0) {
    calculatedCagr = (Math.pow(currentProfitNum / profit5YearsAgoNum, 0.2) - 1) * 100;
  }

  const d1Num = parseFloat(d1);
  const d2Num = parseFloat(d2);
  const d3Num = parseFloat(d3);
  const d4Num = parseFloat(d4);
  const d5Num = parseFloat(d5);

  // Validar dividendos negativos
  if (d1Num < 0 || d2Num < 0 || d3Num < 0 || d4Num < 0 || d5Num < 0) {
    toast({
      title: "Valores inválidos",
      description: "Dividendos não podem ser negativos.",
      variant: "destructive"
    });
    return;
  }

  let lpaUsed = 0;
  if (lpaMode === 'current') {
    const lpaNum = parseFloat(lpa);
    if (isNaN(lpaNum) || lpa.trim() === '') {
      toast({
        title: "Dados obrigatórios",
        description: "Informe o LPA para gerar a análise.",
        variant: "destructive"
      });
      return;
    }
    lpaUsed = lpaNum;
  } else {
    const p1 = parseFloat(profit1);
    const p2 = parseFloat(profit2);
    const p3 = parseFloat(profit3);
    const p4 = parseFloat(profit4);
    const p5 = parseFloat(profit5);
    const sh = parseFloat(shares);
    if (isNaN(p1) || profit1.trim() === '' || isNaN(p2) || profit2.trim() === '' || 
        isNaN(p3) || profit3.trim() === '' || isNaN(p4) || profit4.trim() === '' || 
        isNaN(p5) || profit5.trim() === '' || isNaN(sh) || shares.trim() === '') {
      toast({
        title: "Dados obrigatórios",
        description: "Informe os 5 lucros líquidos e o número de ações.",
        variant: "destructive"
      });
      return;
    }
    lpaUsed = ((p1 + p2 + p3 + p4 + p5) / 5) / sh;
  }

  // Validações específicas para os novos campos de lucro
  if (profit5YearsAgoNum <= 0) {
    toast({
      title: "Valores inválidos",
      description: "Lucro de 5 anos atrás deve ser maior que zero.",
      variant: "destructive"
    });
    return;
  }

  if (isNaN(vpaNum) || vpa.trim() === '' || 
      isNaN(currentProfitNum) || currentProfit.trim() === '' || 
      isNaN(profit5YearsAgoNum) || profit5YearsAgo.trim() === '' ||
      isNaN(d1Num) || d1.trim() === '' || isNaN(d2Num) || d2.trim() === '' || 
      isNaN(d3Num) || d3.trim() === '' || isNaN(d4Num) || d4.trim() === '' || 
      isNaN(d5Num) || d5.trim() === '') {
    toast({
      title: "Dados obrigatórios",
      description: "Preencha VPA, lucros e os 5 dividendos.",
      variant: "destructive"
    });
    return;
  }

  const graham = Math.sqrt(10.5 * lpaUsed * vpaNum);
  const proj = lpaUsed * (7 + 2 * (calculatedCagr / 100));
  const bazin = (d1Num + d2Num + d3Num + d4Num + d5Num) / 0.3;
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
  setLpaMode("current");
  setLpa("");
  setProfit1("");
  setProfit2("");
  setProfit3("");
  setProfit4("");
  setProfit5("");
  setShares("");
  setVpa("");
  setCurrentProfit("");
  setProfit5YearsAgo("");
  setD1("");
  setD2("");
  setD3("");
  setD4("");
  setD5("");
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

  const vpaNum = parseFloat(vpa);
  const d1Num = parseFloat(d1);
  const d2Num = parseFloat(d2);
  const d3Num = parseFloat(d3);
  const d4Num = parseFloat(d4);
  const d5Num = parseFloat(d5);

  let lpaUsed = 0;
  if (lpaMode === 'current') {
    const lpaNum = parseFloat(lpa);
    if (isNaN(lpaNum) || lpa.trim() === '') {
      toast({
        title: "Dados incompletos",
        description: "Informe o LPA para salvar.",
        variant: "destructive"
      });
      return;
    }
    lpaUsed = lpaNum;
  } else {
    const p1 = parseFloat(profit1);
    const p2 = parseFloat(profit2);
    const p3 = parseFloat(profit3);
    const p4 = parseFloat(profit4);
    const p5 = parseFloat(profit5);
    const sh = parseFloat(shares);
    if (isNaN(p1) || profit1.trim() === '' || isNaN(p2) || profit2.trim() === '' || 
        isNaN(p3) || profit3.trim() === '' || isNaN(p4) || profit4.trim() === '' || 
        isNaN(p5) || profit5.trim() === '' || isNaN(sh) || shares.trim() === '') {
      toast({
        title: "Dados incompletos",
        description: "Informe os 5 lucros líquidos e o número de ações.",
        variant: "destructive"
      });
      return;
    }
    lpaUsed = ((p1 + p2 + p3 + p4 + p5) / 5) / sh;
  }

  const currentProfitNum = parseFloat(currentProfit);
  const profit5YearsAgoNum = parseFloat(profit5YearsAgo);

  // Calcular CAGR para salvar
  let calculatedCagr = 0;
  if (!isNaN(currentProfitNum) && !isNaN(profit5YearsAgoNum) && profit5YearsAgoNum > 0) {
    calculatedCagr = (Math.pow(currentProfitNum / profit5YearsAgoNum, 0.2) - 1) * 100;
  }

  if (isNaN(vpaNum) || vpa.trim() === '' ||
      isNaN(currentProfitNum) || currentProfit.trim() === '' ||
      isNaN(profit5YearsAgoNum) || profit5YearsAgo.trim() === '' ||
      isNaN(d1Num) || d1.trim() === '' || 
      isNaN(d2Num) || d2.trim() === '' || isNaN(d3Num) || d3.trim() === '' || 
      isNaN(d4Num) || d4.trim() === '' || isNaN(d5Num) || d5.trim() === '') {
    toast({
      title: "Dados incompletos",
      description: "Preencha VPA, lucros e os 5 dividendos para salvar.",
      variant: "destructive"
    });
    return;
  }

  const analysisData = {
    ticker: ticker.toUpperCase(),
    lpa: lpaUsed,
    vpa: vpaNum,
    cagr: calculatedCagr,
    dividend_year_1: d1Num,
    dividend_year_2: d2Num,
    dividend_year_3: d3Num,
    dividend_year_4: d4Num,
    dividend_year_5: d5Num,
    graham_formula_1: results.graham,
    graham_formula_2: results.proj,
    bazin_formula: results.bazin,
    final_price: results.finalPrice,
    notes: '',
    folder_id: undefined
  } as Omit<AnalysisData, 'id' | 'created_at' | 'user_id'>;

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
              <Input id="ticker" type="text" placeholder="Ex: PETR4" value={ticker} onChange={e => setTicker(validateTicker(e.target.value.toUpperCase()))} className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500" maxLength={10} />
            </div>

{/* LPA - Fonte e valores */}
<div className="space-y-2">
  <Label className="text-white font-medium">Fonte do LPA</Label>
  <Select value={lpaMode} onValueChange={(v) => setLpaMode(v as "current" | "avg5")}>
    <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
      <SelectValue placeholder="Selecione a fonte do LPA" />
    </SelectTrigger>
    <SelectContent className="bg-slate-800 border-slate-600">
      <SelectItem value="current">LPA atual</SelectItem>
      <SelectItem value="avg5">LPA médio 5 anos</SelectItem>
    </SelectContent>
  </Select>
</div>

{lpaMode === 'current' ? (
  <div className="space-y-2">
    <Label htmlFor="lpa" className="text-white font-medium">
      LPA (Lucro por Ação)
    </Label>
    <Input id="lpa" type="number" step="0.01" placeholder="Ex: 2.50" value={lpa} onChange={e => setLpa(e.target.value)} className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500" />
  </div>
) : (
  <div className="space-y-2">
    <Label className="text-white font-medium">LPA médio 5 anos (Lucros trazidos a valor presente)</Label>
    <div className="grid grid-cols-5 gap-3">
      <Input type="number" step="0.01" placeholder="Lucro ano 1" value={profit1} onChange={e => setProfit1(e.target.value)} className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 text-center" />
      <Input type="number" step="0.01" placeholder="Lucro ano 2" value={profit2} onChange={e => setProfit2(e.target.value)} className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 text-center" />
      <Input type="number" step="0.01" placeholder="Lucro ano 3" value={profit3} onChange={e => setProfit3(e.target.value)} className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 text-center" />
      <Input type="number" step="0.01" placeholder="Lucro ano 4" value={profit4} onChange={e => setProfit4(e.target.value)} className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 text-center" />
      <Input type="number" step="0.01" placeholder="Lucro ano 5" value={profit5} onChange={e => setProfit5(e.target.value)} className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 text-center" />
    </div>
    <div>
      <Label htmlFor="shares" className="text-white font-medium">Número de ações (atual)</Label>
      <Input id="shares" type="number" step="1" placeholder="Ex: 100000000" value={shares} onChange={e => setShares(e.target.value)} className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500" />
    </div>
  </div>
)}

            {/* VPA */}
            <div className="space-y-2">
              <Label htmlFor="vpa" className="text-white font-medium">
                VPA (Valor Patrimonial por Ação)
              </Label>
              <Input id="vpa" type="number" step="0.01" placeholder="Ex: 12.30" value={vpa} onChange={e => setVpa(e.target.value)} className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500" />
            </div>

            {/* Campos para cálculo do CAGR */}
            <div className="space-y-4">
              <Label className="text-white font-medium">CAGR Lucros 5 anos</Label>
              <div className="space-y-2">
                <Label htmlFor="currentProfit" className="text-white text-sm">
                  Lucro Atual
                </Label>
                <Input 
                  id="currentProfit" 
                  type="number" 
                  step="0.01" 
                  placeholder="Ex: 1000000000" 
                  value={currentProfit} 
                  onChange={e => setCurrentProfit(e.target.value)} 
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profit5YearsAgo" className="text-white text-sm">
                  Lucro de 5 anos atrás (trazido a valor presente)
                </Label>
                <Input 
                  id="profit5YearsAgo" 
                  type="number" 
                  step="0.01" 
                  placeholder="Ex: 500000000" 
                  value={profit5YearsAgo} 
                  onChange={e => setProfit5YearsAgo(e.target.value)} 
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500" 
                />
              </div>
            </div>

            {/* Dividendos */}
            <div className="space-y-2">
              <Label className="text-white font-medium">
                Dividendos dos últimos 5 anos (R$)
              </Label>
              <div className="grid grid-cols-5 gap-3">
                <Input type="number" step="0.01" placeholder="Ano 1" value={d1} onChange={e => setD1(e.target.value)} className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 text-center" />
                <Input type="number" step="0.01" placeholder="Ano 2" value={d2} onChange={e => setD2(e.target.value)} className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 text-center" />
                <Input type="number" step="0.01" placeholder="Ano 3" value={d3} onChange={e => setD3(e.target.value)} className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 text-center" />
                <Input type="number" step="0.01" placeholder="Ano 4" value={d4} onChange={e => setD4(e.target.value)} className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 text-center" />
                <Input type="number" step="0.01" placeholder="Ano 5" value={d5} onChange={e => setD5(e.target.value)} className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 text-center" />
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <Button onClick={calculatePrice} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2" disabled={vpa.trim() === '' || currentProfit.trim() === '' || profit5YearsAgo.trim() === '' || d1.trim() === '' || d2.trim() === '' || d3.trim() === '' || d4.trim() === '' || d5.trim() === '' || (lpaMode === 'current' ? lpa.trim() === '' : (profit1.trim() === '' || profit2.trim() === '' || profit3.trim() === '' || profit4.trim() === '' || profit5.trim() === '' || shares.trim() === ''))}>
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
                    disabled={!results || ticker.trim() === '' || vpa.trim() === '' || d1.trim() === '' || d2.trim() === '' || d3.trim() === '' || d4.trim() === '' || d5.trim() === '' || (lpaMode === 'current' ? lpa.trim() === '' : (profit1.trim() === '' || profit2.trim() === '' || profit3.trim() === '' || profit4.trim() === '' || profit5.trim() === '' || shares.trim() === ''))}
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
                      <span>Soma Dividendos ÷ 0,3</span>
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
