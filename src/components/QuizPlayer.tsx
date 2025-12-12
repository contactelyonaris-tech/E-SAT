import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export interface Question {
  id: string;
  question_text: string;
  options?: string[] | null;
  correct_answer?: string | number | null;
  value?: number | string | null;
  type?: string;
  section?: string;
  passage?: string;
}

interface QuizPlayerProps {
  examId?: string;
  localQuestions?: Question[];
  title?: string;
}

const QuizPlayer: React.FC<QuizPlayerProps> = ({ examId, localQuestions, title = 'Quiz' }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [answeredIdxs, setAnsweredIdxs] = useState<Set<number>>(new Set());
  const [reviewOpen, setReviewOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        if (localQuestions) {
          // Use local questions if provided
          if (!mounted) return;
          setQuestions(localQuestions);
        } else if (examId) {
          // Otherwise load from database
          const { data } = await supabase
            .from('exam_questions')
            .select('*')
            .eq('exam_id', examId)
            .order('order_index', { ascending: true });
          if (!mounted) return;
          const rows = (data || []) as Question[];
          setQuestions(rows);
        }
      } catch (err) {
        console.error('Failed to load questions', err);
        toast.error('Failed to load questions. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [examId, localQuestions]);

  const handleSelect = (qId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
    const idx = questions.findIndex(q => q.id === qId);
    if (idx >= 0) setAnsweredIdxs(prev => new Set([...Array.from(prev), idx]));
  };

  const performSubmit = async () => {
    const admissionId = String(localStorage.getItem('student_admission_id') || '').trim();
    if (!admissionId) {
      toast.error('Account is not linked to an admission ID');
      return;
    }

    let score = 0;
    // Total should be based on per-question value when provided, otherwise default to 1
    const total = questions.reduce((acc, q) => acc + (Number(q.value) || 1), 0);
    
    questions.forEach((q, idx) => {
      if (flagged.has(idx)) return; // flagged questions score 0
      
      const expected = q.correct_answer;
      const given = answers[q.id];
      
      if (expected !== undefined && expected !== null && given !== undefined) {
        // Normalize both expected and given answers for comparison
        const normalize = (value: any) => {
          if (value === null || value === undefined) return '';
          return String(value).trim().toLowerCase();
        };
        
        const normalizedExpected = normalize(expected);
        const normalizedGiven = normalize(given);
        
        // For multiple choice questions with options array
        if (Array.isArray(q.options) && q.options.length > 0) {
          // If the given answer is an index (number), get the corresponding option
          if (!isNaN(Number(given)) && Number(given) >= 0 && Number(given) < q.options.length) {
            const optionIndex = Number(given);
            if (normalize(q.options[optionIndex]) === normalizedExpected) {
              score += (Number(q.value) || 1);
            }
          } 
          // If the given answer is the text of the option
          else if (q.options.some(opt => normalize(opt) === normalizedGiven)) {
            if (normalizedGiven === normalizedExpected) {
              score += (Number(q.value) || 1);
            }
          }
        } 
        // For free text answers
        else if (normalizedGiven === normalizedExpected) {
          score += (Number(q.value) || 1);
        }
      }
    });

    try {
      const payload = {
        exam_id: examId,
        admission_id: admissionId,
        score,
        total,
        answers,
        created_at: new Date().toISOString(),
      } as const;

      let saved = false;
      try {
        const { error: upsertError } = await supabase
          .from('exam_submissions')
          .upsert([payload], { onConflict: 'exam_id,admission_id' });
        if (!upsertError) saved = true;
      } catch (e) { console.warn('Upsert failed, will try insert', e); }

      if (!saved) {
        try {
          const { error: insertError } = await supabase
            .from('exam_submissions')
            .insert([payload]);
          if (insertError) {
            console.error('Failed to save submission', insertError);
            // Fallback: try again with stringified answers in case column type is text
            try {
              const altPayload = { ...payload, answers: JSON.stringify(answers) } as const;
              const { error: altError } = await supabase
                .from('exam_submissions')
                .insert([altPayload]);
              if (!altError) {
                saved = true;
              }
            } catch (e2) { /* ignore */ }
            // Save payload to localStorage as a fallback so admin can recover or student can retry later
            try {
              const pendingKey = 'pending_exam_submissions';
              const existing = JSON.parse(localStorage.getItem(pendingKey) || '[]');
              existing.push(payload);
              localStorage.setItem(pendingKey, JSON.stringify(existing));
            } catch (e) { console.warn('Failed to persist pending submission locally', e); }
            const msg = String(insertError?.message || '');
            if (msg.includes('ux_exam_submissions_exam_admission') || msg.includes('duplicate key value violates unique constraint')) {
              toast.error('Submission could not be recorded to the server (duplicate key value violates unique constraint "ux_exam_submissions_exam_admission"). It was saved locally and the admin can recover it.');
            } else {
              const errMsg = msg ? ` (${msg})` : '';
              toast.error(`Submission could not be recorded to the server${errMsg}. It was saved locally and the admin can recover it.`);
            }
          } else {
            saved = true;
          }
        } catch (e) {
          console.error('Insert attempt failed', e);
          try {
            const pendingKey = 'pending_exam_submissions';
            const existing = JSON.parse(localStorage.getItem(pendingKey) || '[]');
            existing.push(payload);
            localStorage.setItem(pendingKey, JSON.stringify(existing));
          } catch (ee) { console.warn('Failed to persist pending submission locally', ee); }
          const msg = e && (e as Error).message ? String((e as Error).message) : '';
          if (msg.includes('ux_exam_submissions_exam_admission') || msg.includes('duplicate key value violates unique constraint')) {
            toast.error('Submission could not be recorded to the server (duplicate key value violates unique constraint "ux_exam_submissions_exam_admission"). It was saved locally and the admin can recover it.');
          } else {
            const errMsg = msg ? ` (${msg})` : '';
            toast.error(`Submission could not be recorded to the server${errMsg}. It was saved locally and the admin can recover it.`);
          }
        }
      }

      // Always navigate to the submitted page after attempting to save — do not block the user
      if (saved) {
        toast.success('Submission saved');
      }
      navigate(`/exam/${examId}/submitted`, { state: { exam: { id: examId, title: 'English Exam' } } });
    } catch (err) {
      console.error('Submit error', err);
      try {
        const pendingKey = 'pending_exam_submissions';
        const existing = JSON.parse(localStorage.getItem(pendingKey) || '[]');
        existing.push({ exam_id: examId, admission_id: admissionId, score, total, answers: JSON.stringify(answers), created_at: new Date().toISOString() });
        localStorage.setItem(pendingKey, JSON.stringify(existing));
      } catch (ee) { console.warn('Failed to persist pending submission locally', ee); }
      const msg = err && (err as Error).message ? String((err as Error).message) : '';
      if (msg.includes('ux_exam_submissions_exam_admission') || msg.includes('duplicate key value violates unique constraint')) {
        toast.error('Submission could not be recorded to the server (duplicate key value violates unique constraint "ux_exam_submissions_exam_admission"). It was saved locally and the admin can recover it.');
      } else {
        const errMsg = msg ? ` (${msg})` : '';
        toast.error(`Submission could not be recorded to the server${errMsg}. It was saved locally and the admin can recover it.`);
      }
    }
  };

  const handleSubmit = () => {
    setReviewOpen(true);
  };

  if (loading) return <div className="p-4">Loading questions...</div>;
  if (!questions.length) return <div className="p-4">No questions found.</div>;

  const currentQuestion = questions[currentIndex];

  return (
    <div className="p-2 sm:p-4 md:p-6 overflow-auto h-full max-w-4xl mx-auto w-full">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 mb-4 sm:mb-6 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Question {currentIndex + 1} of {questions.length}
              </span>
              {currentQuestion.section && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                  {currentQuestion.section}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={flagged.has(currentIndex) ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                const newFlagged = new Set(flagged);
                if (flagged.has(currentIndex)) {
                  newFlagged.delete(currentIndex);
                } else {
                  newFlagged.add(currentIndex);
                }
                setFlagged(newFlagged);
              }}
            >
              {flagged.has(currentIndex) ? '⭐ Unflag' : '⭐ Flag for Review'}
            </Button>
          </div>
        </div>
        
        {currentQuestion.passage && (
          <div className="mb-4 p-4 bg-gray-50 rounded">
            <p className="whitespace-pre-line">{currentQuestion.passage}</p>
          </div>
        )}
        
        <p className="mb-4">{currentQuestion.question_text}</p>

        <div className="space-y-2">
          {Array.isArray(currentQuestion.options) ? (
            currentQuestion.options.map((option, i) => (
              <div key={i}
                onClick={() => handleSelect(currentQuestion.id, String(i))}
                className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${answers[currentQuestion.id] === String(i) ? 'bg-blue-50 border-blue-500' : ''}`}
              >
                {String.fromCharCode(65 + i)}. {option}
              </div>
            ))
          ) : (
            <div>
              <Input value={answers[currentQuestion.id] || ''} onChange={(e) => handleSelect(currentQuestion.id, e.target.value)} placeholder="Type your answer" />
            </div>
          )}
        </div>


        <div className="mt-4 sm:mt-6 flex flex-col-reverse sm:flex-row gap-3 justify-between items-stretch sm:items-center border-t border-gray-200 dark:border-gray-700 pt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="w-full sm:w-auto h-11 sm:h-10"
          >
            <span className="hidden sm:inline">←</span> Previous
          </Button>
          
          <div className="flex gap-3 w-full sm:w-auto">
            {currentIndex < questions.length - 1 ? (
              <Button 
                onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
                className="w-full sm:w-auto h-11 sm:h-10 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Next <span className="hidden sm:inline">Question →</span>
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                className="w-full sm:w-auto h-11 sm:h-10 bg-green-600 hover:bg-green-700"
              >
                Submit Quiz
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 sm:mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 w-full">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Questions</h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 mr-1"></span>
              Answered
            </span>
            <span className="flex items-center">
              <span className="w-3 h-3 rounded-full border border-gray-200 dark:border-gray-600 mr-1"></span>
              Unanswered
            </span>
            <span className="flex items-center">
              <span className="w-3 h-3 rounded-full ring-2 ring-yellow-400 dark:ring-yellow-500 mr-1"></span>
              Flagged
            </span>
          </div>
        </div>
        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
          {questions.map((_, idx) => {
            const isCurrent = idx === currentIndex;
            const isAnswered = answeredIdxs.has(idx);
            const isFlagged = flagged.has(idx);
            return (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-md flex items-center justify-center text-sm font-medium transition-colors
                  ${isCurrent 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : isAnswered 
                      ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' 
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600'}
                  ${isFlagged ? 'ring-2 ring-yellow-400 dark:ring-yellow-500' : ''}
                  border hover:bg-gray-50 dark:hover:bg-gray-700/70`}
                title={isFlagged ? 'Flagged for review' : `Question ${idx + 1}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      <AlertDialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Review your status</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="max-h-60 overflow-auto space-y-2 text-sm">
            {questions.map((q, idx) => {
              const isAnswered = Boolean(String(answers[q.id] || '').trim());
              const isFlagged = flagged.has(idx);
              return (
                <div key={q.id} className="flex items-center justify-between">
                  <span className="font-medium">Q{idx + 1}</span>
                  <span className="ml-2 text-muted-foreground">{isAnswered ? 'Answered' : 'Not answered'}</span>
                  {isFlagged && <span className="text-destructive font-semibold ml-2">Flagged (scores 0)</span>}
                </div>
              );
            })}
          </div>
          <div className="text-muted-foreground text-xs mt-2">Flagged questions will be scored 0.</div>
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction onClick={performSubmit}>Confirm Submit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default QuizPlayer;
