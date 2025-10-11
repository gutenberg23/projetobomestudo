import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import PopupProvider from "@/components/popups/PopupProvider";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState("home");

  useEffect(() => {
    // Mapear a rota atual para o nome da página usado nos popups
    const path = location.pathname;
    
    if (path === "/" || path === "/index.html") {
      setCurrentPage("home");
    } else if (path.startsWith("/blog")) {
      setCurrentPage("blog");
    } else if (path.startsWith("/questions")) {
      setCurrentPage("questoes");
    } else if (path.startsWith("/concursos")) {
      setCurrentPage("concursos");
    } else if (path.startsWith("/simulados")) {
      setCurrentPage("simulados");
    } else if (path.startsWith("/cursos")) {
      setCurrentPage("cursos");
    } else if (path.startsWith("/explore")) {
      setCurrentPage("explorar");
    } else if (path.startsWith("/cadernos")) {
      setCurrentPage("questoes");
    } else if (path.startsWith("/ranking")) {
      setCurrentPage("ranking");
    } else {
      // Para outras rotas, usar o caminho como nome da página
      const pageName = path.replace("/", "") || "home";
      setCurrentPage(pageName);
    }
  }, [location]);

  return (
    <PopupProvider currentPage={currentPage}>
      {children}
    </PopupProvider>
  );
}