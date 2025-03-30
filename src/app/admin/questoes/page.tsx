'use client';

import { useLoadQuestions } from "@/components/admin/questions/hooks/useLoadQuestions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function QuestoesPage() {
  const { questions, loading, filters, levels, difficulties, hasMore, updateFilters, loadMore } = useLoadQuestions();

  if (loading && questions.length === 0) {
    return (
      <div className="container mx-auto py-6 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Questões</h1>
          <Button asChild>
            <Link to="/admin/questoes/nova">Nova Questão</Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Questões</h1>
        <Button asChild>
          <Link to="/admin/questoes/nova">Nova Questão</Link>
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-4">
        <div className="w-[200px]">
          <Select
            value={filters.level}
            onValueChange={(value) => updateFilters({ level: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Escolaridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {levels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-[200px]">
          <Select
            value={filters.difficulty}
            onValueChange={(value) => updateFilters({ difficulty: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Dificuldade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {difficulties.map((difficulty) => (
                <SelectItem key={difficulty} value={difficulty}>
                  {difficulty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {questions.map((question) => (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle className="text-lg">
                {question.institution} - {question.year}
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                {question.discipline} • {question.level} • {question.difficulty}
              </div>
            </CardHeader>
            <CardContent>
              <div className="line-clamp-3 text-sm">
                {question.content}
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/admin/questoes/${question.id}`}>
                    Ver Detalhes
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={loading}
          >
            {loading ? "Carregando..." : "Carregar mais"}
          </Button>
        </div>
      )}
    </div>
  );
} 