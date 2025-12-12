import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock } from 'lucide-react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';
import { supabase } from '@/lib/supabase';

const Login = () => {
  const navigate = useNavigate();
  const [admissionId, setAdmissionId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdminPasswordDialog, setShowAdminPasswordDialog] = useState(false);
  const [adminWhoInput, setAdminWhoInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminCandidate, setAdminCandidate] = useState<{id: string; name: string} | null>(null);
  

  useEffect(() => {
    const sub = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate('/dashboard');
      }
    });
    return () => {
      sub.data.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const id = String(admissionId || '').replace(/\s+/g, '').trim();
      const userPassword = password.trim();
      
      if (!id) {
        toast.error('Please enter your admission ID');
        return;
      }
      
      if (!userPassword) {
        toast.error('Please enter your password');
        return;
      }
      
      // Check for admin login
      if (id === '7975035' && userPassword === '1234') {
        localStorage.setItem('is_admin', 'true');
        localStorage.setItem('student_admission_id', id);
        localStorage.setItem('student_first_name', 'Admin');
        toast.success('Admin login successful');
        navigate('/admin');
        return;
      }
      
      // For regular users, check if it's first login (password is still default 1234)
      if (userPassword === '1234') {
        // Redirect to password change page for first-time login
        navigate(`/password-change?admissionId=${id}`);
        return;
      }
      
      // Get user data with password from Supabase
      const { data: user, error: userError } = await supabase
        .from('students_1')
        .select('admission_id, first_name, password')
        .eq('admission_id', id)
        .limit(1)
        .single();
        
      if (userError || !user) {
        toast.error('Invalid admission ID or password');
        return;
      }
      
      // Verify the password using the database function
      const { data: isValid, error: verifyError } = await supabase
        .rpc('verify_password', {
          stored_password: user.password,
          input_password: userPassword
        });
      
      if (verifyError || !isValid) {
        toast.error('Invalid admission ID or password');
        return;
      }
      
      // Store user data in localStorage
      localStorage.setItem('student_admission_id', id);
      localStorage.setItem('student_first_name', user.first_name || 'User');
      toast.success('Login successful');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminPasswordConfirm = () => {
    if (!adminCandidate) return;
    const pw = String(adminPasswordInput || '').trim();
    
    // Check if it's the admin user with default password 1234
    if (adminCandidate.id === '7975035' && pw === '1234') {
      localStorage.setItem('is_admin', 'true');
      localStorage.setItem('student_admission_id', adminCandidate.id);
      localStorage.setItem('student_first_name', adminCandidate.name);
      toast.success('Admin access granted');
      setShowAdminPasswordDialog(false);
      setAdminPasswordInput('');
      setAdminWhoInput('');
      setAdminCandidate(null);
      navigate('/admin');
    } else {
      // Check if it's an admin with a changed password
      const storedPassword = localStorage.getItem(`user_password_${adminCandidate.id}`);
      if (storedPassword && storedPassword === pw) {
        localStorage.setItem('is_admin', 'true');
        localStorage.setItem('student_admission_id', adminCandidate.id);
        localStorage.setItem('student_first_name', adminCandidate.name);
        toast.success('Admin access granted');
        setShowAdminPasswordDialog(false);
        setAdminPasswordInput('');
        setAdminWhoInput('');
        setAdminCandidate(null);
        navigate('/admin');
      } else {
        toast.error('Invalid admin credentials');
      }
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a2e0a] via-[#0d3d0d] to-[#0a2e0a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10 mx-auto px-4">
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="flex justify-center mb-6 animate-float">
            <div className="relative">
              <div className="absolute inset-0 bg-accent/30 rounded-3xl blur-xl animate-glow"></div>
              <div className="relative bg-gradient-to-br from-background to-accent/10 p-4 rounded-3xl shadow-2xl border-2 border-accent/30">
                <img src={logo} alt="ELYONARIS TEST V1.0" className="h-24 w-24" />
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#d4f4dd] via-accent to-[#d4f4dd] bg-clip-text text-transparent mb-3 animate-fade-in">
            ELYONARIS TEST V1.0
          </h1>
          <p className="text-[#d4f4dd]/80 flex items-center justify-center gap-2 text-lg animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Shield className="h-5 w-5 text-accent animate-pulse" />
            Secure Exam Platform
          </p>
        </div>

        <Card className="w-full border-accent/30 shadow-2xl bg-gradient-to-br from-[#0f4a0f] to-[#0a2e0a] backdrop-blur-xl animate-scale-in">
          <CardHeader className="space-y-1 pb-6 px-8 pt-8">
            <CardTitle className="text-3xl text-[#d4f4dd] font-bold">Sign In</CardTitle>
            <CardDescription className="text-[#d4f4dd]/60 text-base">
              Enter your credentials to access your exams
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleLogin} className="space-y-5 w-full">
              <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <Label htmlFor="admissionId" className="text-[#d4f4dd] font-medium">Admission ID</Label>
                <Input
                  id="admissionId"
                  type="text"
                  placeholder="Enter your admission ID"
                  value={admissionId}
                  onChange={(e) => setAdmissionId(e.target.value)}
                  required
                  className="bg-[#0a2e0a]/50 border-accent/30 text-[#d4f4dd] placeholder:text-[#d4f4dd]/40 focus:border-accent focus:ring-accent/50 transition-all duration-300 h-12"
                />
              </div>
              <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <Label htmlFor="password" className="text-[#d4f4dd] font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password (default: 1234)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-[#0a2e0a]/50 border-accent/30 text-[#d4f4dd] placeholder:text-[#d4f4dd]/40 focus:border-accent focus:ring-accent/50 transition-all duration-300 h-12"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-[#a3e635] to-[#84cc16] hover:from-[#bef264] hover:to-[#a3e635] text-[#0a2e0a] font-bold text-lg h-14 shadow-lg hover:shadow-accent/50 transition-all duration-300 hover:scale-105 animate-fade-in relative overflow-hidden group"
                style={{ animationDelay: '0.5s' }}
                disabled={loading}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                <Lock className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-pulse">Signing in</span>
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-[#0a2e0a] rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-[#0a2e0a] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                      <span className="w-1.5 h-1.5 bg-[#0a2e0a] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    </span>
                  </span>
                ) : 'Sign In'}
              </Button>
            </form>
            
            <div className="mt-6 p-5 bg-gradient-to-r from-accent/10 to-primary/10 rounded-xl border border-accent/20 backdrop-blur-sm animate-fade-in w-full" style={{ animationDelay: '0.6s' }}>
              <div className="flex items-start gap-3">
                <div className="bg-accent/20 p-2 rounded-lg">
                  <Shield className="h-5 w-5 text-accent" />
                </div>
                <div className="text-sm text-[#d4f4dd]/80">
                  <p className="font-bold text-[#d4f4dd] mb-2 text-base">Security Notice</p>
                  <p className="leading-relaxed">During the exam, copying, pasting, and excessive screenshots will be monitored and restricted.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

            <p className="text-center mt-6 text-[#d4f4dd]/50 text-sm animate-fade-in w-full" style={{ animationDelay: '0.7s' }}>
          Brought To You By Elyonaris Support Team
        </p>
      </div>
    </div>
  );
};

export default Login;

