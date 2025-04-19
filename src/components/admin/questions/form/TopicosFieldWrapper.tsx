import React, { useEffect, useMemo, useRef, useState } from "react";
import { Control } from "react-hook-form";
import { isEqual } from "lodash";
import { useToast } from "@/components/ui/use-toast";
import TopicosField from "./TopicosField";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";

interface TopicosFieldWrapperProps {
  control: Control | null;
  disciplina: string | null;
  assuntos: string[] | null;
  topicos: string[] | null;
  setValue?: (name: string, value: any) => void;
  initialAssunto?: string;
}

const TopicosFieldWrapper = ({
  control,
  disciplina,
  assuntos,
  topicos,
  setValue,
  initialAssunto,
}: TopicosFieldWrapperProps) => {
  const { toast } = useToast();
  const lastUpdatedTopicosRef = useRef<string[]>([]);
  const [previousFormValue, setPreviousFormValue] = useState<string[]>([]);

  // Garantir que assuntos e topicos são arrays válidos
  const validAssuntos = useMemo(() => {
    return Array.isArray(assuntos) ? assuntos : [];
  }, [assuntos]);

  const validTopicos = useMemo(() => {
    return Array.isArray(topicos) ? topicos : [];
  }, [topicos]);

  // Função para atualizar tópicos de forma segura sem criar ciclos
  const safeSetTopicos = (newTopicos: string[]) => {
    try {
      // Verificar se os novos tópicos são diferentes dos últimos atualizados
      if (!isEqual(newTopicos, lastUpdatedTopicosRef.current)) {
        console.log("Atualizando tópicos:", newTopicos);
        
        // Atualizar a referência dos últimos tópicos atualizados
        lastUpdatedTopicosRef.current = [...newTopicos];
        
        // Se tiver a função setValue (de React Hook Form), atualizar o formulário
        if (setValue) {
          console.log("Chamando setValue com:", newTopicos);
          setValue("topicos", newTopicos);
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro ao atualizar tópicos:", error);
      return false;
    }
  };

  // Gerenciar o estado do formulário e atualizar quando os tópicos mudarem
  useEffect(() => {
    if (Array.isArray(topicos) && !isEqual(topicos, previousFormValue)) {
      setPreviousFormValue(topicos);
      lastUpdatedTopicosRef.current = [...topicos];
    }
  }, [topicos]);

  // Funções para adicionar, atualizar e excluir tópicos
  const handleAddTopico = async (topico: string): Promise<boolean> => {
    try {
      toast({
        title: "Função não implementada",
        description: "Adicionar tópico ainda não está implementado.",
        variant: "destructive",
      });
      return false;
    } catch (error) {
      console.error("Erro ao adicionar tópico:", error);
      return false;
    }
  };

  const handleUpdateTopico = async (
    oldTopico: string,
    newTopico: string
  ): Promise<boolean> => {
    try {
      toast({
        title: "Função não implementada",
        description: "Atualizar tópico ainda não está implementado.",
        variant: "destructive",
      });
      return false;
    } catch (error) {
      console.error("Erro ao atualizar tópico:", error);
      return false;
    }
  };

  const handleDeleteTopico = async (topico: string): Promise<boolean> => {
    try {
      toast({
        title: "Função não implementada",
        description: "Excluir tópico ainda não está implementado.",
        variant: "destructive",
      });
      return false;
    } catch (error) {
      console.error("Erro ao excluir tópico:", error);
      return false;
    }
  };

  // Renderização condicional
  if (!disciplina) {
    return (
      <div className="text-muted-foreground text-sm">
        Selecione uma disciplina para ver tópicos disponíveis.
      </div>
    );
  }

  if (!validAssuntos.length) {
    return (
      <div className="text-muted-foreground text-sm">
        Selecione pelo menos um assunto para ver tópicos disponíveis.
      </div>
    );
  }

  // Renderizar o componente TopicosField
  return (
    <div className="space-y-2">
      <TopicosField
        disciplina={disciplina}
        assuntos={validAssuntos}
        topicos={validTopicos}
        setTopicos={(newTopicos) => {
          // Só atualiza e loga se for diferente dos últimos tópicos registrados
          if (!isEqual(newTopicos, lastUpdatedTopicosRef.current)) {
            console.log("setTopicos chamado com:", newTopicos);
            safeSetTopicos(newTopicos);
          }
        }}
        onAddTopico={handleAddTopico}
        onUpdateTopico={handleUpdateTopico}
        onDeleteTopico={handleDeleteTopico}
        initialAssunto={initialAssunto}
      />
    </div>
  );
};

// Wrapper para usar com React Hook Form
const FormFieldWrapper = ({ 
  name, 
  control, 
  ...props 
}: { 
  name: string; 
  control: Control | null; 
} & Omit<TopicosFieldWrapperProps, "control">) => {
  try {
    // Se control for null, apenas renderiza o componente sem o FormField
    if (!control) {
      return <TopicosFieldWrapper 
        control={null} 
        {...props} 
        setValue={(name, value) => {
          console.log("setValue chamado no modo sem control:", value);
          if (props.setValue) props.setValue(name, value);
        }}
      />;
    }
    
    return (
      <FormField
        control={control}
        name={name}
        render={({ field }) => {
          const fieldValue = field.value && Array.isArray(field.value) ? field.value : [];
          
          return (
            <FormItem>
              <TopicosFieldWrapper
                control={control}
                {...props}
                topicos={fieldValue}
                setValue={(name, value) => {
                  console.log("setValue chamado no modo com control:", value);
                  field.onChange(value);
                }}
              />
              <FormMessage />
            </FormItem>
          );
        }}
      />
    );
  } catch (error) {
    console.error("Erro ao renderizar FormField:", error);
    return <TopicosFieldWrapper 
      control={null} 
      {...props}
      setValue={(name, value) => {
        console.log("setValue chamado no modo de fallback:", value);
        if (props.setValue) props.setValue(name, value);
      }}
    />;
  }
};

export { TopicosFieldWrapper };
export default TopicosFieldWrapper;
export { FormFieldWrapper };