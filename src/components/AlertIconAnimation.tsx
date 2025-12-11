import { AlertTriangle } from 'lucide-react';

const AlertIconAnimation = () => {
  return (
    <div className="relative">
      <div className="absolute inset-0 rounded-full bg-destructive/40 blur-md animate-ping"></div>
      <div className="h-12 w-12 bg-destructive rounded-full flex items-center justify-center text-destructive-foreground shadow-xl">
        <AlertTriangle className="h-7 w-7" />
      </div>
    </div>
  );
};

export default AlertIconAnimation;