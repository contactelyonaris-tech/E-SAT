import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { NavLink } from '@/components/NavLink';
import logo from '@/assets/logo.png';
import { toast } from 'sonner';

const ExamSubmitted = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [secondsLeft, setSecondsLeft] = useState(20);
  const allowRetake = location.state?.allowRetake || false;
  const [isRetaking, setIsRetaking] = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0) {
      navigate('/dashboard');
      return;
    }

    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, navigate]);

  const handleRetakeExam = async () => {
    if (!id) return;
    
    setIsRetaking(true);
    try {
      const admissionId = localStorage.getItem('student_admission_id');
      if (!admissionId) {
        toast.error('Please log in again');
        navigate('/login');
        return;
      }

      // Clear previous submission if retake is allowed
      if (allowRetake) {
        await supabase
          .from('exam_submissions')
          .delete()
          .eq('exam_id', id)
          .eq('admission_id', admissionId);
      }

      // Navigate back to exam
      navigate(`/exam/${id}`, { replace: true });
    } catch (error) {
      console.error('Error retaking exam:', error);
      toast.error('Failed to start retake. Please try again.');
    } finally {
      setIsRetaking(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-4">
      <div className="bg-card rounded-lg shadow-2xl p-8 max-w-2xl w-full text-center">
  <img src={logo} alt="ELYONARIS TEST V1.0" className="h-16 w-16 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Exam Submitted</h1>
        <p className="text-muted-foreground mb-6">You have finished the exam successfully.</p>

        <div className="bg-muted/50 rounded-lg p-6 mb-6">
          <p className="text-sm">Thank you for completing the exam.</p>
          <p className="text-sm mt-2">Your result will be announced in 1 day.</p>
        </div>

        <div className="mb-6">
          <p className="text-sm text-muted-foreground">Redirecting to your dashboard in <span className="font-mono font-semibold">{secondsLeft}s</span></p>
        </div>

        <div className="flex gap-3 justify-center mb-4 flex-wrap">
          <Button 
            onClick={() => navigate('/dashboard')} 
            className="bg-accent"
            disabled={isRetaking}
          >
            Go to Dashboard
          </Button>
          {allowRetake ? (
            <Button 
              variant="outline" 
              onClick={handleRetakeExam}
              disabled={isRetaking}
            >
              {isRetaking ? 'Preparing Exam...' : 'Retake Exam'}
            </Button>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => navigate(id ? `/exam/${id}` : '/dashboard')}
              disabled={isRetaking}
            >
              Back to Exam
            </Button>
          )}
        </div>

            <div className="mt-6 text-center">
              <div className="text-sm text-muted-foreground mb-2">Need help or have an issue?</div>
              <a
                href="mailto:contact.elyonaris@gmail.com?subject=Exam%20Support%20Request"
                className="inline-block px-4 py-2 rounded bg-accent text-accent-foreground font-semibold hover:bg-accent/90 transition"
                target="_blank" rel="noopener noreferrer"
              >
                Contact Support
              </a>
            </div>
      </div>
    </div>
  );
};

export default ExamSubmitted;
