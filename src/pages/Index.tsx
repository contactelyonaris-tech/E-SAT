import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to landing page
    navigate('/landing');
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Welcome to Your App</h1>
        <p className="text-xl text-muted-foreground">Redirecting to the landing page...</p>
      </div>
    </div>
  );
};

export default Index;
