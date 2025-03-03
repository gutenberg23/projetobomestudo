
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImportanceStars } from "./ImportanceStars";
import { cn } from "@/lib/utils";
import { Subject, Topic } from "../types/editorialized";
import { calculateErrors, calculatePerformance, calculateSubjectTotals } from "../utils/statsCalculations";
interface SubjectTableProps {
  subject: Subject;
  performanceGoal: number;
  onTopicChange: (subjectId: number, topicId: number, field: keyof Topic, value: any) => void;
}
export const SubjectTable = ({
  subject,
  performanceGoal,
  onTopicChange
}: SubjectTableProps) => {
  const subjectTotals = calculateSubjectTotals(subject.topics);
  const subjectProgress = Math.round(subjectTotals.completedTopics / subjectTotals.totalTopics * 100);
  const subjectPerformance = calculatePerformance(subjectTotals.hits, subjectTotals.exercisesDone);
  const handleIsReviewedChange = (subjectId: number, topicId: number) => {
    const topic = subject.topics.find(t => t.id === topicId);
    if (topic) {
      onTopicChange(subjectId, topicId, 'isReviewed', !topic.isReviewed);
    }
  };
  const handleNotReviewedChange = (subjectId: number, topicId: number) => {
    // Independentemente do valor atual, estamos apenas invertendo o estado do checkbox "Não revisado"
    // Isso permite qualquer combinação: ambos marcados, ambos desmarcados, ou um marcado e outro desmarcado
    const topic = subject.topics.find(t => t.id === topicId);
    if (topic) {
      const currentValue = topic.isReviewed;
      onTopicChange(subjectId, topicId, 'isReviewed', currentValue);
    }
  };
  return <div className="mb-8 last:mb-0">
      <div className="flex items-center justify-between bg-[#9747FF] text-white p-3 rounded-t-lg">
        <h2 className="text-sm md:text-lg font-semibold">{subject.name}</h2>
        <div className="flex items-center gap-3">
          <div className="w-16 md:w-24 h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white transition-all" style={{
            width: `${subjectProgress}%`
          }} />
          </div>
          <span className="text-xs md:text-sm">{subjectProgress}%</span>
        </div>
      </div>
      <div className="border border-gray-200 rounded-b-lg overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead className="bg-gray-50">
            <tr className="text-sm text-gray-600">
              <th className="py-3 px-4 text-left font-medium w-8">#</th>
              <th className="py-3 px-4 text-left font-medium">Conclusão</th>
              <th className="py-3 px-4 text-left font-medium">Tópicos</th>
              <th className="py-3 px-4 text-left font-medium">Importância do Assunto</th>
              <th className="py-3 px-4 text-left font-medium">Dificuldade</th>
              <th className="py-3 px-4 text-center font-medium">Total Exercícios feitos</th>
              <th className="py-3 px-4 text-center font-medium">Acertos</th>
              <th className="py-3 px-4 text-center font-medium">Erros</th>
              <th className="py-3 px-4 text-center font-medium">Aproveitamento</th>
              <th className="py-3 px-4 text-center font-medium">Revisão</th>
            </tr>
          </thead>
          <tbody>
            {subject.topics.map((topic, index) => <tr key={topic.id} className={cn("border-t border-gray-200", index % 2 === 0 ? "bg-white" : "bg-gray-50")}>
                <td className="py-3 px-4">{topic.id}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <div onClick={e => {
                  e.stopPropagation();
                  onTopicChange(subject.id, topic.id, 'isDone', !topic.isDone);
                }} className={`flex shrink-0 self-stretch my-auto w-5 h-5 rounded cursor-pointer ${topic.isDone ? "bg-[#F11CE3] border-[#F11CE3]" : "bg-white border border-gray-200"}`}>
                      {topic.isDone && <svg viewBox="0 0 14 14" fill="none" className="w-4 h-4 m-auto">
                          <path d="M11.083 2.917L4.375 9.625 1.917 7.167" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 max-w-xs">
                  <p className="text-sm text-gray-600">{topic.topic}</p>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#F11CE3] transition-all" 
                        style={{ width: `${topic.importance * 20}%` }} 
                      />
                    </div>
                    <span className="ml-2 text-sm text-gray-600">{topic.importance * 20}%</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <Select value={topic.difficulty} onValueChange={value => onTopicChange(subject.id, topic.id, 'difficulty', value)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Muito Fácil">Muito Fácil</SelectItem>
                      <SelectItem value="Fácil">Fácil</SelectItem>
                      <SelectItem value="Médio">Médio</SelectItem>
                      <SelectItem value="Difícil">Difícil</SelectItem>
                      <SelectItem value="Muito Difícil">Muito Difícil</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="py-3 px-4 text-center">
                  <input type="number" min="0" value={topic.exercisesDone} onChange={e => onTopicChange(subject.id, topic.id, 'exercisesDone', parseInt(e.target.value))} className="w-20 text-center border rounded p-1" />
                </td>
                <td className="py-3 px-4 text-center">
                  <input type="number" min="0" max={topic.exercisesDone} value={topic.hits} onChange={e => onTopicChange(subject.id, topic.id, 'hits', parseInt(e.target.value))} className="w-20 text-center border rounded p-1" />
                </td>
                <td className="py-3 px-4 text-center">{calculateErrors(topic.exercisesDone, topic.hits)}</td>
                <td className={cn("py-3 px-4 text-center", calculatePerformance(topic.hits, topic.exercisesDone) < performanceGoal ? "bg-[#FFDEE2]" : "bg-[#F2FCE2]")}>
                  {calculatePerformance(topic.hits, topic.exercisesDone)}%
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center gap-2">
                    <div onClick={() => handleIsReviewedChange(subject.id, topic.id)} className={`flex shrink-0 self-stretch my-auto w-5 h-5 rounded cursor-pointer ${topic.isReviewed ? "bg-[#F11CE3] border-[#F11CE3]" : "bg-white border border-gray-200"}`}>
                      {topic.isReviewed && <svg viewBox="0 0 14 14" fill="none" className="w-4 h-4 m-auto">
                          <path d="M11.083 2.917L4.375 9.625 1.917 7.167" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>}
                    </div>
                    
                  </div>
                </td>
              </tr>)}
            <tr className="border-t border-gray-200 bg-gray-50 font-medium">
              <td colSpan={5} className="py-3 px-4 text-right">Totais:</td>
              <td className="py-3 px-4 text-center">{subjectTotals.exercisesDone}</td>
              <td className="py-3 px-4 text-center">{subjectTotals.hits}</td>
              <td className="py-3 px-4 text-center">{subjectTotals.errors}</td>
              <td className={cn("py-3 px-4 text-center", subjectPerformance < performanceGoal ? "bg-[#FFDEE2]" : "bg-[#F2FCE2]")}>
                {subjectPerformance}%
              </td>
              <td className="py-3 px-4"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>;
};
