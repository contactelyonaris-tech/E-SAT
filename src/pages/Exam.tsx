import { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import QuizPlayer from '@/components/QuizPlayer';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Maximize, X, AlertTriangle, Eye, Key } from 'lucide-react';
import AlertIconAnimation from '@/components/AlertIconAnimation';
import { useSecureExam } from '@/hooks/useSecureExam';
import logo from '@/assets/logo.png';
import { supabase } from '@/lib/supabase';

// Require access code for all exams (short-term: stored in exam.description)

const Exam = () => {
  const [showAlertAnim, setShowAlertAnim] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const exam = location.state?.exam;
  // Admin-configured access code (stored in exam.description). If empty, no code is required.
  const expectedExamCode = String(location.state?.exam?.description || '').trim();
  
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(exam?.duration * 60 || 0);
  const [examStarted, setExamStarted] = useState(() => {
    // Try to recover exam state from localStorage
    const savedState = localStorage.getItem(`exam_${id}_state`);
    return savedState ? JSON.parse(savedState).examStarted : false;
  });
  const [examCodesEntered, setExamCodesEntered] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [submittedServer, setSubmittedServer] = useState(false);
  const [recovered, setRecovered] = useState(false);
  
  const { violations, screenshotCount, isFullscreen, enterFullscreen, exitFullscreen } = useSecureExam(examStarted, id);
  const cancelledRef = useRef(false);

  // If a user takes 6 screenshots or switches tabs 6 times on the English exam, cancel and show the sorry page
  useEffect(() => {
    if (!examStarted) return;
    if (cancelledRef.current) return;

    // Check if we're recovering from a refresh
    if (recovered) {
      setRecovered(false); // Reset the flag
      return;
    }

    // rely on the violations array (single source of truth) to count events
    const screenshots = violations.filter(v => v.type === 'screenshot').length;
    const tabSwitches = violations.filter(v => v.type === 'tab-switch').length;

    // show alert animation only for English when there's at least one event
    if ((screenshots > 0 || tabSwitches > 0) && exam?.title?.toLowerCase().includes('english')) {
      setShowAlertAnim(true);
      setTimeout(() => setShowAlertAnim(false), 2000);
    }

    // Only enforce dismissal for screenshot/tab-switch violations, NOT for exit-fullscreen
    if (exam?.title?.toLowerCase().includes('english') && (screenshots >= 6 || tabSwitches >= 6)) {
      // Check retake status before blocking
      (async () => {
        let allowRetake = false;
        try {
          const admissionId = localStorage.getItem('student_admission_id');
          if (admissionId && id) {
            const { data: retakeData } = await supabase
              .from('exam_retake')
              .select('enabled')
              .eq('exam_id', id)
              .eq('admission_id', admissionId)
              .limit(1)
              .single<{ enabled: boolean }>();
            if (retakeData && retakeData.enabled) allowRetake = true;
          }
        } catch (err) { /* ignore */ }
        if (!allowRetake) {
          cancelledRef.current = true;
          // record dismissal server-side (primary truth). localStorage removed per request.
          try {
            const admissionId = localStorage.getItem('student_admission_id');
            if (admissionId) {
                const reason = screenshots >= 6 ? 'taking 6 screenshots' : 'switching tabs 6 times';
                const { data: insertData, error: insertError } = await supabase.from('exam_incidents').insert([
                  {
                    exam_id: id,
                    admission_id: admissionId,
                    reason,
                    created_at: new Date().toISOString(),
                  },
                ]);

                if (insertError) {
                  console.error('Failed to record exam incident to Supabase', insertError);
                  toast.error('Exam dismissal could not be recorded on server. Please contact admin.');
                } else {
                  toast.success('Exam dismissed and recorded.');
              }
            } 
          } catch (err) {
            console.error('Failed to record exam incident to Supabase', err);
            toast.error('Exam dismissal could not be recorded on server. Please contact admin.');
          }

          navigate(`/exam/${id}/cancelled`, { state: { exam, reason: screenshots >= 6 ? 'taking 6 screenshots' : 'switching tabs 6 times' } });
        }
        // If retake is enabled, do NOT block or navigate away
      })();
    }
  }, [violations, examStarted, exitFullscreen, navigate, id, exam]);

  const calculateScore = async (examId: string, answers: Record<string, string>) => {
    try {
      // Get the exam questions with correct answers
      const { data: questions, error } = await supabase
        .from('exam_questions')
        .select('id, correct_answer, value')
        .eq('exam_id', examId);
      
      if (error || !questions) {
        console.error('Error fetching questions for scoring:', error);
        return { score: 0, total: 0 };
      }
      
      let score = 0;
      let total = 0;
      
      // Calculate score based on correct answers
      questions.forEach(question => {
        const questionValue = question.value || 1;
        total += questionValue;
        
        const userAnswer = answers[question.id];
        if (userAnswer && question.correct_answer && 
            String(userAnswer).toLowerCase() === String(question.correct_answer).toLowerCase()) {
          score += questionValue;
        }
      });
      
      return { score, total };
    } catch (e) {
      console.error('Error calculating score:', e);
      return { score: 0, total: 0 };
    }
  };

  const handleEndExam = useCallback(async (clearStorage = true) => {
    if (clearStorage) {
      // Only clear storage if this is a real end exam, not a refresh
      localStorage.removeItem(`exam_${id}_state`);
    }
    
    try {
      await exitFullscreen();
    } catch (e) {
      console.warn('Could not exit fullscreen:', e);
    }
    
    try {
      const admissionId = String(localStorage.getItem('student_admission_id') || '').trim();
      if (admissionId && id) {
        // Get the current answers from the quiz player
        const quizPlayer = document.querySelector('quiz-player');
        // @ts-ignore - Access the component's state if available
        const currentAnswers = quizPlayer?.getAnswers ? quizPlayer.getAnswers() : {};
        
        // Calculate the score
        const { score, total } = await calculateScore(id, currentAnswers);
        
        // First, check if there's already a submission
        const { data: existingSub, error: checkError } = await supabase
          .from('exam_submissions')
          .select('id')
          .eq('exam_id', id)
          .eq('admission_id', admissionId)
          .maybeSingle();

        // Prepare submission data
        const payload = {
          exam_id: id,
          admission_id: admissionId,
          score,
          total,
          answers: currentAnswers,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'completed',
          submitted_at: new Date().toISOString()
        };

        // Only create a new submission if one doesn't exist
        if (!existingSub && !checkError) {
          const { error: insertError } = await supabase
            .from('exam_submissions')
            .insert([payload]);

          if (insertError) {
            console.error('Failed to insert end-exam submission:', insertError);
            // Try one more time with upsert as a fallback
            try {
              await supabase
                .from('exam_submissions')
                .upsert([payload], { onConflict: 'exam_id,admission_id' });
            } catch (e) {
              console.error('Failed to upsert end-exam submission:', e);
            }
          }
        } else if (existingSub) {
          // Update existing submission with score
          await supabase
            .from('exam_submissions')
            .update(payload)
            .eq('id', existingSub.id);
        }
        
        // Store the score for the submitted page
        setExamScore({ score, total });
      }
    } catch (e) { 
      console.error('Error in handleEndExam:', e);
      // Continue with navigation even if there's an error
    }
    
    if (clearStorage) {
      // Navigate to submitted page instead of dashboard
      navigate(`/exam/${id}/submitted`, { 
        state: { 
          exam,
          submission: {
            exam_id: id,
            admission_id: String(localStorage.getItem('student_admission_id') || '').trim(),
            created_at: new Date().toISOString()
          }
        },
        replace: true
      });
    }
  }, [exitFullscreen, navigate, id]);

  useEffect(() => {
    const check = async () => {
      const admissionId = String(localStorage.getItem('student_admission_id') || '').trim();
      if (!admissionId) {
        navigate('/login');
        return;
      }

      try {
        if (id) {
          // Allow admin-enabled retake override
          let allowRetake = false;
          try {
            const { data: retakeData } = await supabase
              .from('exam_retake')
              .select('enabled')
              .eq('exam_id', id)
              .eq('admission_id', admissionId)
              .limit(1)
              .single<{ enabled: boolean }>();
            if (retakeData && retakeData.enabled) allowRetake = true;
          } catch (err) {
            // ignore failures
          }

          // Check submissions first
          const { data: subData, error: subError } = await supabase
            .from('exam_submissions')
            .select('id')
            .eq('exam_id', id)
            .eq('admission_id', admissionId)
            .limit(1)
            .single();
          if (!subError && subData && !allowRetake) {
            setSubmittedServer(true);
            navigate(`/exam/${id}/submitted`, { state: { exam } });
            return;
          }

          // Only redirect to cancelled if a real incident exists for this user and exam
          const { data: incData, error: incError } = await supabase
            .from('exam_incidents')
            .select('reason')
            .eq('exam_id', id)
            .eq('admission_id', admissionId)
            .limit(1)
            .single();
          // FIX: If retake is enabled, DO NOT block or redirect to cancelled page
          if (!incError && incData && incData.reason && !allowRetake) {
            navigate(`/exam/${id}/cancelled`, { state: { reason: incData.reason } });
            return;
          }
          // If retake is enabled, allow access regardless of previous incident
        }
      } catch (err) {
        console.error('Failed to check exam records in Supabase:', err);
        // fallback: continue without blocking (no server info)
      }

      if (!exam) {
        navigate('/dashboard');
      }
    };
    check();
  }, [navigate, exam, id]);

  // Save exam state to localStorage whenever it changes
  useEffect(() => {
    if (examStarted) {
      const examState = {
        examStarted,
        timeRemaining,
        exam: exam,
        startedAt: new Date().toISOString()
      };
      localStorage.setItem(`exam_${id}_state`, JSON.stringify(examState));
    }
  }, [examStarted, timeRemaining, exam, id]);

  // Recover exam state on component mount
  useEffect(() => {
    const recoverExamState = async () => {
      const savedState = localStorage.getItem(`exam_${id}_state`);
      if (savedState) {
        const { examStarted: savedExamStarted, timeRemaining: savedTimeRemaining } = JSON.parse(savedState);
        if (savedExamStarted) {
          // Re-enter fullscreen if needed
          if (!document.fullscreenElement) {
            try {
              await document.documentElement.requestFullscreen();
            } catch (e) {
              console.warn('Could not re-enter fullscreen:', e);
            }
          }
          setExamStarted(true);
          setTimeRemaining(savedTimeRemaining);
          setRecovered(true);
        }
      }
    };

    recoverExamState();
  }, [id]);

  useEffect(() => {
    if (!examStarted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleEndExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, handleEndExam]);

  const [isStartingExam, setIsStartingExam] = useState(false);

  const handleStartExam = async () => {
    if (isStartingExam) return; // Prevent multiple clicks
    
    setIsStartingExam(true);
    
    try {
      const admissionId = String(localStorage.getItem('student_admission_id') || '').trim();
      if (!admissionId || !id) {
        toast.error('Invalid student information. Please log in again.');
        setIsStartingExam(false);
        return;
      }

      // First check for any existing submission
      const { data: subData, error: subError } = await supabase
        .from('exam_submissions')
        .select('id, created_at')
        .eq('exam_id', id)
        .eq('admission_id', admissionId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subError) {
        console.error('Error checking submissions:', subError);
        toast.error('Error checking exam status');
        setIsStartingExam(false);
        return;
      }

      if (subData) {
        // If we have a submission, redirect to submitted page
        navigate(`/exam/${id}/submitted`, { 
          state: { 
            exam,
            submission: subData
          },
          replace: true // Prevent going back
        });
        return;
      }

      // Check for any incidents/cancellations
      const { data: incData, error: incError } = await supabase
        .from('exam_incidents')
        .select('reason, created_at')
        .eq('exam_id', id)
        .eq('admission_id', admissionId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (incError) {
        console.error('Error checking incidents:', incError);
        toast.error('Error checking exam status');
        setIsStartingExam(false);
        return;
      }

      if (incData?.reason) {
        // If we have an incident, redirect to cancelled page
        navigate(`/exam/${id}/cancelled`, { 
          state: { 
            reason: incData.reason,
            exam,
            incident: incData
          },
          replace: true // Prevent going back
        });
        return;
      }

      // If we get here, all checks passed - start the exam
      try {
        await enterFullscreen();
        setExamStarted(true);
      } catch (fullscreenError) {
        console.error('Fullscreen error:', fullscreenError);
        // Even if fullscreen fails, allow the exam to start
        setExamStarted(true);
      }
    } catch (error) {
      console.error('Unexpected error in handleStartExam:', error);
      toast.error('Failed to start exam. Please try again.');
    } finally {
      setIsStartingExam(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmitExamCodes = () => {
    const entered = accessCode.trim();
    if (entered === '') return;

    // If no access code configured in admin, block progression
    if (!expectedExamCode) {
      toast.error('No access code is configured for this exam.');
      return;
    }

    if (entered.toLowerCase() === expectedExamCode.toLowerCase()) {
      setExamCodesEntered(true);
    } else {
      toast.error('Invalid exam code.');
    }
  };

  if (!exam) return null;

  // Always show the access-code form first for every exam (require admin to set the code in exam.description)
  if (!examCodesEntered && !examStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a2e0a] via-[#0d3d0d] to-[#0a2e0a] flex items-center justify-center p-4">
        <div className="bg-card rounded-lg shadow-2xl p-8 max-w-3xl w-full">
          <div className="text-center mb-6">
            <img src={logo} alt="ELYONARIS TEST V1.0" className="h-16 w-16 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
              <Key className="h-6 w-6 text-accent" />
              Enter Exam Code
            </h1>
            <p className="text-muted-foreground">Please enter the exam access code before proceeding</p>
          </div>

          <div className="bg-muted/50 rounded-lg p-6 mb-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="access-code" className="text-foreground font-semibold">
                  {exam?.title ? `${exam.title} — Exam Code` : 'Exam Code'}
                </Label>
                <Input
                  id="access-code"
                  type="text"
                  placeholder={`Enter exam access code`}
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="w-full"
                  autoComplete="off"
                />
              </div>
            </div>
          </div>

          {(!expectedExamCode || expectedExamCode === '') && (
            <div className="mb-4 text-sm text-yellow-300">No access code is configured for this exam. Please contact the administrator to set an access code.</div>
          )}

          <Button
            onClick={handleSubmitExamCodes}
            disabled={accessCode.trim() === '' || !expectedExamCode}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {accessCode.trim() !== '' ? 'Continue to Exam' : 'Please enter exam code'}
          </Button>
        </div>
      </div>
    );
  }

  if (!examStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a2e0a] via-[#0d3d0d] to-[#0a2e0a] flex items-center justify-center p-4">
        <div className="bg-card rounded-lg shadow-2xl p-8 max-w-2xl w-full">
          <div className="text-center mb-6">
            <img src={logo} alt="ELYONARIS TEST V1.0" className="h-16 w-16 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">{exam.title}</h1>
            <p className="text-muted-foreground">{exam.description}</p>
          </div>

          <div className="bg-gradient-to-br from-[#0f4a0f] to-[#0a2e0a] rounded-lg p-6 mb-6 border border-accent/30 shadow-lg">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-accent" />
              Exam Instructions
            </h2>
            <ul className="space-y-3 text-sm text-white">
              <li className="flex items-start gap-2">
                <span className="text-accent mt-1">•</span>
                <span>Duration: {exam.duration} minutes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-1">•</span>
                <span>The exam will open in fullscreen mode</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-1">•</span>
                <span>Copy/paste functions are disabled</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-1">•</span>
                <span>Maximum 6 screenshot attempts allowed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-1">•</span>
                <span>Tab switching will be monitored</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-1">•</span>
                <span>AI detection is active</span>
              </li>
            </ul>
          </div>

          <Button
            onClick={handleStartExam}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-6 text-lg"
          >
            <Maximize className="mr-2 h-5 w-5" />
            Start Secure Exam
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-[#0a2e0a] via-[#0d3d0d] to-[#0a2e0a]">
      {showAlertAnim && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50">
          <AlertIconAnimation />
        </div>
      )}
      {/* Exam Header */}
      <header className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between border-b border-accent/30">
        <div className="flex items-center gap-3">
          <img src={logo} alt="ELYONARIS TEST V1.0" className="h-8 w-8" />
          <div>
            <h1 className="font-semibold text-sm">{exam.title}</h1>
            <p className="text-xs opacity-80">Secure Exam Mode</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
    <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>Monitoring Active</span>
            </div>
            <div className="font-mono font-semibold text-accent">
              {formatTime(timeRemaining)}
            </div>
          </div>
          
          {violations.length > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {violations.length} violations
            </Badge>
          )}
          
          {screenshotCount > 0 && (
            <Badge variant="outline" className="border-accent text-accent">
              Screenshots: {screenshotCount}/6
            </Badge>
          )}
          
          {!isFullscreen && (
            <Button
              size="sm"
              variant="outline"
              onClick={enterFullscreen}
              className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
            >
              <Maximize className="h-4 w-4 mr-1" />
              Fullscreen
            </Button>
          )}
          
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setShowExitDialog(true)}
          >
            <X className="h-4 w-4 mr-1" />
            End Exam
          </Button>
        </div>
      </header>

      {submittedServer && (
        <div className="bg-yellow-900 text-yellow-100 px-4 py-3 text-center">
          You have already submitted this exam. Access is disabled — your submission is saved.
        </div>
      )}

      {/* Exam Content: internal player for Moodle-style exams */}
      <main className="flex-1 overflow-hidden">
        <QuizPlayer examId={id as string} />
      </main>


      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Exam?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to end the exam? Your responses will be submitted automatically.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Exam</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleEndExam()} className="bg-destructive hover:bg-destructive/90">
              End Exam
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Exam;
