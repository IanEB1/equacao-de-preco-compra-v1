
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ email: '', password: '', name: '' });
  
  // Input validation functions
  const validatePassword = (password: string) => {
    return password.length >= 6;
  };
  
  const sanitizeName = (name: string) => {
    return name.replace(/[<>'"&]/g, '').slice(0, 50);
  };
  const { login, register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(loginForm.email, loginForm.password);
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta."
      });
      navigate('/data-entry-choice');
    } catch (error) {
      // Generic error message for security
      toast({
        title: "Erro de autenticação",
        description: "Credenciais inválidas. Verifique seus dados e tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Validate password strength
    if (!validatePassword(registerForm.password)) {
      toast({
        title: "Senha muito fraca",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    
    try {
      const sanitizedName = registerForm.name ? sanitizeName(registerForm.name) : '';
      await register(registerForm.email, registerForm.password, sanitizedName);
      toast({
        title: "Conta criada com sucesso!",
        description: "Sua conta foi criada e você está logado."
      });
      navigate('/data-entry-choice');
    } catch (error) {
      // Generic error message for security
      toast({
        title: "Erro de registro",
        description: "Não foi possível criar sua conta. Verifique os dados e tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Área do Usuário
          </h1>
          <p className="text-muted-foreground">
            Entre ou crie sua conta para salvar suas análises
          </p>
        </div>

        {/* Mensagem destacada sobre o artigo */}
        <Alert className="mb-6 border-finance-primary bg-finance-primary/5">
          <AlertDescription className="text-sm">
            <strong>📊 Ferramenta criada com base no artigo da Equação de Preço-Compra</strong>
            <br />
            <a
              href="https://docs.google.com/document/d/1VLlfO2ERz7OTz9Bjluwm9ucfO7qk7dhaajsFcr8O1-U/edit?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-finance-primary hover:underline mt-1"
            >
              Ler artigo completo
              <ExternalLink className="h-3 w-3" />
            </a>
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Acesso à Plataforma</CardTitle>
            <CardDescription>
              O login não é obrigatório para usar a calculadora, mas permite salvar suas análises
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="register">Criar Conta</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      'Entrar'
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Nome (opcional)</Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="Seu nome"
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({ ...registerForm, name: sanitizeName(e.target.value) })}
                      maxLength={50}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Senha</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando conta...
                      </>
                    ) : (
                      'Criar Conta'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 pt-4 border-t border-border">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/data-entry-choice')}
              >
                Continuar sem Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;
