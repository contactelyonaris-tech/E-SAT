import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { FileText, LogOut, Clock, CheckCircle, AlertCircle, GraduationCap, School, Calendar, MapPin } from 'lucide-react';
import logo from '@/assets/logo.png';
import { supabase } from '@/lib/supabase';


interface UserProfile {
  name: string;
  email: string;
  age: number;
  school: string;
  grade: string;
  location: string;
}

interface Exam {
  id: string;
  title: string;
  description: string;
  duration: number;
  // keep as string because DB may contain custom statuses like 'available_blurred'
  status: string;
  formUrl?: string;
  category?: 'natural' | 'social';
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    email: '',
    age: 0,
    school:'',
    grade: '',
    location: 'Addis Abeba, Ethiopia'
  });
  // Removed Results modal functionality as requested
  
  const defaultExams: Exam[] = [
    { id: 'elyonaris', title: 'English Exam', description: 'English Online Exam', duration: 120, status: 'available' },
    { id: '2', title: 'Mathematics Matriculation Exam 2025 (Paper 1)', description: 'Calculus and Linear Algebra comprehensive test', duration: 120, status: 'not-ready' },
    { id: '3', title: 'Physics Midterm', description: 'Physics Matriculation Exam 2025 (Paper 1)', duration: 90, status: 'not-ready' },
  ];

  const [exams, setExams] = useState<Exam[]>(defaultExams);

  useEffect(() => {
    // Load exams from DB and fall back to defaults if none returned
    const load = async () => {
      try {
        const { data } = await supabase.from('exams').select('id,title,description,access_code,duration,status').order('id', { ascending: true });
        if (Array.isArray(data) && data.length > 0) {
          type DbExamRow = { 
            id: string; 
            title?: string | null; 
            description?: string | null; 
            access_code?: string | null; 
            duration?: number | null; 
            status?: string | null 
          };
          
          const rows = (data as DbExamRow[]).map((r) => ({
            id: String(r.id),
            title: String(r.title || r.id || ''),
            description: String(r.description || ''),
            access_code: String(r.access_code || r.description || ''),
            duration: Number.isFinite(Number(r.duration)) ? Number(r.duration) : 90,
            status: String(r.status || ''),
          } as Exam));
          setExams(rows);
        }
      } catch (err) {
        console.warn('Failed to load exams from DB, using defaults', err);
      }
    };
    void load();

    // Refresh when admin updates exams elsewhere in the app
    const onUpdated = () => { void load(); };
    window.addEventListener('exams:updated', onUpdated);
    return () => window.removeEventListener('exams:updated', onUpdated);
  }, []);

  useEffect(() => {
    const init = async () => {
      const admissionId = String(localStorage.getItem('student_admission_id') || '').trim();
      if (!admissionId) {
        navigate('/login');
        return;
      }

      interface StudentRow {
        first_name: string;
        last_name: string;
        section?: string | null;
        roll_number?: string | null;
        school?: string | null;
        age?: number | string | null;
        date_of_birth?: string | null;
        location?: string | null;
      }
      const { data, error } = await supabase
        .from('students_1')
        .select('first_name, last_name, section, roll_number, school, age, date_of_birth, location')
        .eq('admission_id', admissionId)
        .limit(1)
        .single();
      if (!data || error) {
        setUserProfile(prev => ({
          ...prev,
          email: String(admissionId),
          name: prev.name || '',
          school: prev.school || 'MESKAYE HIZUNAN MEDHANE ALEM MONASTERY SCHOOL',
          grade: prev.grade,
          age: prev.age,
          location: 'Addis Abeba, Ethiopia',
        }));
        return;
      }
      let age = 0;
      try {
        const student = data as StudentRow;
        const parsedAge = Number.parseInt(String(student.age ?? ''));
        if (Number.isFinite(parsedAge) && parsedAge > 0) {
          age = parsedAge;
        } else if (student.date_of_birth) {
          const dob = new Date(student.date_of_birth);
          const diff = Date.now() - dob.getTime();
          age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
        }
      } catch (err) {
        console.warn('Failed to determine age from DB', err);
      }

      setUserProfile(prev => ({
        ...prev,
        email: String(admissionId),
        name: String(([data.first_name, data.last_name].filter(Boolean).join(' ') || prev.name)),
        school: String(data.school || 'MESKAYE HIZUNAN MEDHANE ALEM MONASTERY SCHOOL'),
        grade: data.section ? `Section ${data.section}` : prev.grade,
        age: age > 0 ? age : prev.age,
        location: 'Addis Abeba, Ethiopia',
      }));
    };
    init();
  }, [navigate]);

  const handleLogout = async () => {
    localStorage.removeItem('student_admission_id');
    localStorage.removeItem('student_first_name');
    localStorage.removeItem('is_admin');
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleStartExam = (exam: Exam) => {
    (async () => {
      try {
        const admissionId = String(localStorage.getItem('student_admission_id') || '').trim();
        if (!admissionId) {
          navigate('/login');
          return;
        }

        let allowRetake = false;
        try {
          const { data: retakeData } = await supabase
            .from('exam_retake')
            .select('enabled')
            .eq('exam_id', exam.id)
            .eq('admission_id', admissionId)
            .limit(1)
            .single<{ enabled: boolean }>();
          if (retakeData && retakeData.enabled) allowRetake = true;
        } catch (err) { console.warn('Retake status check failed', err); }

        const { data: incData, error: incError } = await supabase
          .from('exam_incidents')
          .select('reason')
          .eq('exam_id', exam.id)
          .eq('admission_id', admissionId)
          .limit(1)
          .single();
        if (!allowRetake && !incError && incData) {
          navigate(`/exam/${exam.id}/cancelled`, { state: { reason: incData.reason || 'previous dismissal' } });
          return;
        }

        const { data: subData, error: subError } = await supabase
          .from('exam_submissions')
          .select('id')
          .eq('exam_id', exam.id)
          .eq('admission_id', admissionId)
          .limit(1)
          .single();
        if (!allowRetake && !subError && subData) {
          navigate(`/exam/${exam.id}/submitted`, { state: { exam } });
          return;
        }

        navigate(`/exam/${exam.id}`, { state: { exam } });
      } catch (err) {
        console.error('Failed to verify exam state before starting:', err);
        navigate(`/exam/${exam.id}`, { state: { exam } });
      }
    })();
  };

  const getStatusIcon = (status: Exam['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'in-progress':
        return <AlertCircle className="h-4 w-4" />;
      case 'not-ready':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Exam['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-accent/20 text-accent hover:bg-accent/30 border border-accent/30';
      case 'in-progress':
        return 'bg-destructive/20 text-destructive hover:bg-destructive/30 border border-destructive/30';
      case 'not-ready':
        return 'bg-gray-500/20 text-gray-300 hover:bg-gray-500/30 border border-gray-500/30';
      default:
        return 'bg-accent/20 text-accent hover:bg-accent/30 border border-accent/30';
    }
  };

  const renderExamCards = (examList: Exam[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {examList.map((exam, index) => {
        const statusStr = String(exam.status || '').toLowerCase();
        const isBlurred = statusStr.includes('blur') || exam.id === 'elyonaris' || exam.title.toLowerCase().includes('mathematics') || exam.title.toLowerCase().includes('physics');
        const isUnavailable = statusStr.includes('unavail') || statusStr === 'unavailable';
        return (
          <Card key={exam.id} className={`relative hover:shadow-2xl hover:scale-105 transition-all duration-300 border-accent/30 shadow-lg bg-gradient-to-br from-[#0f4a0f] to-[#0a2e0a] animate-fade-in ${isBlurred ? 'blur-sm' : ''}`} style={{ animationDelay: `${0.5 + index * 0.1}s` }}>
            {isBlurred && (
              <div className="absolute inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center text-sm font-semibold text-[#0a2e0a] z-10 pointer-events-auto">
                {isUnavailable ? 'Unavailable — temporarily closed' : 'Blurred — admin only'}
              </div>
            )}
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <CardTitle className="text-lg text-[#d4f4dd]">{exam.title}</CardTitle>
                <Badge className={getStatusColor(exam.status)}>
                  {getStatusIcon(exam.status)}
                  <span className="ml-1 capitalize text-xs">
                    {exam.status === 'in-progress' 
                      ? 'In Progress' 
                      : exam.status === 'not-ready' 
                      ? 'Not Ready' 
                      : exam.status}
                  </span>
                </Badge>
              </div>
              <CardDescription className="text-[#d4f4dd]/70">{exam.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-[#d4f4dd]/80 mb-4">
                <Clock className="h-4 w-4 text-accent" />
                <span className="font-medium">{exam.duration} minutes</span>
              </div>
                {/* Show only the exam description, not password info */}
                <div className="text-sm text-muted-foreground mb-2">{exam.description || ''}</div>
              <Button
                className={`w-full ${isUnavailable ? 'opacity-70 cursor-not-allowed' : 'bg-gradient-to-r from-[#a3e635] to-[#84cc16] hover:from-[#bef264] hover:to-[#a3e635] hover:shadow-accent/50 transition-all'} text-[#0a2e0a] font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                onClick={() => handleStartExam(exam)}
                disabled={exam.status === 'completed' || exam.status === 'not-ready' || isBlurred || isUnavailable}
              >
                {exam.status === 'completed'
                  ? '✓ Completed'
                  : exam.status === 'not-ready'
                  ? 'Not Ready'
                  : isUnavailable
                  ? 'Unavailable'
                  : 'Start Exam'}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9f0] via-[#e8f5e8] to-[#f0f9f0] relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-200/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-100/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="border-b border-accent/30 bg-gradient-to-br from-[#0f4a0f] to-[#0a2e0a] backdrop-blur-xl sticky top-0 z-10 shadow-2xl relative">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="relative">
              <div className="absolute inset-0 bg-accent/30 rounded-lg blur-xl animate-glow"></div>
              <div className="relative bg-gradient-to-br from-background to-accent/10 p-2 rounded-lg shadow-2xl border-2 border-accent/30 w-12 h-12 flex items-center justify-center">
                <img 
                  src={logo} 
                  alt="ELYONARIS TEST V1.0" 
                  className="h-8 w-8 object-contain" 
                />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-[#d4f4dd] via-accent to-[#d4f4dd] bg-clip-text text-transparent">ELYONARIS TEST V1.0</h1>
              <p className="text-sm text-[#d4f4dd]/80">Secure Exam Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <a
              href="/ContactUs"
              className="text-sm text-[#d4f4dd] hover:text-accent font-semibold px-4 py-2 rounded transition-colors duration-200 border border-accent/30 hover:bg-accent/20 bg-[#0a2e0a]/50 backdrop-blur-sm h-10 flex items-center"
            >
              Contact Us
            </a>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="h-10 px-4 border-accent/30 text-[#d4f4dd] hover:bg-accent/20 hover:border-accent bg-[#0a2e0a]/50 backdrop-blur-sm flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* User Profile Section */}
        <Card className="mb-8 border-accent/30 shadow-2xl bg-gradient-to-br from-[#0f4a0f] to-[#0a2e0a] backdrop-blur-xl animate-scale-in">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-accent/30 shadow-lg animate-fade-in overflow-hidden">
                <AvatarImage src={logo} alt="ELYONARIS TEST V1.0" className="object-cover" />
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-accent to-accent/80 text-[#0a2e0a]">{userProfile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div>
                  <h2 className="text-3xl font-bold text-[#d4f4dd] mb-1">{userProfile.name}</h2>
                  <p className="text-[#d4f4dd]/60">{userProfile.email}</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2 bg-[#0a2e0a]/50 p-3 rounded-lg border border-accent/20 backdrop-blur-sm">
                    <School className="h-5 w-5 text-accent" />
                    <div>
                      <p className="text-xs text-[#d4f4dd]/60">School</p>
                      <p className="text-sm font-semibold text-[#d4f4dd]">{userProfile.school}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-[#0a2e0a]/50 p-3 rounded-lg border border-accent/20 backdrop-blur-sm">
                    <GraduationCap className="h-5 w-5 text-accent" />
                    <div>
                      <p className="text-xs text-[#d4f4dd]/60">Grade</p>
                      <p className="text-sm font-semibold text-[#d4f4dd]">{userProfile.grade}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-[#0a2e0a]/50 p-3 rounded-lg border border-accent/20 backdrop-blur-sm">
                    <Calendar className="h-5 w-5 text-accent" />
                    <div>
                      <p className="text-xs text-[#d4f4dd]/60">Age</p>
                      <p className="text-sm font-semibold text-[#d4f4dd]">{userProfile.age} years</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-[#0a2e0a]/50 p-3 rounded-lg border border-accent/20 backdrop-blur-sm">
                    <MapPin className="h-5 w-5 text-accent" />
                    <div>
                      <p className="text-xs text-[#d4f4dd]/60">Location</p>
                      <p className="text-sm font-semibold text-[#d4f4dd]">{userProfile.location}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* My Subjects Section */}
        <div className="mb-6 bg-gradient-to-br from-[#0f4a0f] to-[#0a2e0a] rounded-lg p-6 shadow-lg animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-3xl font-bold text-[#d4f4dd] mb-2">My Subjects</h2>
          <p className="text-[#d4f4dd]/80">Select an exam to begin</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-lg mb-12">
          {renderExamCards(exams)}
        </div>

        {/* Security Guidelines */}
        <Card className="mt-8 border-accent/30 shadow-2xl bg-gradient-to-br from-[#0f4a0f] to-[#0a2e0a] backdrop-blur-xl animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-[#d4f4dd]">
              <div className="h-8 w-8 bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center shadow-lg">
                <AlertCircle className="h-5 w-5 text-[#0a2e0a]" />
              </div>
              Exam Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid md:grid-cols-2 gap-3 text-sm">
              <li className="flex items-start gap-3 bg-[#0a2e0a]/50 p-3 rounded-lg border border-accent/20 backdrop-blur-sm">
                <span className="text-accent mt-0.5 text-lg">•</span>
                <span className="text-[#d4f4dd]">Copy and paste functions are disabled during exams</span>
              </li>
              <li className="flex items-start gap-3 bg-[#0a2e0a]/50 p-3 rounded-lg border border-accent/20 backdrop-blur-sm">
                <span className="text-accent mt-0.5 text-lg">•</span>
                <span className="text-[#d4f4dd]">Screenshot attempts are monitored (limit: 3 attempts)</span>
              </li>
              <li className="flex items-start gap-3 bg-[#0a2e0a]/50 p-3 rounded-lg border border-accent/20 backdrop-blur-sm">
                <span className="text-accent mt-0.5 text-lg">•</span>
                <span className="text-[#d4f4dd]">Switching tabs or windows will be logged</span>
              </li>
              <li className="flex items-start gap-3 bg-[#0a2e0a]/50 p-3 rounded-lg border border-accent/20 backdrop-blur-sm">
                <span className="text-accent mt-0.5 text-lg">•</span>
                <span className="text-[#d4f4dd]">Fullscreen mode is required during the exam</span>
              </li>
              <li className="flex items-start gap-3 bg-[#0a2e0a]/50 p-3 rounded-lg border border-accent/20 backdrop-blur-sm">
                <span className="text-accent mt-0.5 text-lg">•</span>
                <span className="text-[#d4f4dd]">AI detection tools are active</span>
              </li>
              <li className="flex items-start gap-3 bg-[#0a2e0a]/50 p-3 rounded-lg border border-accent/20 backdrop-blur-sm">
                <span className="text-accent mt-0.5 text-lg">•</span>
                <span className="text-[#d4f4dd]">Violations are recorded and reported</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>

      {/* Results Modal removed as requested */}
    </div>
  );
};

export default Dashboard;
