import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { NavLink } from '@/components/NavLink';
import logo from '@/assets/logo.png';

const ExamCancelled = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  type CancelState = { reason?: string } | null;
  const state = location.state as CancelState;
  const reason = state?.reason ?? 'cheating detected';
  const [secondsLeft, setSecondsLeft] = useState(10);

  useEffect(() => {
    if (secondsLeft <= 0) {
      window.location.reload();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-4">
      <div className="bg-card rounded-lg shadow-2xl p-8 max-w-2xl w-full text-center">
        <img src={logo} alt="ELYONARIS TEST V1.0" className="h-16 w-16 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-destructive mb-2">Exam Cancelled</h1>
        <p className="text-muted-foreground mb-6">{
          reason && (reason === 'previous dismissal' || reason.toLowerCase().includes('cheat') || reason.toLowerCase().includes('dismiss'))
          ? 'Sorry — this exam cannot be accessed due to prior cheating/dismissal.'
          : `Sorry — your exam has been cancelled due to ${reason}.`
        }</p>

        <div className="bg-muted/50 rounded-lg p-6 mb-6">
          <p className="text-sm">The exam has been terminated and your actions have been logged for review.</p>
          <p className="text-sm mt-2">If you believe this is a mistake, contact the support team.</p>
        </div>

        <div className="mb-6">
          <p className="text-sm text-muted-foreground">Refreshing page in <span className="font-mono font-semibold">{secondsLeft}s</span></p>
        </div>

        <div className="flex gap-3 justify-center mb-4">
          <Button onClick={() => navigate('/dashboard')} className="bg-accent">Go to Dashboard now</Button>
        </div>

            <div className="mt-6 text-center">
              <div className="text-sm text-muted-foreground mb-2">Need help or think this is a mistake?</div>
              <NavLink
                to="/contact"
                className="inline-block px-4 py-2 rounded bg-accent text-accent-foreground font-semibold hover:bg-accent/90 transition"
              >
                Contact Support
              </NavLink>
            </div>
      </div>
    </div>
  );
};

export default ExamCancelled;
