import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { SecaoFormulario } from "@/components/admin/ui/dialogos";
import { CartoesResumo } from "@/components/admin/ui/listagem";
import { FormCaderno, QuestionBook, aproveitamento } from "./QuestionBooks";

/** Edição de um caderno em página própria (o link antigo continua funcionando). */
export default function EditQuestionBook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [book, setBook] = useState<QuestionBook | null>(null);

  useEffect(() => {
    if (!id) {
      navigate("/admin/cadernos");
      return;
    }
    (async () => {
      try {
        const { data, error } = await supabase.rpc("admin_get_caderno", { p_caderno_id: id }).single();
        if (error) throw error;
        if (!data) throw new Error("Caderno não encontrado");
        setBook(data as QuestionBook);
      } catch (error) {
        console.error("Erro ao buscar caderno:", error);
        toast.error("Erro ao carregar o caderno");
        navigate("/admin/cadernos");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  const salvar = async () => {
    if (!book || !id || !book.nome.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase.rpc("admin_update_caderno", { p_caderno_id: id, p_nome: book.nome.trim(), p_is_public: book.is_public });
      if (error) throw error;
      toast.success("Caderno atualizado");
      navigate("/admin/cadernos");
    } catch (error) {
      console.error("Erro ao atualizar caderno:", error);
      toast.error("Erro ao atualizar o caderno");
    } finally {
      setSaving(false);
    }
  };

  const p = book ? aproveitamento(book) : null;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate("/admin/cadernos")} className="-ml-2 text-slate-600">
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Cadernos de questões
      </Button>
      <div>
        <h1 className="admin-page-title">{loading ? "Carregando..." : "Editar caderno"}</h1>
        {book?.user_email && <p className="mt-1 text-sm text-slate-500">Caderno de {book.user_email}</p>}
      </div>

      {loading || !book ? (
        <div className="h-48 animate-pulse rounded-xl bg-white" />
      ) : (
        <>
          <CartoesResumo
            itens={[
              { rotulo: "Questões", valor: book.total_questions },
              { rotulo: "Respondidas", valor: book.answered_questions, tom: "cinza" },
              { rotulo: "Aproveitamento", valor: p === null ? "—" : `${p}%`, tom: p !== null && p >= 70 ? "verde" : "ambar" },
            ]}
          />
          <SecaoFormulario
            titulo="Dados do caderno"
            acoes={
              <Button variant="ghost" size="sm" asChild className="h-8 text-slate-600">
                <a href={`/cadernos/${book.id}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-1.5 h-4 w-4" /> Abrir no site
                </a>
              </Button>
            }
          >
            <FormCaderno
              nome={book.nome}
              publico={book.is_public}
              onNome={(nome) => setBook({ ...book, nome })}
              onPublico={(is_public) => setBook({ ...book, is_public })}
            />
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <Button variant="outline" onClick={() => navigate("/admin/cadernos")} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={salvar} disabled={saving || !book.nome.trim()} className="bg-[#ea2be2] text-white hover:bg-[#d029d5]">
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </SecaoFormulario>
        </>
      )}
    </div>
  );
}
