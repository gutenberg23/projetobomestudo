import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao processar callback:', error);
          navigate('/login');
          return;
        }

        if (session) {
          navigate('/');
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Erro ao processar callback:', error);
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Processando autenticação...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ea2be2] mx-auto"></div>
      </div>
    </div>
  );
};

export default AuthCallback; 