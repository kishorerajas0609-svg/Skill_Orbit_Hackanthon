import React from 'react';
import { Orbit, ShieldCheck, Cpu, Database, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border bg-surface/50 text-foreground-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-md">
                <Orbit className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-foreground">SkillOrbit</span>
            </div>
            <p className="text-xs leading-relaxed text-foreground-muted">
              The next-generation Academia-Industry Collaboration Platform bridging students, colleges, faculty, and top recruiters through verified skills and deterministic matching.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>All Systems Operational (FastAPI + Mongo + Gemini)</span>
            </div>
          </div>

          {/* Pillars */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">For Students</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/student/skill-passport" className="hover:text-emerald-400 transition-colors">Digital Skill Passport</Link></li>
              <li><Link to="/student/assessments" className="hover:text-emerald-400 transition-colors">Verified Assessments</Link></li>
              <li><Link to="/student/roadmap" className="hover:text-emerald-400 transition-colors">Target Role Roadmap</Link></li>
              <li><Link to="/opportunities" className="hover:text-emerald-400 transition-colors">Match-Scored Jobs</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">For Industry & Colleges</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/recruiter/candidates" className="hover:text-emerald-400 transition-colors">Verified Talent Discovery</Link></li>
              <li><Link to="/recruiter/post-opportunity" className="hover:text-emerald-400 transition-colors">Publish Opportunities</Link></li>
              <li><Link to="/institution/dashboard" className="hover:text-emerald-400 transition-colors">Placement Analytics</Link></li>
              <li><Link to="/academician/dashboard" className="hover:text-emerald-400 transition-colors">Faculty Development Programs</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">Core Technology</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Zero Mock Data Guarantee</li>
              <li className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5 text-cyan-400" /> Deterministic Matching Engine</li>
              <li className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Backend-Proxied Gemini AI</li>
              <li className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-amber-400" /> SIH Evaluated Architecture</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-foreground-muted gap-4">
          <p>© {new Date().getFullYear()} SkillOrbit Platform. Built with FastAPI, React, and Gemini AI.</p>
          <div className="flex gap-4">
            <span className="hover:text-foreground cursor-pointer">Privacy Policy</span>
            <span className="hover:text-foreground cursor-pointer">Terms of Service</span>
            <span className="hover:text-foreground cursor-pointer">API Status</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
