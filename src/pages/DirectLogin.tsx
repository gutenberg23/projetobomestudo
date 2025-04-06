import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

/**
 * Página de login de emergência
 * Use esta página apenas se o login normal não funcionar
 * Acesse via: /direct-login
 */
const DirectLogin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [email] = useState("admin@bomestudo.com.br");
  const [password] = useState("Admin@123");
  const [logs, setLogs] = useState<string[]>([]);
  const navigate = useNavigate();

  const addLog = (log: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${log}`]);
  };

  const handleAdminLogin = async () => {
    setLoading(true);
    setMessage("");
    addLog("Iniciando login de emergência");

    try {
      // 1. Tentativa: Login normal via API
      addLog("Tentando login padrão via API");
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        addLog(`Erro no login padrão: ${error.message}`);
        
        // Registrar tentativa de login para debug
        try {
          await supabase.rpc('log_login_attempt', {
            p_email: email,
            p_status: 'falha',
            p_error: error.message
          });
        } catch (err: unknown) {
          console.error("Erro ao registrar tentativa:", err);
        }
        
        // Se falhar, tentar contornar com login direto
        addLog("Tentando contornar com RPC personalizada");
        
        // Esta RPC seria criada no banco para fazer login direto
        const { error: directLoginError } = await supabase.rpc('admin_direct_login', {
          admin_email: email,
          admin_password: password
        });
        
        if (directLoginError) {
          addLog(`Erro no login alternativo: ${directLoginError.message}`);
          throw directLoginError;
        } else {
          addLog("Login alternativo bem-sucedido");
          navigate("/");
        }
      } else {
        addLog("Login padrão bem-sucedido");
        setMessage("Login bem-sucedido! Redirecionando...");
        
        // Registrar login bem-sucedido para debug
        try {
          await supabase.rpc('log_login_attempt', {
            p_email: email,
            p_status: 'sucesso'
          });
        } catch (err: unknown) {
          console.error("Erro ao registrar sucesso:", err);
        }
        
        setTimeout(() => navigate("/"), 1000);
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Erro desconhecido";
      addLog(`Erro crítico: ${errorMessage}`);
      setMessage(`Erro: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-red-600 mb-6">
          Login de Emergência
        </h1>
        
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-800 text-sm">
            Esta página só deve ser usada quando o login normal falhar.
            Utiliza o usuário administrador criado pelo script SQL.
          </p>
        </div>

        <div className="mb-4">
          <p className="font-semibold">Email:</p>
          <p className="p-2 bg-gray-100 rounded">{email}</p>
        </div>

        <div className="mb-6">
          <p className="font-semibold">Senha:</p>
          <p className="p-2 bg-gray-100 rounded">{password}</p>
        </div>

        {message && (
          <div className={`p-3 mb-4 rounded ${message.includes("Erro") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
            {message}
          </div>
        )}

        <button
          onClick={handleAdminLogin}
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Processando..." : "Fazer Login de Emergência"}
        </button>

        <div className="mt-6">
          <h3 className="font-semibold mb-2">Logs:</h3>
          <div className="bg-gray-100 p-2 rounded h-40 overflow-y-auto text-xs">
            {logs.length === 0 ? (
              <p className="text-gray-500">Os logs aparecerão aqui</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectLogin; 