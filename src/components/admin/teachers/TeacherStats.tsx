
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeacherData } from "./types";
import { Users, UserCheck, UserX, Award, Star } from "lucide-react";

interface TeacherStatsProps {
  teachers: TeacherData[];
}

export const TeacherStats: React.FC<TeacherStatsProps> = ({ teachers }) => {
  // Cálculos estatísticos
  const totalTeachers = teachers.length;
  const activeTeachers = teachers.filter(t => t.ativo).length;
  const inactiveTeachers = teachers.filter(t => !t.ativo).length;
  const averageRating = teachers.length 
    ? (teachers.reduce((acc, t) => acc + t.rating, 0) / teachers.length).toFixed(1)
    : "0.0";
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-t-4 border-t-[#ea2be2]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total de Professores</CardTitle>
          <Users className="h-4 w-4 text-[#ea2be2]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTeachers}</div>
          <p className="text-xs text-[#67748a] mt-1">
            professores cadastrados
          </p>
        </CardContent>
      </Card>
      
      <Card className="border-t-4 border-t-[#ea2be2]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Professores Ativos</CardTitle>
          <UserCheck className="h-4 w-4 text-[#ea2be2]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeTeachers}</div>
          <p className="text-xs text-[#67748a] mt-1">
            {Math.round((activeTeachers / totalTeachers) * 100) || 0}% do total
          </p>
        </CardContent>
      </Card>
      
      <Card className="border-t-4 border-t-[#ea2be2]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Professores Inativos</CardTitle>
          <UserX className="h-4 w-4 text-[#ea2be2]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{inactiveTeachers}</div>
          <p className="text-xs text-[#67748a] mt-1">
            {Math.round((inactiveTeachers / totalTeachers) * 100) || 0}% do total
          </p>
        </CardContent>
      </Card>
      
      <Card className="border-t-4 border-t-[#ea2be2]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Média de Avaliação</CardTitle>
          <Award className="h-4 w-4 text-[#ea2be2]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageRating}</div>
          <div className="flex mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                className={`h-3 w-3 ${star <= parseFloat(averageRating) ? "fill-[#ea2be2] text-[#ea2be2]" : "text-[#ea2be2]/30"}`} 
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherStats;
