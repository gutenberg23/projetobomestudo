
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

export const SubjectTable = ({ subject, performanceGoal, onTopicChange }: SubjectTableProps) => {
  const subjectTotals = calculateSubjectTotals(subject.topics);
  const subjectProgress = Math.round((subjectTotals.completedTopics / subjectTotals.totalTopics) * 100);
  const subjectPerformance = calculatePerformance(subjectTotals.hits, subjectTotals.exercisesDone);

  return (
    <div className="mb-8 last:mb-0">
      <div className="flex items-center justify-between bg-[#9747FF] text-white p-3 rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-white/20 rounded" />
          <h2 className="text-lg font-semibold">{subject.name}</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-24 h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all"
              style={{ width: `${subjectProgress}%` }}
            />
          </div>
          <span className="text-sm">{subjectProgress}%</span>
        </div>
      </div>
      <div className="border border-gray-200 rounded-b-lg overflow-x-auto">
        <table className="w-full min-w-[1200px]">
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
            {subject.topics.map((topic) => (
              <tr key={topic.id} className="border-t border-gray-200">
                <td className="py-3 px-4">{topic.id}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={topic.isDone}
                      onChange={(e) => onTopicChange(subject.id, topic.id, 'isDone', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-[#F11CE3] focus:ring-[#F11CE3]"
                    />
                  </div>
                </td>
                <td className="py-3 px-4 max-w-xs">
                  <p className="text-sm text-gray-600">{topic.topic}</p>
                </td>
                <td className="py-3 px-4">
                  <ImportanceStars 
                    level={topic.importance} 
                    onChange={(value) => onTopicChange(subject.id, topic.id, 'importance', value)}
                  />
                </td>
                <td className="py-3 px-4">
                  <Select 
                    value={topic.difficulty}
                    onValueChange={(value) => onTopicChange(subject.id, topic.id, 'difficulty', value)}
                  >
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
                  <input
                    type="number"
                    min="0"
                    value={topic.exercisesDone}
                    onChange={(e) => onTopicChange(subject.id, topic.id, 'exercisesDone', parseInt(e.target.value))}
                    className="w-20 text-center border rounded p-1"
                  />
                </td>
                <td className="py-3 px-4 text-center">
                  <input
                    type="number"
                    min="0"
                    max={topic.exercisesDone}
                    value={topic.hits}
                    onChange={(e) => onTopicChange(subject.id, topic.id, 'hits', parseInt(e.target.value))}
                    className="w-20 text-center border rounded p-1"
                  />
                </td>
                <td className="py-3 px-4 text-center">{calculateErrors(topic.exercisesDone, topic.hits)}</td>
                <td className={cn(
                  "py-3 px-4 text-center",
                  calculatePerformance(topic.hits, topic.exercisesDone) < performanceGoal ? "bg-[#FFDEE2]" : "bg-[#F2FCE2]"
                )}>
                  {calculatePerformance(topic.hits, topic.exercisesDone)}%
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={topic.isReviewed}
                      onChange={(e) => onTopicChange(subject.id, topic.id, 'isReviewed', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-[#F11CE3] focus:ring-[#F11CE3]"
                    />
                  </div>
                </td>
              </tr>
            ))}
            <tr className="border-t border-gray-200 bg-gray-50 font-medium">
              <td colSpan={5} className="py-3 px-4 text-right">Totais:</td>
              <td className="py-3 px-4 text-center">{subjectTotals.exercisesDone}</td>
              <td className="py-3 px-4 text-center">{subjectTotals.hits}</td>
              <td className="py-3 px-4 text-center">{subjectTotals.errors}</td>
              <td className={cn(
                "py-3 px-4 text-center",
                subjectPerformance < performanceGoal ? "bg-[#FFDEE2]" : "bg-[#F2FCE2]"
              )}>
                {subjectPerformance}%
              </td>
              <td className="py-3 px-4"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
