import { Link } from 'react-router-dom';
import { Book, Home, Settings, Award } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="text-xl font-bold text-purple-600">
                BomEstudo
              </Link>

              <nav className="hidden md:flex items-center gap-6">
                <Link
                  to="/"
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 transition-colors"
                >
                  <Home className="h-4 w-4" />
                  Início
                </Link>
                <Link
                  to="/cadernos"
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 transition-colors"
                >
                  <Book className="h-4 w-4" />
                  Cadernos
                </Link>
                <Link
                  to="/concursos"
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 transition-colors"
                >
                  <Award className="h-4 w-4" />
                  Concursos
                </Link>
                <Link
                  to="/configuracoes"
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Configurações
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-gray-50">
        {children}
      </main>

      <footer className="bg-white border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} BomEstudo. Todos os direitos reservados.
            </p>
            <nav className="flex items-center gap-6">
              <Link
                to="/termos-de-uso"
                className="text-sm text-gray-500 hover:text-purple-600 transition-colors"
              >
                Termos de Uso
              </Link>
              <Link
                to="/politica-de-privacidade"
                className="text-sm text-gray-500 hover:text-purple-600 transition-colors"
              >
                Política de Privacidade
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
} 