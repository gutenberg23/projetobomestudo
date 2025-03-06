
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileMenu } from "./ProfileMenu";

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, loading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Fechar o menu ao navegar para outra página
    setIsMenuOpen(false);
  }, [location.pathname]);

  const NAV_ITEMS = [
    { label: "Início", href: "/" },
    { label: "Explorar", href: "/explore" },
    { label: "Minhas Matrículas", href: "/my-courses" },
    { label: "Questões", href: "/questions" },
    { label: "Blog", href: "/blog" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full ${
        isScrolled || isMenuOpen
          ? "bg-white shadow-sm border-b border-gray-200"
          : "bg-transparent"
      }`}
    >
      <div className="container px-4 md:px-6 py-4 mx-auto">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/lovable-uploads/logo.svg" alt="BomEstudo" className="h-10" />
          </Link>

          {/* Menu desktop */}
          <nav className="hidden md:flex space-x-8">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === item.href
                    ? "text-[#ea2be2]"
                    : "text-[#67748a] hover:text-[#ea2be2]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {!loading && (
              <>
                {user ? (
                  <ProfileMenu />
                ) : (
                  <Button variant="outline" className="hidden md:flex" asChild>
                    <Link to="/auth">Entrar</Link>
                  </Button>
                )}
              </>
            )}

            {/* Botão do menu mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Menu mobile */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <nav className="flex flex-col space-y-4">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`text-base font-medium transition-colors ${
                    location.pathname === item.href
                      ? "text-[#ea2be2]"
                      : "text-[#67748a] hover:text-[#ea2be2]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {!loading && !user && (
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/auth">Entrar</Link>
                </Button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
