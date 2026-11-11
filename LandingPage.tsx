import React from 'react';
import { Link } from 'react-router-dom';
import {
  Orbit,
  Sparkles,
  ShieldCheck,
  Award,
  ArrowRight,
  TrendingUp,
  Target,
  Briefcase,
  Building2,
  GraduationCap,
  Users,
  CheckCircle2,
  Layers,
  ChevronRight,
  Cpu,
  Terminal,
  Compass
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-24 py-6">
      {/* Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto space-y-8 pt-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400 backdrop-blur-md shadow-inner animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Next-Gen Academia–Industry Collaboration Platform</span>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground font-sans leading-[1.15]">
            Turn Skills Into <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Verified Opportunities.
            </span>
          </h1>
          <p className="text-base sm:text-xl text-foreground-muted max-w-2xl mx-auto leading-relaxed">
            Know what you have. Discover what you're missing. Prove what you can do. Connect with the right opportunities through deterministic matching and AI co-pilots.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/register">
            <Button size="lg" variant="primary" icon={<ArrowRight className="w-4 h-4" />}>
              Create Free Account
            </Button>
          </Link>
          <Link to="/opportunities">
            <Button size="lg" variant="secondary" icon={<Briefcase className="w-4 h-4" />}>
              Explore Opportunities
            </Button>
          </Link>
        </div>

        {/* Verified Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-10 border-t border-border">
          <div className="p-3 text-center rounded-xl bg-surface-elevated/40 border border-border">
            <span className="block text-2xl font-bold text-emerald-400">100%</span>
            <span className="text-xs text-foreground-muted">Verified Skill Passports</span>
          </div>
          <div className="p-3 text-center rounded-xl bg-surface-elevated/40 border border-border">
            <span className="block text-2xl font-bold text-cyan-400">Deterministic</span>
            <span className="text-xs text-foreground-muted">Transparent Match Score</span>
          </div>
          <div className="p-3 text-center rounded-xl bg-surface-elevated/40 border border-border">
            <span className="block text-2xl font-bold text-indigo-400">Gemini 1.5</span>
            <span className="text-xs text-foreground-muted">Backend AI Co-Pilot</span>
          </div>
          <div className="p-3 text-center rounded-xl bg-surface-elevated/40 border border-border">
            <span className="block text-2xl font-bold text-amber-400">5 Roles</span>
            <span className="text-xs text-foreground-muted">Unified Collaboration</span>
          </div>
        </div>
      </section>

      {/* Lifecycle Flow: Assess -> Map -> Learn -> Prove -> Experience -> Get Hired */}
      <section className="space-y-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <Badge variant="cyan">The SkillOrbit Lifecycle</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">How SkillOrbit Bridges the Talent Gap</h2>
          <p className="text-xs sm:text-sm text-foreground-muted">
            A continuous, verifiable journey from classroom theory to high-growth industry placements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {[
            { step: '01', title: 'Assess', icon: <Terminal className="w-5 h-5 text-emerald-400" />, desc: 'Take category-based timed technical assessments.' },
            { step: '02', title: 'Map', icon: <Compass className="w-5 h-5 text-cyan-400" />, desc: 'Compare your skills against target dream job roles.' },
            { step: '03', title: 'Learn', icon: <Compass className="w-5 h-5 text-indigo-400" />, desc: 'Follow AI-tailored milestone roadmaps to close gaps.' },
            { step: '04', title: 'Prove', icon: <ShieldCheck className="w-5 h-5 text-amber-400" />, desc: 'Submit repository and certificate proof to your Skill Passport.' },
            { step: '05', title: 'Experience', icon: <Briefcase className="w-5 h-5 text-rose-400" />, desc: 'Join industry internships and live collaborative projects.' },
            { step: '06', title: 'Get Hired', icon: <Award className="w-5 h-5 text-teal-400" />, desc: 'Recruiters discover and hire matching, verified candidates.' },
          ].map((item, idx) => (
            <Card key={idx} hover className="relative overflow-hidden p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-xl bg-surface-elevated border border-border">{item.icon}</div>
                  <span className="text-xs font-mono font-bold text-foreground-muted/40">{item.step}</span>
                </div>
                <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                <p className="mt-1.5 text-xs text-foreground-muted leading-relaxed">{item.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Role Pillars Section */}
      <section className="space-y-12">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <Badge variant="emerald">Dedicated Portals</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Built for the Entire Academic Ecosystem</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Students */}
          <Card hover className="flex flex-col justify-between space-y-6 border-emerald-500/20 bg-gradient-to-b from-surface to-emerald-950/10">
            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">For Students</h3>
              <ul className="space-y-2 text-xs text-foreground-muted">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Verified Skill Passport</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Deterministic Job Match Score</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> 4-Phase Learning Roadmaps</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> 1-Click Application Tracking</li>
              </ul>
            </div>
            <Link to="/register" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              Join as Student <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </Card>

          {/* Recruiters */}
          <Card hover className="flex flex-col justify-between space-y-6 border-cyan-500/20 bg-gradient-to-b from-surface to-cyan-950/10">
            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">For Industry & Recruiters</h3>
              <ul className="space-y-2 text-xs text-foreground-muted">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" /> Post Real Jobs & Internships</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" /> Search Verified Talent by Skill</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" /> Kanban Application Pipeline</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" /> AI Job Description Generator</li>
              </ul>
            </div>
            <Link to="/register" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
              Hire Talent <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </Card>

          {/* Institutions */}
          <Card hover className="flex flex-col justify-between space-y-6 border-indigo-500/20 bg-gradient-to-b from-surface to-indigo-950/10">
            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">For Institutions</h3>
              <ul className="space-y-2 text-xs text-foreground-muted">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> Real Placement Analytics</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> Department Skill Distribution</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> Identify Missing Curriculum Skills</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> Connect with Verified Recruiters</li>
              </ul>
            </div>
            <Link to="/register" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              Onboard College <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </Card>

          {/* Academicians */}
          <Card hover className="flex flex-col justify-between space-y-6 border-amber-500/20 bg-gradient-to-b from-surface to-amber-950/10">
            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">For Faculty</h3>
              <ul className="space-y-2 text-xs text-foreground-muted">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Industry FDP Discovery</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Research Collaboration Hub</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Industrial Consultancy</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Student Project Mentorship</li>
              </ul>
            </div>
            <Link to="/register" className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1">
              Join as Faculty <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </Card>
        </div>
      </section>

      {/* Call to action card */}
      <section>
        <Card className="border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-surface to-teal-950/40 p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground">
              Ready to Experience Real Skill Collaboration?
            </h2>
            <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed">
              No mock accounts. No static templates. Complete your skill assessment today and see transparent placement matching scores instantly.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link to="/register">
                <Button size="lg" variant="primary">Get Started Now</Button>
              </Link>
              <Link to="/opportunities">
                <Button size="lg" variant="secondary">Browse All Listings</Button>
              </Link>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
};
