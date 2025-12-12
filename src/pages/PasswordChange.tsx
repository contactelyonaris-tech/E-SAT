import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const PasswordChange = () => {
  const navigate = useNavigate();
  const [admissionId, setAdmissionId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    // Prevent using the default password
    if (newPassword === '1234') {
      toast.error('Please choose a different password');
      return;
    }
    
    setLoading(true);
    try {
      if (!admissionId) {
        toast.error('Please enter your admission ID');
        return;
      }
      
      // Update password in Supabase (the trigger will handle hashing)
      const { error } = await supabase
        .from('students_1')
        .update({ 
          password: newPassword,
          updated_at: new Date().toISOString()
        })
        .eq('admission_id', admissionId);

      if (error) {
        console.error('Error updating password in Supabase:', error);
        toast.error('Failed to update password in database');
        return;
      }

      // Also update local storage for backward compatibility
      localStorage.setItem(`user_password_${admissionId}`, newPassword);
      localStorage.setItem(`password_changed_${admissionId}`, 'true');
      
      setPasswordChanged(true);
      toast.success('Password changed successfully');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  if (passwordChanged) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold">Password Changed!</CardTitle>
            <CardDescription>
              Your password has been updated successfully. Redirecting to login...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 mr-2" />
            <span className="text-2xl font-bold">Change Password</span>
          </div>
          <CardDescription className="text-center">
            Please enter your admission ID and set a new password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admissionId">Admission ID</Label>
              <Input
                id="admissionId"
                type="text"
                value={admissionId}
                onChange={(e) => setAdmissionId(e.target.value)}
                required
                placeholder="Enter your admission ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm new password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Changing Password...' : 'Change Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordChange;
