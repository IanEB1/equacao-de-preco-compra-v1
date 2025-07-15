import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calculator, FolderOpen, LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
const Navigation = () => {
  const location = useLocation();
  const {
    user,
    profile,
    logout,
    isAuthenticated
  } = useAuth();
  const isActive = (path: string) => location.pathname === path;
  return <header className="bg-gradient-card border-b border-border py-[2px]">
      <div className="container mx-auto px-2 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-finance-primary to-finance-secondary bg-clip-text text-transparent hover:scale-105 transition-transform duration-200 mr-4">
              Equação de Preço-Compra
            </Link>
            
            <nav className="hidden md:flex items-center space-x-4">
              <Link to="/data-entry-choice">
                <Button variant={isActive('/data-entry-choice') || isActive('/calculator') ? 'default' : 'ghost'} size="sm" className="flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Calculadora
                </Button>
              </Link>
              
              {isAuthenticated && <Link to="/saved-analyses">
                  <Button variant={isActive('/saved-analyses') ? 'default' : 'ghost'} size="sm" className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    Análises Salvas
                  </Button>
                </Link>}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{profile?.name || user?.email}</span>
                </div>
                <Button variant="outline" size="sm" onClick={logout} className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden md:inline">Sair</span>
                </Button>
              </div> : <Link to="/login">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden md:inline">Entrar</span>
                </Button>
              </Link>}
          </div>
        </div>
      </div>
    </header>;
};
export default Navigation;