import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, UserPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import logo from '@/assets/elyon-logo.png';


const Registration = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
<<<<<<< HEAD
<<<<<<< HEAD
  const [phoneNumber, setPhoneNumber] = useState('');
=======
  const [email, setEmail] = useState('');
>>>>>>> 2baa9b4adeb7dc3265ee54dbd332be1c7f2f0631
=======
  const [email, setEmail] = useState('');
>>>>>>> eb1952c30efaaf4746d887d80d31bdb1ab685cb6
  const [section, setSection] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [sex, setSex] = useState('');
  const [age, setAge] = useState('');
  const [stream, setStream] = useState('');
<<<<<<< HEAD
<<<<<<< HEAD
  const [password, setPassword] = useState('');
=======
  const SCHOOL_NAME = 'MESKAYE HIZUNAN MEDHANE ALEM MONASTERY SCHOOL';
>>>>>>> 2baa9b4adeb7dc3265ee54dbd332be1c7f2f0631
=======
  const SCHOOL_NAME = 'MESKAYE HIZUNAN MEDHANE ALEM MONASTERY SCHOOL';
>>>>>>> eb1952c30efaaf4746d887d80d31bdb1ab685cb6
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [admissionId, setAdmissionId] = useState('');
  const [countdown, setCountdown] = useState(20);

  useEffect(() => {
    if (!processing) return;
    setCountdown(20);
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          navigate('/login');
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [processing, navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
<<<<<<< HEAD
<<<<<<< HEAD
    if (loading) return;
    
    // Basic validation
    const fn = String(firstName || '').trim();
    const ln = String(lastName || '').trim();
    const sec = String(section || '').trim();
    const rn = String(rollNumber || '').trim();
    const strm = String(stream || '').trim();
    if (!fn.trim() || !ln.trim() || !sec.trim() || !rn.trim() || !sex || !age || !strm || !password) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (parseInt(age) < 1 || parseInt(age) > 120) {
      toast.error('Please enter a valid age');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    
    try {
=======
=======
>>>>>>> eb1952c30efaaf4746d887d80d31bdb1ab685cb6
    setLoading(true);
    try {
      const fn = String(firstName || '').trim();
      const ln = String(lastName || '').trim();
      const sec = String(section || '').trim();
      const rn = String(rollNumber || '').trim();
      const strm = String(stream || '').trim();
      if (!fn || !ln || !sec || !rn || !sex || !age || !strm) {
        toast.error('Complete all required fields');
        return;
      }
      if (!/^[A-Za-z0-9-]{1,10}$/.test(sec)) {
        toast.error('Enter a valid section');
        return;
      }
      if (!/^\d{1,6}$/.test(rn)) {
        toast.error('Enter a valid roll number');
        return;
      }
      if (!['Male', 'Female'].includes(sex)) {
        toast.error('Please select a valid sex');
        return;
      }
      if (!/^\d{1,2}$/.test(age) || parseInt(age) < 10 || parseInt(age) > 25) {
        toast.error('Enter a valid age between 10 and 25');
        return;
      }
      if (!['Natural', 'Social'].includes(strm)) {
        toast.error('Select a valid stream (Natural or Social)');
        return;
      }

<<<<<<< HEAD
>>>>>>> 2baa9b4adeb7dc3265ee54dbd332be1c7f2f0631
=======
>>>>>>> eb1952c30efaaf4746d887d80d31bdb1ab685cb6
      // Proceed without Supabase auth; store admission locally

      const gen = () => {
        let n = '7' + Math.floor(Math.random() * 1_000_000).toString().padStart(6, '0');
        if (n === '7975035') {
          n = '7' + Math.floor(Math.random() * 1_000_000).toString().padStart(6, '0');
        }
        return n;
      };
      const id = gen();
<<<<<<< HEAD
<<<<<<< HEAD
      // First create the user with a default password (admission ID as password)
      const defaultPassword = id; // Using admission ID as default password
=======
>>>>>>> 2baa9b4adeb7dc3265ee54dbd332be1c7f2f0631
=======
>>>>>>> eb1952c30efaaf4746d887d80d31bdb1ab685cb6
      const { error } = await supabase.from('students_1').upsert([
        {
          admission_id: id,
          first_name: fn,
          last_name: ln,
          full_name: `${fn} ${ln}`,
          section: sec,
          roll_number: rn,
<<<<<<< HEAD
<<<<<<< HEAD
          phone_number: phoneNumber,
=======
          school: SCHOOL_NAME,
>>>>>>> 2baa9b4adeb7dc3265ee54dbd332be1c7f2f0631
=======
          school: SCHOOL_NAME,
>>>>>>> eb1952c30efaaf4746d887d80d31bdb1ab685cb6
          sex: sex,
          age: parseInt(age),
          stream: strm,
          location: 'Addis Abeba, Ethiopia',
<<<<<<< HEAD
<<<<<<< HEAD
          password: password,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ], { onConflict: 'admission_id' });
      
=======
        },
      ], { onConflict: 'admission_id' });
>>>>>>> 2baa9b4adeb7dc3265ee54dbd332be1c7f2f0631
=======
        },
      ], { onConflict: 'admission_id' });
>>>>>>> eb1952c30efaaf4746d887d80d31bdb1ab685cb6
      if (error) {
        toast.error(`Failed to save registration: ${error.message}`);
        return;
      }
<<<<<<< HEAD
<<<<<<< HEAD
      
      // Show the admission ID popup
      setAdmissionId(id);
      setProcessing(true);
      
      // Also show a success message
      toast.success('Registration successful! Please note your Admission ID.');
=======
=======
>>>>>>> eb1952c30efaaf4746d887d80d31bdb1ab685cb6
      localStorage.setItem('student_admission_id', id);
      localStorage.setItem('student_first_name', fn);
      setAdmissionId(id);
      toast.success('Registration complete');
      setProcessing(true);
<<<<<<< HEAD
>>>>>>> 2baa9b4adeb7dc3265ee54dbd332be1c7f2f0631
=======
>>>>>>> eb1952c30efaaf4746d887d80d31bdb1ab685cb6
    } finally {
      setLoading(false);
    }
  };

  return (
<<<<<<< HEAD
<<<<<<< HEAD
    <div className="min-h-screen bg-gradient-to-br from-[#0a2e0a] via-[#0d3d0d] to-[#0a2e0a] flex flex-col items-center justify-center p-4 relative overflow-y-auto">
=======
    <div className="min-h-screen bg-gradient-to-br from-[#0a2e0a] via-[#0d3d0d] to-[#0a2e0a] flex flex-col p-4 relative overflow-hidden">
>>>>>>> 2baa9b4adeb7dc3265ee54dbd332be1c7f2f0631
=======
    <div className="min-h-screen bg-gradient-to-br from-[#0a2e0a] via-[#0d3d0d] to-[#0a2e0a] flex flex-col items-center justify-center p-4 relative overflow-y-auto">
>>>>>>> eb1952c30efaaf4746d887d80d31bdb1ab685cb6
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
<<<<<<< HEAD
<<<<<<< HEAD
      <div className="relative z-10 mb-6 w-full max-w-4xl mx-auto px-4 animate-fade-in-up">
=======
      <div className="relative z-10 mb-6 animate-fade-in-up">
>>>>>>> 2baa9b4adeb7dc3265ee54dbd332be1c7f2f0631
=======
      <div className="relative z-10 mb-6 w-full max-w-4xl mx-auto px-4 animate-fade-in-up">
>>>>>>> eb1952c30efaaf4746d887d80d31bdb1ab685cb6
        <div className="text-center">
          <div className="flex justify-center mb-4 animate-float">
            <div className="relative">
              <div className="absolute inset-0 bg-accent/30 rounded-3xl blur-xl animate-glow"></div>
              <div className="relative bg-gradient-to-br from-background to-accent/10 p-4 rounded-3xl shadow-2xl border-2 border-accent/30">

<<<<<<< HEAD
<<<<<<< HEAD
                <img src={logo} alt="ELYONARIS TEST V1.0" className="h-20 w-20 mx-auto" />
=======
                <img src={logo} alt="Elyon Logo" className="h-16 w-auto" />

                <img src={logo} alt="ELYONARIS TEST V1.0" className="h-20 w-20" />
>>>>>>> 2baa9b4adeb7dc3265ee54dbd332be1c7f2f0631
=======
                <img src={logo} alt="ELYONARIS TEST V1.0" className="h-20 w-20 mx-auto" />
>>>>>>> eb1952c30efaaf4746d887d80d31bdb1ab685cb6
              </div>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#d4f4dd] via-accent to-[#d4f4dd] bg-clip-text text-transparent mb-2 animate-fade-in">
            ELYONARIS TEST V1.0
          </h1>
          <p className="text-[#d4f4dd]/80 flex items-center justify-center gap-2 text-lg animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Shield className="h-5 w-5 text-accent animate-pulse" />
            Secure Exam Platform
          </p>
          <div className="mt-6 mb-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-2xl font-bold text-accent mb-2">Welcome to the Exam!</h2>
            <p className="text-muted-foreground">Please register below to begin your secure exam experience.</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
<<<<<<< HEAD
<<<<<<< HEAD
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 mb-8">
        <Card className="border-accent/30 shadow-2xl bg-gradient-to-br from-[#0f4a0f] to-[#0a2e0a] backdrop-blur-xl animate-scale-in w-full">
          <CardHeader className="space-y-1 pb-6 px-6 pt-8">
=======
      <div className="flex-1 relative z-10 max-w-7xl mx-auto w-full">
        <Card className="border-accent/30 shadow-2xl bg-gradient-to-br from-[#0f4a0f] to-[#0a2e0a] backdrop-blur-xl animate-scale-in relative">
          <CardHeader className="space-y-1 pb-6">
>>>>>>> 2baa9b4adeb7dc3265ee54dbd332be1c7f2f0631
=======
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 mb-8">
        <Card className="border-accent/30 shadow-2xl bg-gradient-to-br from-[#0f4a0f] to-[#0a2e0a] backdrop-blur-xl animate-scale-in w-full">
          <CardHeader className="space-y-1 pb-6 px-6 pt-8">
>>>>>>> eb1952c30efaaf4746d887d80d31bdb1ab685cb6
            <CardTitle className="text-3xl text-[#d4f4dd] font-bold flex items-center gap-2">
              <UserPlus className="h-8 w-8 text-accent" />
              Registration
            </CardTitle>
            <CardDescription className="text-[#d4f4dd]/60 text-base">
              Complete your registration to access the exam platform
            </CardDescription>
          </CardHeader>
<<<<<<< HEAD
<<<<<<< HEAD
          <CardContent className="px-6 pb-8">
            <div className="mb-6 p-4 bg-gradient-to-r from-accent/10 to-primary/10 rounded-xl border border-accent/20 backdrop-blur-sm animate-fade-in">
=======
          <CardContent>
            <div className="mb-4 p-4 bg-gradient-to-r from-accent/10 to-primary/10 rounded-xl border border-accent/20 backdrop-blur-sm animate-fade-in">
>>>>>>> 2baa9b4adeb7dc3265ee54dbd332be1c7f2f0631
=======
          <CardContent className="px-6 pb-8">
            <div className="mb-6 p-4 bg-gradient-to-r from-accent/10 to-primary/10 rounded-xl border border-accent/20 backdrop-blur-sm animate-fade-in">
>>>>>>> eb1952c30efaaf4746d887d80d31bdb1ab685cb6
              <div className="flex items-start gap-3">
                <div className="bg-accent/20 p-2 rounded-lg">
                  <Shield className="h-5 w-5 text-accent" />
                </div>
                <div className="text-sm text-[#d4f4dd]/80">
                  <p className="font-bold text-[#d4f4dd] mb-1 text-base">Registration Information</p>
                  <p className="leading-relaxed">Please fill out the registration form below. Once completed, you can proceed to login with your credentials.</p>
                </div>
              </div>
            </div>

<<<<<<< HEAD
<<<<<<< HEAD
            <form onSubmit={handleRegister} className="space-y-5 animate-fade-in max-w-2xl mx-auto" style={{ animationDelay: '0.3s' }}>
=======
            <form onSubmit={handleRegister} className="space-y-5 animate-fade-in" style={{ animationDelay: '0.3s' }}>
>>>>>>> 2baa9b4adeb7dc3265ee54dbd332be1c7f2f0631
=======
            <form onSubmit={handleRegister} className="space-y-5 animate-fade-in max-w-2xl mx-auto" style={{ animationDelay: '0.3s' }}>
>>>>>>> eb1952c30efaaf4746d887d80d31bdb1ab685cb6
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-[#d4f4dd] font-medium">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
<<<<<<< HEAD
<<<<<<< HEAD
                  placeholder="e.g. Abebe"
=======
                  placeholder="e.g. Jane"
>>>>>>> 2baa9b4adeb7dc3265ee54dbd332be1c7f2f0631
=======
                  placeholder="e.g. Abebe"
>>>>>>> eb1952c30efaaf4746d887d80d31bdb1ab685cb6
                  className="bg-white/90"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-[#d4f4dd] font-medium">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
<<<<<<< HEAD
<<<<<<< HEAD
                  placeholder="e.g. Kebede"
=======
                  placeholder="e.g. Doe"
>>>>>>> 2baa9b4adeb7dc3265ee54dbd332be1c7f2f0631
=======
                  placeholder="e.g. Kebede"
>>>>>>> eb1952c30efaaf4746d887d80d31bdb1ab685cb6
                  className="bg-white/90"
                />
              </div>
              <div className="space-y-2">
<<<<<<< HEAD
<<<<<<< HEAD
                <Label htmlFor="phoneNumber" className="text-[#d4f4dd] font-medium">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. +251 9XXXXXXXX"
                  className="bg-white/90"
                  required
                />
              </div>
=======
=======
>>>>>>> eb1952c30efaaf4746d887d80d31bdb1ab685cb6
                <Label htmlFor="email" className="text-[#d4f4dd] font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
<<<<<<< HEAD
                  placeholder="e.g. jane@example.com"
=======
                  placeholder="e.g. contact.elyonaris@gmail.com"
>>>>>>> eb1952c30efaaf4746d887d80d31bdb1ab685cb6
                  className="bg-white/90"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="school" className="text-[#d4f4dd] font-medium">School</Label>
                <Input id="school" value={SCHOOL_NAME} readOnly disabled className="bg-white/60" />
              </div>
<<<<<<< HEAD
>>>>>>> 2baa9b4adeb7dc3265ee54dbd332be1c7f2f0631
=======
>>>>>>> eb1952c30efaaf4746d887d80d31bdb1ab685cb6
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="section" className="text-[#d4f4dd] font-medium">Section</Label>
                  <Input
                    id="section"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
<<<<<<< HEAD
<<<<<<< HEAD
                    placeholder="e.g. A/B/C/D"
=======
                    placeholder="e.g. A"
>>>>>>> 2baa9b4adeb7dc3265ee54dbd332be1c7f2f0631
=======
                    placeholder="e.g. A/B/C/D"
>>>>>>> eb1952c30efaaf4746d887d80d31bdb1ab685cb6
                    className="bg-white/90"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rollNumber" className="text-[#d4f4dd] font-medium">Roll Number</Label>
                  <Input
                    id="rollNumber"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
<<<<<<< HEAD
<<<<<<< HEAD
                    placeholder="e.g. 1-60"
=======
                    placeholder="e.g. 25"
>>>>>>> 2baa9b4adeb7dc3265ee54dbd332be1c7f2f0631
=======
                    placeholder="e.g. 1-60"
>>>>>>> eb1952c30efaaf4746d887d80d31bdb1ab685cb6
                    className="bg-white/90"
                  />
                </div>
              </div>
<<<<<<< HEAD
<<<<<<< HEAD
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
=======
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
>>>>>>> 2baa9b4adeb7dc3265ee54dbd332be1c7f2f0631
=======
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
>>>>>>> eb1952c30efaaf4746d887d80d31bdb1ab685cb6
                <div className="space-y-2">
                  <Label htmlFor="sex" className="text-[#d4f4dd] font-medium">Sex</Label>
                  <select
                    id="sex"
                    value={sex}
                    onChange={(e) => setSex(e.target.value)}
                    className="w-full bg-white/90 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                    required
                  >
                    <option value="">Select Sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-[#d4f4dd] font-medium">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 16"
                    className="bg-white/90"
<<<<<<< HEAD
<<<<<<< HEAD
                    min="1"
                    max="120"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#d4f4dd] font-medium">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password (min 6 characters)"
                    className="w-full bg-white/90 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                    minLength={6}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stream" className="text-[#d4f4dd] font-medium">Stream</Label>
                <select
                  id="stream"
                  value={stream}
                  onChange={(e) => setStream(e.target.value)}
                  className="w-full bg-white/90 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                >
                  <option value="">Select Stream</option>
                  <option value="Natural">Natural</option>
                  <option value="Social">Social</option>
                </select>
              </div>
=======
=======
>>>>>>> eb1952c30efaaf4746d887d80d31bdb1ab685cb6
                    min="10"
                    max="25"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stream" className="text-[#d4f4dd] font-medium">Stream</Label>
                  <select
                    id="stream"
                    value={stream}
                    onChange={(e) => setStream(e.target.value)}
                    className="w-full bg-white/90 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                    required
                  >
                    <option value="">Select Stream</option>
                    <option value="Natural">Natural</option>
                    <option value="Social">Social</option>
                  </select>
                </div>
              </div>
<<<<<<< HEAD
>>>>>>> 2baa9b4adeb7dc3265ee54dbd332be1c7f2f0631
=======
>>>>>>> eb1952c30efaaf4746d887d80d31bdb1ab685cb6
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#a3e635] to-[#84cc16] hover:from-[#bef264] hover:to-[#a3e635] text-[#0a2e0a] font-bold text-lg h-14 shadow-lg hover:shadow-accent/50 transition-all duration-300 hover:scale-105 relative overflow-hidden group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                <span className="flex items-center justify-center gap-2">
                  <span>{loading ? 'Registering…' : 'Create Account'}</span>
                </span>
              </Button>
            </form>

<<<<<<< HEAD
<<<<<<< HEAD
            <div className="mt-6 animate-fade-in text-center" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center justify-center gap-4">
                <span className="text-[#d4f4dd]/70">Already registered?</span>
                <a href="/login" className="text-accent hover:underline font-medium">Sign in</a>
                {admissionId && (
                  <Button 
                    onClick={() => {
                      navigator.clipboard.writeText(admissionId);
                      toast.success('Admission ID copied to clipboard!');
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white text-sm py-1 px-3 rounded-md ml-2"
                  >
                    Copy ID
                  </Button>
                )}
              </div>
              {admissionId && (
                <div className="mt-2 text-sm text-green-400 font-mono bg-green-900/30 py-1 px-2 rounded">
                  ID: {admissionId}
                </div>
              )}
=======
            <div className="mt-6 animate-fade-in text-center text-[#d4f4dd]/70" style={{ animationDelay: '0.4s' }}>
              Already registered? <a href="/login" className="text-accent underline">Sign in</a>
>>>>>>> 2baa9b4adeb7dc3265ee54dbd332be1c7f2f0631
=======
            <div className="mt-6 animate-fade-in text-center text-[#d4f4dd]/70" style={{ animationDelay: '0.4s' }}>
              Already registered? <a href="/login" className="text-accent underline">Sign in</a>
>>>>>>> eb1952c30efaaf4746d887d80d31bdb1ab685cb6
            </div>
          </CardContent>
        </Card>
        {processing && (
          <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60">
            <div className="w-[420px] max-w-[90%] rounded-2xl border-2 border-accent/40 bg-gradient-to-br from-[#0f4a0f] to-[#0a2e0a] p-8 text-center shadow-2xl">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/20">
                <Loader2 className="h-8 w-8 text-accent animate-spin" />
              </div>
              <p className="text-[#d4f4dd] text-xl font-semibold">Registration Complete</p>
              <p className="text-[#d4f4dd]/70 mt-1">Your Admission ID</p>
              <p className="text-[#d4f4dd] text-3xl font-bold tracking-widest mt-1">{admissionId}</p>
              <p className="text-[#d4f4dd]/70 mt-2">Use this ID and your First Name to sign in</p>
              <p className="text-[#d4f4dd]/60 mt-1">Redirect to login in {countdown} seconds?</p>
              <div className="mt-6 h-2 w-full rounded-full bg-accent/20 overflow-hidden">
                <div className="h-full bg-accent animate-[progress_20s_linear_forwards]" style={{ width: '0%', animationDuration: '20s' }}></div>
              </div>
              <div className="mt-6 flex items-center justify-center gap-3">
                <Button onClick={() => navigate('/login')} className="bg-accent text-[#0a2e0a] font-semibold">Go to Login Now</Button>
<<<<<<< HEAD
<<<<<<< HEAD
                <Button 
                  onClick={() => {
                    navigator.clipboard.writeText(admissionId);
                    toast.success('Admission ID copied to clipboard!');
                  }}
                  className="bg-white text-green-700 hover:bg-gray-100 font-semibold border-0 shadow-md"
                >
                  Copy ID
                </Button>
=======
                <Button variant="outline" className="border-accent/40 text-[#d4f4dd]" onClick={() => setProcessing(false)}>Stay Here</Button>
>>>>>>> 2baa9b4adeb7dc3265ee54dbd332be1c7f2f0631
=======
                <Button variant="outline" className="border-accent/40 text-[#d4f4dd]" onClick={() => setProcessing(false)}>Stay Here</Button>
>>>>>>> eb1952c30efaaf4746d887d80d31bdb1ab685cb6
              </div>
            </div>
          </div>
        )}

<<<<<<< HEAD
<<<<<<< HEAD
        <p className="text-center mt-8 text-[#d4f4dd]/50 text-sm animate-fade-in w-full" style={{ animationDelay: '0.5s' }}>
=======
        <p className="text-center mt-6 text-[#d4f4dd]/50 text-sm animate-fade-in" style={{ animationDelay: '0.5s' }}>
>>>>>>> 2baa9b4adeb7dc3265ee54dbd332be1c7f2f0631
=======
        <p className="text-center mt-8 text-[#d4f4dd]/50 text-sm animate-fade-in w-full" style={{ animationDelay: '0.5s' }}>
>>>>>>> eb1952c30efaaf4746d887d80d31bdb1ab685cb6
          Protected by ELYONARIS TEST V1.0 Security System
        </p>
      </div>
    </div>
  );
};

export default Registration;

