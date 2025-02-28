
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Index from './pages/Index';
import MyCourses from './pages/MyCourses';
import Explore from './pages/Explore';
import Questions from './pages/Questions';
import NotFound from './pages/NotFound';
import Settings from './pages/Settings';
import { Blog } from './pages/Blog';
import { CourseLayout } from './components/course/CourseLayout';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/my-courses" element={<MyCourses />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/questions" element={<Questions />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/course/:id" element={<CourseLayout />} />
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}

export default App;
