import { useState, useEffect } from "react";
import { usePopups } from "@/hooks/usePopups";
import Popup from "@/components/popups/Popup";
import { Popup as PopupType } from "@/types/popup";

interface PopupProviderProps {
  currentPage: string;
  children: React.ReactNode;
}

const PopupProvider = ({ currentPage, children }: PopupProviderProps) => {
  const { popup, loading, error, dismissPopup, refetch } = usePopups(currentPage);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Quando a página muda, verificar se há um popup ativo
    if (popup) {
      setShowPopup(true);
    }
  }, [popup]);

  const handleClose = () => {
    setShowPopup(false);
  };

  const handleDismiss = (popupId: string) => {
    dismissPopup(popupId);
  };

  // Não mostrar popups em páginas administrativas
  const isAdminPage = currentPage.startsWith('/admin');

  if (isAdminPage) {
    return <>{children}</>;
  }

  // Converter o tipo do popup para corresponder à interface esperada
  const convertedPopup = popup ? {
    id: popup.id,
    titulo: popup.titulo,
    conteudo: popup.conteudo,
    imagem_url: popup.imagem_url !== null ? popup.imagem_url : undefined,
    link_destino: popup.link_destino !== null ? popup.link_destino : undefined,
    data_inicio: popup.data_inicio,
    data_fim: popup.data_fim,
    pagina: popup.pagina,
    ativo: popup.ativo !== null ? popup.ativo : undefined,
    ordem: popup.ordem !== null ? popup.ordem : undefined,
    created_at: popup.created_at !== null ? popup.created_at : undefined,
    updated_at: popup.updated_at !== null ? popup.updated_at : undefined
  } as PopupType : null;

  return (
    <>
      {children}
      {showPopup && convertedPopup && (
        <Popup 
          popup={convertedPopup} 
          onClose={handleClose} 
          onDismiss={handleDismiss} 
        />
      )}
    </>
  );
};

export default PopupProvider;