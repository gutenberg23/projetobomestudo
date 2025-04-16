import React, { useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { GripVertical, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTimeValue } from "./utils";

interface Subject {
  id: string;
  titulo: string;
  descricao?: string;
  ativo?: boolean;
  horasDedicadas?: number;
  cor?: string;
}

interface DisciplinaItemProps {
  subject: Subject;
  index: number;
  totalHoras: number;
  onToggleActive: (id: string) => void;
  onUpdateHoras: (id: string, horas: number) => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

export const DisciplinaItem: React.FC<DisciplinaItemProps> = ({
  subject,
  index,
  totalHoras,
  onToggleActive,
  onUpdateHoras,
  onMove
}) => {
  const ref = useRef<HTMLDivElement>(null);
  
  // Valor atual em horas decimais (ex: 2.5 = 2h30min)
  const [horasValue, setHorasValue] = useState<number>(subject.horasDedicadas || 0);
  
  // Configuração do drag and drop
  const [{ isDragging }, drag] = useDrag({
    type: "DISCIPLINA_ITEM",
    item: { index, id: subject.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "DISCIPLINA_ITEM",
    hover: (item: DragItem, monitor) => {
      if (!ref.current) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = index;

      // Não substituir itens por eles mesmos
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determinar o retângulo na tela
      const hoverBoundingRect = ref.current.getBoundingClientRect();

      // Obter o ponto central vertical
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determinar a posição do mouse
      const clientOffset = monitor.getClientOffset();

      // Obter pixels para o topo
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      // Apenas realizar movimento quando o mouse ultrapassar metade da altura do item
      // Quando arrastando para baixo, apenas mover quando o cursor estiver abaixo de 50%
      // Quando arrastando para cima, apenas mover quando o cursor estiver acima de 50%

      // Arrastando para baixo
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Arrastando para cima
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Mover o item
      onMove(dragIndex, hoverIndex);

      // Atualizar o índice do item para o novo
      item.index = hoverIndex;
    },
  });

  // Combina drag e drop em um único ref
  drag(drop(ref));

  const handleSliderChange = (values: number[]) => {
    if (values.length > 0) {
      // O slider trabalha com valores em minutos
      const minutesValue = values[0];
      // Converter para horas decimais
      const hoursValue = minutesValue / 60;
      setHorasValue(hoursValue);
      onUpdateHoras(subject.id, hoursValue);
    }
  };
  
  const handleIncrease = () => {
    // Aumenta em incrementos de 5 minutos (0.0833 horas)
    const newValue = Math.min(24, horasValue + 1/12);
    setHorasValue(newValue);
    onUpdateHoras(subject.id, newValue);
  };
  
  const handleDecrease = () => {
    // Diminui em incrementos de 5 minutos (0.0833 horas)
    const newValue = Math.max(0, horasValue - 1/12);
    setHorasValue(newValue);
    onUpdateHoras(subject.id, newValue);
  };
  
  // Converter valor de horas para minutos para o slider
  const sliderValue = Math.round(horasValue * 60);
  
  // Formatar para exibição em horas e minutos
  const formattedTime = formatTimeValue(horasValue);

  return (
    <div
      ref={ref}
      className={`bg-white rounded-lg border p-4 ${
        isDragging ? "opacity-50" : ""
      } ${subject.ativo ? "" : "bg-gray-50"}`}
      style={{ cursor: "move" }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="cursor-move text-gray-400">
            <GripVertical size={20} />
          </div>
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-800">{subject.titulo}</h4>
            {subject.descricao && (
              <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-700 rounded-full border border-gray-200">
                {subject.descricao}
              </span>
            )}
          </div>
        </div>
        <Switch
          checked={subject.ativo}
          onCheckedChange={() => onToggleActive(subject.id)}
        />
      </div>

      <div className={`mt-3 ${subject.ativo ? "" : "opacity-50 pointer-events-none"}`}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-600">Tempo dedicado:</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6"
              onClick={handleDecrease}
              disabled={!subject.ativo || horasValue <= 0}
            >
              <Minus className="h-3 w-3" />
            </Button>
            
            <span 
              className="text-sm font-medium px-2 py-1 rounded min-w-[60px] text-center"
              style={{ backgroundColor: subject.cor, color: 'white' }}
            >
              {formattedTime}
            </span>
            
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6"
              onClick={handleIncrease}
              disabled={!subject.ativo || horasValue >= 24}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <Slider
          value={[sliderValue]}
          min={0}
          max={24 * 60} // 24 horas em minutos
          step={5} // incrementos de 5 minutos
          onValueChange={handleSliderChange}
          disabled={!subject.ativo}
          className="cursor-pointer"
        />
      </div>
    </div>
  );
}; 