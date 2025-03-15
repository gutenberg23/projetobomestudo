import React from 'react';
import { LessonCard } from './LessonCard';

// Se você está vendo este arquivo, você deve atualizá-lo para corrigir o erro de tipagem.
// O erro é: Property 'question' does not exist on type 'IntrinsicAttributes & LessonCardProps'
// 
// Você precisa atualizar o LessonCard.tsx para aceitar a prop 'question'.
// Por exemplo:
//
// export interface LessonCardProps {
//   lesson: {
//     id: string;
//     title: string;
//     description: string;
//     sections: {
//       id: string;
//       title: string;
//       contentType: "video";
//       videoUrl: string;
//     }[];
//   };
//   question?: {
//     id: string;
//     year: string;
//     institution: string;
//     // ... outros campos necessários
//     options: { id: string; text: string; isCorrect: boolean }[];
//     comments: any[];
//   };
// }
