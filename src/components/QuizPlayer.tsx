import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Question {
  id: string;
  question_text: string;
  options?: string[] | null;
  correct_answer?: string | number | null;
  value?: number | string | null;
}

const QuizPlayer: React.FC<{ examId: string }> = ({ examId }) => {
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
        const { data } = await supabase
          .from('exam_questions')
          .select('*')
          .eq('exam_id', examId)
          .order('order_index', { ascending: true });
        if (!mounted) return;
        const rows = (data || []) as Question[];
        setQuestions(rows);
      } catch (err) {
        console.error('Failed to load questions', err);
        toast.error('Failed to load exam questions. Contact admin.');
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [examId]);

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

  if (loading) return <div className="p-6">Loading exam...</div>;
  if (questions.length === 0) return <div className="p-6">No questions found for this exam. Contact admin.</div>;

  return (
    <div className="p-6 overflow-auto h-full">
      <h2 className="text-2xl font-bold mb-4">Online Exam</h2>

      <div className="flex gap-6">
        <div className="flex-1">
          {questions[currentIndex] && (
            <div className="p-4 border rounded bg-white text-black">
              <div className="mb-2 font-semibold flex items-center justify-between">
                <span>{currentIndex + 1}. {questions[currentIndex].question_text}</span>
                <Button variant="destructive" size="sm" onClick={() => setFlagged(prev => {
                  const next = new Set(Array.from(prev));
                  if (next.has(currentIndex)) next.delete(currentIndex); else next.add(currentIndex);
                  return next;
                })}>{flagged.has(currentIndex) ? 'Unflag' : 'Flag'}</Button>
              </div>
              <div className="space-y-2">
                {Array.isArray(questions[currentIndex].options) ? (
                  (questions[currentIndex].options as string[]).map((opt: string, i: number) => (
                    <label key={i} className="flex items-center gap-2">
                      <input type="radio" name={`q-${questions[currentIndex].id}`} checked={answers[questions[currentIndex].id] === String(opt)} onChange={() => handleSelect(questions[currentIndex].id, String(opt))} />
                      <span>{opt}</span>
                    </label>
                  ))
                ) : (
                  <div>
                    <Input value={answers[questions[currentIndex].id] || ''} onChange={(e) => handleSelect(questions[currentIndex].id, e.target.value)} placeholder="Type your answer" />
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}>Previous</Button>
                <Button variant="outline" onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}>Next</Button>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button className="bg-accent" onClick={handleSubmit}>Review & Submit</Button>
          </div>
        </div>
        <div className="w-56 p-3 border rounded bg-white">
          <div className="font-semibold mb-2">Questions</div>
          <div className="grid grid-cols-4 gap-2">
            {questions.map((_, idx) => {
              const isCurrent = idx === currentIndex;
              const isAnswered = answeredIdxs.has(idx);
              const isFlagged = flagged.has(idx);
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-10 h-10 rounded border flex items-center justify-center text-sm font-semibold ${isCurrent ? 'bg-primary text-primary-foreground' : isAnswered ? 'bg-muted' : 'bg-card'} ${isFlagged ? 'ring-2 ring-destructive' : ''}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
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
