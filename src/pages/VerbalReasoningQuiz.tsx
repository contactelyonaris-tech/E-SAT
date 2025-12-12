import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function VerbalReasoningQuiz() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the actual quiz after a short delay
    const timer = setTimeout(() => {
      navigate('/verbal-reasoning/quiz');
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Loading Verbal Reasoning Quiz...</h1>
        <p>You will be redirected to the quiz shortly.</p>
      </div>
    </div>
  );
}
