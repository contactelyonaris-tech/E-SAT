import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

const ForgotId = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [admissionId, setAdmissionId] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setAdmissionId(null);
    try {
      const cleanName = fullName.trim().toLowerCase();
      const { data, error: dbError } = await supabase
        .from('students_1')
        .select('admission_id, full_name')
        .ilike('full_name', cleanName)
        .limit(1)
        .single();
      if (!data) {
        setError("No matching record found. Please check your details.");
      } else {
        setAdmissionId(String(data.admission_id));
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
    setLoading(false);
  };

  return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a2e0a] via-[#0d3d0d] to-[#0a2e0a] p-4">
      <div className="bg-card rounded-lg shadow-2xl p-8 max-w-lg w-full text-center">
  <Button variant="outline" className="mb-4" onClick={() => navigate('/')}>Return to Homepage</Button>
        <img src={logo} alt="ELYONARIS Logo" className="h-16 w-16 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Recover Admission ID</h1>
        <p className="text-muted-foreground mb-6">Enter your full name to recover your Admission ID.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            className="w-full px-4 py-2 rounded border focus:outline-none focus:ring focus:ring-primary"
            required
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Searching..." : "Recover ID"}
          </Button>
        </form>
        {admissionId && (
          <div className="mt-6 text-green-600 font-semibold text-lg">
            Your Admission ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{admissionId}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotId;
