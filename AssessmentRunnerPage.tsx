import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { AssessmentQuestion, AssessmentResult } from '../../types';
import {
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Home
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';

export const AssessmentRunnerPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [assessmentInfo, setAssessmentInfo] = useState<any>(null);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 mins in seconds
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (category) {
      loadAssessment(category);
    }
  }, [category]);

  // Timer countdown
  useEffect(() => {
    if (!result && timeLeft > 0 && !loading) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, result, loading]);

  const loadAssessment = async (cat: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/assessments/start/${encodeURIComponent(cat)}`);
      setAssessmentInfo(res.data);
      setQuestions(res.data.questions || []);
      setTimeLeft((res.data.duration_minutes || 15) * 60);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load assessment questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setAnswers({ ...answers, [questionId]: optionIndex });
  };

  const handleSubmit = async () => {
    if (submitting || !category) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await api.post('/assessments/submit', {
        category,
        answers,
      });
      setResult(res.data);

      if (res.data?.passed) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error submitting assessment.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 py-12">
        <LoadingSkeleton className="h-10 w-1/2 rounded-xl" />
        <LoadingSkeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto text-center space-y-4 py-16">
        <div className="p-3 rounded-xl bg-rose-500/10 text-xs text-rose-400 border border-rose-500/30">
          {error}
        </div>
        <Link to="/student/assessments">
          <Button variant="secondary" size="sm">Back to Assessments</Button>
        </Link>
      </div>
    );
  }

  // Completed Test Score Screen
  if (result) {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <Card className="p-8 text-center space-y-6 shadow-2xl border-border bg-surface">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
            {result.passed ? <Award className="w-10 h-10" /> : <AlertCircle className="w-10 h-10 text-amber-400" />}
          </div>

          <div className="space-y-2">
            <Badge variant={result.passed ? 'emerald' : 'amber'} size="md">
              {result.passed ? 'Passed & Verified' : 'Assessment Completed'}
            </Badge>
            <h1 className="text-2xl font-extrabold text-foreground">
              {result.passed ? 'Congratulations!' : 'Good Effort!'}
            </h1>
            <p className="text-xs text-foreground-muted">
              {result.passed
                ? 'Your verified score has been permanently stamped onto your Digital Skill Passport.'
                : 'Review your weak topics below and retake the assessment when ready.'}
            </p>
          </div>

          {/* Score Box */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-surface-elevated border border-border">
            <div>
              <span className="text-3xl font-extrabold text-emerald-400">{result.score_percentage}%</span>
              <span className="block text-[11px] text-foreground-muted mt-0.5">Final Test Score</span>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-foreground">
                {result.correct_answers} / {result.total_questions}
              </span>
              <span className="block text-[11px] text-foreground-muted mt-0.5">Questions Correct</span>
            </div>
          </div>

          {/* Strengths & Weaknesses Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Demonstrated Strengths
              </span>
              <ul className="text-xs text-foreground-muted space-y-1">
                {result.strengths?.length > 0 ? (
                  result.strengths.map((st, i) => <li key={i}>• {st}</li>)
                ) : (
                  <li>• None identified</li>
                )}
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-2">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> Areas for Review
              </span>
              <ul className="text-xs text-foreground-muted space-y-1">
                {result.weaknesses?.length > 0 ? (
                  result.weaknesses.map((w, i) => <li key={i}>• {w}</li>)
                ) : (
                  <li>• None (Perfect score!)</li>
                )}
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4 border-t border-border">
            <Link to="/student/skill-passport">
              <Button variant="primary" size="md" icon={<ShieldCheck className="w-4 h-4" />}>
                View Skill Passport
              </Button>
            </Link>
            <Link to="/student/assessments">
              <Button variant="secondary" size="md" icon={<RefreshCw className="w-4 h-4" />}>
                Take Another Assessment
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const selectedOpt = currentQ ? answers[currentQ.id] : undefined;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6">
      {/* Top Test Bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-surface shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-foreground">{assessmentInfo?.title}</h2>
          <span className="text-[11px] text-foreground-muted">
            Question {currentIndex + 1} of {questions.length} ({answeredCount} answered)
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold">
          <Clock className="w-4 h-4" />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Question Card */}
      {currentQ && (
        <Card className="p-8 shadow-2xl border-border bg-surface space-y-6">
          <div className="space-y-2">
            <Badge variant="cyan" size="sm">Topic: {currentQ.topic}</Badge>
            <h3 className="text-base sm:text-lg font-bold text-foreground leading-relaxed">
              {currentIndex + 1}. {currentQ.question}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt, optIndex) => {
              const isSelected = selectedOpt === optIndex;
              return (
                <button
                  key={optIndex}
                  type="button"
                  onClick={() => handleSelectOption(currentQ.id, optIndex)}
                  className={`w-full flex items-center text-left p-4 rounded-xl border transition-all duration-200 ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-semibold shadow-sm'
                      : 'border-border bg-surface-elevated text-foreground hover:bg-border/60'
                  }`}
                >
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border mr-3 text-xs ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-border text-foreground-muted'
                    }`}
                  >
                    {String.fromCharCode(65 + optIndex)}
                  </div>
                  <span className="text-xs sm:text-sm">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Question Nav & Submit */}
          <div className="flex items-center justify-between pt-6 border-t border-border">
            <Button
              variant="secondary"
              size="sm"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(currentIndex - 1)}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Previous
            </Button>

            <div className="flex gap-1.5">
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-7 w-7 rounded-lg text-xs font-bold transition-colors ${
                    idx === currentIndex
                      ? 'bg-emerald-500 text-white'
                      : answers[q.id] !== undefined
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-surface-elevated text-foreground-muted hover:text-foreground'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            {currentIndex < questions.length - 1 ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setCurrentIndex(currentIndex + 1)}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                loading={submitting}
                onClick={handleSubmit}
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                Finish & Submit
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
