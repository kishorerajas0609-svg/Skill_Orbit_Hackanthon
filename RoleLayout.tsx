import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { SkillOrbitAIAssistant } from '../ai/SkillOrbitAIAssistant';

export const RoleLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-emerald-500/20 selection:text-emerald-300">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <Footer />
      <SkillOrbitAIAssistant />
    </div>
  );
};
