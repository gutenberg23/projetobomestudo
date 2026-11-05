interface PublicLayoutProps {
  children: React.ReactNode;
}

/**
 * Antes este componente também abria os popups, mas só nas páginas que o usavam
 * (painel, cursos e rankings ficavam de fora). Agora os popups vêm de
 * <PopupsDoSite /> no App e valem para todas as rotas.
 */
export function PublicLayout({ children }: PublicLayoutProps) {
  return <>{children}</>;
}
