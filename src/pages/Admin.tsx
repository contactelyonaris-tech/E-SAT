import { useEffect, useMemo, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableCaption, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// Slider removed: difficulty has been removed from question metadata
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Loader2, Pencil, Eye, MoreVertical, Filter, RefreshCcw, ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Line, LineChart, ResponsiveContainer } from 'recharts';
import type { CheckedState } from '@radix-ui/react-checkbox';

interface StudentRow {
  admission_id: string;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  section?: string | null;
  roll_number?: string | null;
  stream?: string | null;
  school?: string | null;
  age?: number | null;
}

interface AdminQuestion {
  id: string;
  question_text: string;
  options?: string[] | null;
  correct_answer?: string | number | null;
  order_index: number;
  value?: number | null;
}

interface SubmissionRow {
  id?: string;
  exam_id: string;
  admission_id: string;
  score: number;
  total: number;
  answers?: any;
  created_at: string;
  updated_at?: string;
  status?: string;
  submitted_at?: string;
}

interface IncidentRow {
  reason: string;
  created_at: string;
}

interface AnalyticsSubmission {
  score: number;
  total: number;
  created_at: string;
  answers?: unknown;
}

interface FiltersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionFilter: string | null;
  setSectionFilter: (v: string | null) => void;
  retakeFilter: 'all' | 'enabled' | 'disabled';
  setRetakeFilter: (v: 'all' | 'enabled' | 'disabled') => void;
}

const FiltersDialog = ({ open, onOpenChange, sectionFilter, setSectionFilter, retakeFilter, setRetakeFilter }: FiltersDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filters</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <Input placeholder="Section" value={sectionFilter || ''} onChange={(e) => setSectionFilter(e.target.value ? e.target.value : null)} />
          </div>
          <div className="space-y-2">
            <select className="w-full border rounded px-3 py-2" value={retakeFilter} onChange={(e) => setRetakeFilter(e.target.value as 'all'|'enabled'|'disabled')}>
              <option value="all">All</option>
              <option value="enabled">Retake Enabled</option>
              <option value="disabled">Retake Disabled</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => { setSectionFilter(null); setRetakeFilter('all'); }}>Clear</Button>
            <Button onClick={() => onOpenChange(false)}>Apply</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Admin = () => {
  // Edit question modal state (must be inside component for fetchQuestions access)
  const [editQOpen, setEditQOpen] = useState(false);
  const [editQ, setEditQ] = useState<AdminQuestion | null>(null);
  const [editQText, setEditQText] = useState('');
  const [editQOptions, setEditQOptions] = useState<string[]>([]);
  const [editQAnswer, setEditQAnswer] = useState('');
  const [editQValue, setEditQValue] = useState('1');

  // Open edit modal and populate fields
  const openEditQ = (q: AdminQuestion) => {
    setEditQ(q);
    setEditQText(q.question_text || '');
    setEditQOptions(Array.isArray(q.options) ? [...q.options] : []);
    setEditQAnswer(q.correct_answer ? String(q.correct_answer) : '');
    setEditQValue(q.value != null ? String(q.value) : '1');
    setEditQOpen(true);
  };

  // Save edits to Supabase
  const saveEditQ = async () => {
    if (!editQ) return;
    const stem = editQText.trim();
    if (!stem) { toast.error('Enter question text'); return; }
    const opts = editQOptions.map(s => s.trim()).filter(Boolean);
    if ((opts.length > 0) && !opts.includes(editQAnswer)) {
      toast.error('Correct answer must be one of the options');
      return;
    }
    const val = Number(editQValue);
    const { error } = await supabase.from('exam_questions').update({
      question_text: stem,
      options: opts.length ? opts : null,
      correct_answer: editQAnswer,
      value: Number.isFinite(val) ? val : null
    }).eq('id', editQ.id);
    if (error) toast.error('Failed to update question');
    else {
      toast.success('Question updated');
      setEditQOpen(false);
      setEditQ(null);
      await fetchQuestions();
    }
  };
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [examIdInput, setExamIdInput] = useState('elyonaris');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [retakeEnabledMap, setRetakeEnabledMap] = useState<Record<string, boolean>>({});
  const [sectionFilter, setSectionFilter] = useState<string | null>(null);
  const [retakeFilter, setRetakeFilter] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [newQText, setNewQText] = useState('');
  const [newQTextHTML, setNewQTextHTML] = useState('');
  const [optionInputs, setOptionInputs] = useState<string[]>(['', '', '']);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);
  const [newQOptions, setNewQOptions] = useState('');
  const [newQAnswer, setNewQAnswer] = useState('');
  const [newQType, setNewQType] = useState<'mcq'|'tf'|'short'|'fib'|'media'>('mcq');
  const [newQMedia, setNewQMedia] = useState('');
  const [newQCategory, setNewQCategory] = useState('');
  const [newQGrade, setNewQGrade] = useState('');
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [newQValue, setNewQValue] = useState<string>('1');
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [analytics, setAnalytics] = useState<{avg:number; passRate:number; completionRate:number; itemStats: Record<string, Record<string, number>>; lastRefreshed:number; gradeTrend:number[]; passTrend:number[]; completionTrend:number[]}>({avg:0, passRate:0, completionRate:0, itemStats:{}, lastRefreshed: 0, gradeTrend: [], passTrend: [], completionTrend: []});
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [quickViewId, setQuickViewId] = useState<string | null>(null);
  const [quickViewLoading, setQuickViewLoading] = useState(false);
  const [quickViewData, setQuickViewData] = useState<{submissions: SubmissionRow[]; incidents: IncidentRow[]}>({ submissions: [], incidents: [] });
  const [filterOpen, setFilterOpen] = useState(false);
  // Exam settings
  const [examTitle, setExamTitle] = useState('');
  const [examDuration, setExamDuration] = useState<number | ''>(''); // minutes
  const [examCode, setExamCode] = useState('');
  const [examBlurred, setExamBlurred] = useState(false);
  const [examAvailable, setExamAvailable] = useState(true);
  const [loadingExamSettings, setLoadingExamSettings] = useState(false);
  const [examsList, setExamsList] = useState<{id:string; title?:string|null}[]>([]);
  const [newExamOpen, setNewExamOpen] = useState(false);
  const [newExamId, setNewExamId] = useState('');
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamDuration, setNewExamDuration] = useState<number | ''>('');
  const [newExamCode, setNewExamCode] = useState('');
  const [newExamBlurred, setNewExamBlurred] = useState(false);
  const [newExamAvailable, setNewExamAvailable] = useState(true);
  const [lastDbResponse, setLastDbResponse] = useState<unknown>(null);
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  // ERGO admin view: incidents fetched from DB
  const [ergoIncidents, setErgoIncidents] = useState<{ id: string; exam_id: string; admission_id: string; reason: string; created_at: string }[]>([]);
  const [ergoLoading, setErgoLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const q = supabase.from('students_1').select('admission_id, first_name, last_name, full_name, section, roll_number, stream, school, age');
      const { data, error } = await q;
      if (error) {
        console.error('Failed to load students', error);
        toast.error('Could not load students');
        return;
      }
      setStudents((data as StudentRow[]) || []);
    } catch (err) {
      console.error(err);
      toast.error('Unexpected error while loading students');
    } finally {
      setLoading(false);
    }
  };

  const fetchRetakeStatuses = useCallback(async () => {
    const { data } = await supabase
      .from('exam_retake')
      .select('admission_id,enabled')
      .eq('exam_id', examIdInput || 'elyonaris');
    const map: Record<string, boolean> = {};
    const list = (data || []) as { admission_id: string; enabled: boolean }[];
    list.forEach((r) => { map[r.admission_id] = !!r.enabled; });
    setRetakeEnabledMap(map);
  }, [examIdInput]);

  useEffect(() => {
    fetchRetakeStatuses();
  }, [examIdInput, students.length, fetchRetakeStatuses]);

  // Fetch exam settings whenever examId changes
  useEffect(() => {
    fetchExamSettings();
    fetchExamsList();
  }, [examIdInput]);

  // Fetch recent incidents (ERGO reports) for admin review
  const fetchErgoIncidents = async () => {
    setErgoLoading(true);
    try {
      const q = supabase.from('exam_incidents').select('id,exam_id,admission_id,reason,created_at').order('created_at', { ascending: false }).limit(100);
      // If an examIdInput is selected, filter by it to narrow results
      if (examIdInput) q.eq('exam_id', examIdInput);
      const { data, error } = await q;
      if (error) {
        console.warn('Failed to load incidents', error);
        setErgoIncidents([]);
      } else {
        setErgoIncidents((data || []) as { id: string; exam_id: string; admission_id: string; reason: string; created_at: string }[]);
      }
    } catch (e) {
      console.warn('Failed to fetch ergo incidents', e);
      setErgoIncidents([]);
    } finally {
      setErgoLoading(false);
    }
  };

  useEffect(() => {
    // initial load and periodic refresh
    fetchErgoIncidents();
    const iv = setInterval(() => fetchErgoIncidents(), 30_000);
    return () => clearInterval(iv);
  }, [examIdInput]);

  const fetchExamsList = async () => {
    try {
      const resp = await supabase.from('exams').select('id,title').order('id', { ascending: true });
      setLastDbResponse(resp);
      setExamsList((resp.data || []) as {id:string; title?:string|null}[]);
    } catch (e) { console.warn('Failed to fetch exams list', e); setLastDbResponse({ error: e }); }
  };

  const fetchExamSettings = async () => {
    setLoadingExamSettings(true);
    try {
      const exam = examIdInput || 'elyonaris';
      const { data, error } = await supabase.from('exams').select('*').eq('id', exam).limit(1).single();
      if (error || !data) {
        // No settings yet - initialize defaults
        setExamTitle('');
        setExamDuration('');
        setExamCode('');
        setExamBlurred(false);
        setExamAvailable(true);
        return;
      }
      // map existing columns: id, title, duration, description, status
      setExamTitle(String(data.title || ''));
      {
        type ExamSettingsRow = { duration?: number | null };
        const row = data as ExamSettingsRow;
        const durRaw = row.duration;
        const durVal = typeof durRaw === 'number' && Number.isFinite(durRaw) ? durRaw : '';
        setExamDuration(durVal);
      }
      setExamCode(data.description || '');
      const status = (data.status || '').toString().toLowerCase();
      setExamAvailable(status !== 'unavailable');
      setExamBlurred(status.includes('blur'));
    } catch (e) {
      console.warn('Failed to load exam settings', e);
    } finally {
      setLoadingExamSettings(false);
    }
  };

  const saveExamSettings = async () => {
    try {
      const exam = (examIdInput || '').trim();
      if (!exam) { toast.error('Select an exam id'); return; }
      const status = examAvailable ? (examBlurred ? 'available_blurred' : 'available') : 'unavailable';
      const payload: { id: string; exam_id: string; title: string | null; duration: number | null; description: string | null; status: string } = {
        id: exam,
        exam_id: exam,
        title: String(examTitle || '').trim() || null,
        duration: typeof examDuration === 'number' && Number.isFinite(examDuration) ? examDuration : null,
        description: String(examCode || '').trim() || null,
        status,
      };
      const resp = await supabase.from('exams').upsert([payload], { onConflict: 'id' }).select();
      setLastDbResponse(resp);
      if (resp.error) {
        console.error('Failed to save exam settings', resp.error, resp.data);
        toast.error(`Failed to save exam settings: ${resp.error.message || JSON.stringify(resp.error)}`);
      } else if (!resp.data || (Array.isArray(resp.data) && resp.data.length === 0)) {
        // No error but no rows returned — often caused by RLS/permissions or silent reject
        console.warn('Upsert returned no rows', resp);
        toast.error('Exam save reported success but no rows were returned — check DB permissions or RLS policies (see console)');
      } else {
        console.debug('Upsert succeeded', resp.data);
        toast.success('Exam settings saved');
  await fetchExamSettings();
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to save exam settings');
    }
  };

  const createNewExam = async () => {
    if (!newExamId || !/^[a-zA-Z0-9-_]{1,64}$/.test(newExamId)) { toast.error('Enter a valid exam id (alphanumeric, - or _)'); return; }
    try {
      // Map to existing schema: id, title, duration, description, status
      const status = newExamAvailable ? (newExamBlurred ? 'available_blurred' : 'available') : 'unavailable';
      const payload: { id: string; exam_id: string; title: string | null; duration: number | null; description: string | null; status: string } = {
        id: String(newExamId).trim(),
        exam_id: String(newExamId).trim(),
        title: String(newExamTitle || '').trim() || null,
        duration: typeof newExamDuration === 'number' && Number.isFinite(newExamDuration) ? newExamDuration : null,
        description: String(newExamCode || '').trim() || null,
        status,
      };
      // Try insert and request returned rows. If insert returns no rows, fallback to upsert.
      const insertResp = await supabase.from('exams').insert([payload]).select();
      setLastDbResponse(insertResp);
      if (insertResp.error) {
        console.warn('Insert failed, trying upsert', insertResp.error);
        const upResp = await supabase.from('exams').upsert([payload], { onConflict: 'id' }).select();
        setLastDbResponse(upResp);
        if (upResp.error) { console.error('Failed to create exam', upResp.error, upResp.data); toast.error(`Failed to create exam: ${upResp.error.message || JSON.stringify(upResp.error)}`); return; }
        if (!upResp.data || (Array.isArray(upResp.data) && upResp.data.length === 0)) { console.warn('Upsert returned no rows', upResp); toast.error('Exam create reported success but no rows were returned — check DB permissions or RLS policies (see console)'); return; }
      } else {
        if (!insertResp.data || (Array.isArray(insertResp.data) && insertResp.data.length === 0)) {
          console.warn('Insert returned no rows', insertResp);
          toast.error('Exam create reported success but no rows were returned — check DB permissions or RLS policies (see console)');
          return;
        }
      }
      setLastDbResponse({ success: true, payload, inserted: insertResp.data });
      toast.success('Exam created');
      setNewExamOpen(false);
      setNewExamId(''); setNewExamTitle(''); setNewExamDuration(''); setNewExamCode(''); setNewExamBlurred(false); setNewExamAvailable(true);
      await fetchExamsList();
  setExamIdInput(payload.id);
    } catch (e) {
      console.error('Failed to create exam', e);
      toast.error('Failed to create exam');
    }
  };

  const filtered = useMemo(() => {
    const arr = students.filter(s => {
      const qv = query.toLowerCase().trim();
      const matchesQuery = !qv || String(s.admission_id || '').toLowerCase().includes(qv)
        || String(s.full_name || (s.first_name || '') + ' ' + (s.last_name || '')).toLowerCase().includes(qv)
        || String(s.roll_number || '').toLowerCase().includes(qv);
      const matchesSection = !sectionFilter || String(s.section || '').toLowerCase() === String(sectionFilter || '').toLowerCase();
      const enabled = !!retakeEnabledMap[s.admission_id];
      const matchesRetake = retakeFilter === 'all' ? true : retakeFilter === 'enabled' ? enabled : !enabled;
      return matchesQuery && matchesSection && matchesRetake;
    });
    return arr;
  }, [students, query, sectionFilter, retakeFilter, retakeEnabledMap]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = useMemo(() => filtered.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize), [filtered, page]);

  const enableRetake = async (admissionId: string, examId: string) => {
    setProcessingId(admissionId);
    try {
      const payload = {
        exam_id: examId,
        admission_id: admissionId,
        enabled: true,
        created_at: new Date().toISOString(),
      };
      let upsertFailed = false;
      try {
        const { error } = await supabase
          .from('exam_retake')
          .upsert([payload], { onConflict: 'exam_id,admission_id' });
        if (error) upsertFailed = true;
      } catch {
        upsertFailed = true;
      }
      if (upsertFailed) {
        const { error } = await supabase.from('exam_retake').insert([payload]);
        if (error) {
          console.error('Failed to enable retake', error);
          toast.error('Failed to enable retake');
          return;
        }
      }
      toast.success(`Retake enabled for ${admissionId} (exam ${examId})`);
      setRetakeEnabledMap(prev => ({ ...prev, [admissionId]: true }));
    } catch (err) {
      console.error(err);
      toast.error('Unexpected error while enabling retake');
    } finally {
      setProcessingId(null);
    }
  };

  const flagIncident = async (admissionId: string, examId: string, reason = 'Flagged by admin - detected cheating') => {
    setProcessingId(admissionId);
    try {
      const { error: insertError } = await supabase.from('exam_incidents').insert([
        {
          exam_id: examId,
          admission_id: admissionId,
          reason,
          created_at: new Date().toISOString(),
        },
      ]);
      if (insertError) {
        console.error('Failed to flag incident', insertError);
        toast.error('Failed to flag incident');
      } else {
        toast.success(`Incident recorded for ${admissionId} (exam ${examId})`);

        // Ensure retake is disabled for this admission (conservative)
        try {
          await supabase.from('exam_retake').delete().eq('exam_id', examId).eq('admission_id', admissionId);
        } catch (e) { void e; }
        setRetakeEnabledMap(prev => ({ ...prev, [admissionId]: false }));

        // If there's an existing submission, mark score as 0 (admin-flagged)
        try {
          await supabase.from('exam_submissions').update({ score: 0 }).eq('exam_id', examId).eq('admission_id', admissionId);
        } catch (e) { void e; }
      }
    } catch (err) {
      console.error(err);
      toast.error('Unexpected error while recording incident');
    } finally {
      setProcessingId(null);
    }
  };

  const deleteUser = async (admissionId: string) => {
    if (!confirm(`Delete user ${admissionId} and all their exam records? This cannot be undone.`)) return;
    setProcessingId(admissionId);
    try {
      // First remove dependent rows to satisfy foreign key constraints
      try {
        const { data: ds, error: e1 } = await supabase.from('exam_submissions').delete().select('*').eq('admission_id', admissionId);
        if (e1) {
          console.error('Failed to delete exam_submissions for', admissionId, e1);
          toast.error(`Failed to delete exam_submissions: ${e1.message || JSON.stringify(e1)}`);
          // stop to avoid partial state
          return;
        }
        console.debug('Deleted exam_submissions rows:', ds);
      } catch (e) { console.error('Error deleting exam_submissions', e); toast.error('Failed to delete exam_submissions (see console)'); return; }

      try {
        const { data: di, error: e2 } = await supabase.from('exam_incidents').delete().select('*').eq('admission_id', admissionId);
        if (e2) {
          console.error('Failed to delete exam_incidents for', admissionId, e2);
          toast.error(`Failed to delete exam_incidents: ${e2.message || JSON.stringify(e2)}`);
          return;
        }
        console.debug('Deleted exam_incidents rows:', di);
      } catch (e) { console.error('Error deleting exam_incidents', e); toast.error('Failed to delete exam_incidents (see console)'); return; }

      try {
        const { data: dr, error: e3 } = await supabase.from('exam_retake').delete().select('*').eq('admission_id', admissionId);
        if (e3) {
          console.error('Failed to delete exam_retake for', admissionId, e3);
          toast.error(`Failed to delete exam_retake: ${e3.message || JSON.stringify(e3)}`);
          return;
        }
        console.debug('Deleted exam_retake rows:', dr);
      } catch (e) { console.error('Error deleting exam_retake', e); toast.error('Failed to delete exam_retake (see console)'); return; }

      // After dependents removed, delete the student record
      const { data: delData, error: err1 } = await supabase.from('students_1').delete().select('*').eq('admission_id', admissionId);
      if (err1) {
        console.error('Failed to delete student', err1);
        toast.error(`Failed to delete user: ${err1.message || err1}`);
        return;
      }
      if (!delData || (Array.isArray(delData) && delData.length === 0)) {
        console.warn('No student row deleted for', admissionId);
        toast.warning(`No student record found for ${admissionId}`);
      } else {
        console.debug('Deleted student rows:', delData);
      }

      // Refresh students list in UI
      try { await fetchStudents(); } catch (e) { console.warn('Failed to refresh students after delete', e); }

      // Update local state
      setStudents(prev => prev.filter(s => s.admission_id !== admissionId));
      setRetakeEnabledMap(prev => {
        const next = { ...prev };
        delete next[admissionId];
        return next;
      });

      toast.success(`Deleted user ${admissionId}`);
    } catch (err) {
      console.error('Failed to delete user', err);
      toast.error('Failed to delete user');
    } finally {
      setProcessingId(null);
    }
  };

  const disableRetake = async (admissionId: string, examId: string) => {
    setProcessingId(admissionId);
    try {
      const { error } = await supabase
        .from('exam_retake')
        .delete()
        .eq('exam_id', examId)
        .eq('admission_id', admissionId);
      if (error) {
        console.error('Failed to disable retake', error);
        toast.error('Failed to disable retake');
      } else {
        toast.success(`Retake disabled for ${admissionId} (exam ${examId})`);
        setRetakeEnabledMap(prev => ({ ...prev, [admissionId]: false }));
      }
    } catch (err) {
      console.error(err);
      toast.error('Unexpected error while disabling retake');
    } finally {
      setProcessingId(null);
    }
  };

  const clearIncident = async (admissionId: string, examId: string) => {
    setProcessingId(admissionId);
    try {
      const { error } = await supabase
        .from('exam_incidents')
        .delete()
        .eq('exam_id', examId)
        .eq('admission_id', admissionId);
      if (error) {
        console.error('Failed to clear incident', error);
        toast.error('Failed to clear incident');
      } else {
        toast.success(`Incident cleared for ${admissionId} (exam ${examId})`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Unexpected error while clearing incident');
    } finally {
      setProcessingId(null);
    }
  };

  const viewSubmission = async (admissionId: string, examId: string) => {
    setProcessingId(admissionId);
    try {
      const { data, error } = await supabase
        .from('exam_submissions')
        .select('score,total,created_at')
        .eq('exam_id', examId)
        .eq('admission_id', admissionId)
        .limit(1)
        .single();
      if (error || !data) {
        toast.error('No submission found');
      } else {
        const date = new Date(data.created_at);
        const formattedDate = date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        toast.success(`Score: ${data.score}/${data.total} — ${formattedDate}`);
      }
    } catch (err) {
      toast.error('Failed to load submission');
    } finally {
      setProcessingId(null);
    }
  };

  const openQuickView = async (admissionId: string) => {
    setQuickViewId(admissionId);
    setQuickViewOpen(true);
    setQuickViewLoading(true);
    try {
      const exam = examIdInput || 'elyonaris';
      
      // First try to get the submission with the most specific query
      const { data: subs, error: subError } = await supabase
        .from('exam_submissions')
        .select('*')
        .eq('exam_id', exam)
        .eq('admission_id', admissionId)
        .order('created_at', { ascending: false });

      // If no results, try a more permissive query
      let submissions: any[] = [];
      if (subs && subs.length > 0) {
        submissions = subs;
      } else {
        // Try without exam_id filter
        const { data: allSubs } = await supabase
          .from('exam_submissions')
          .select('*')
          .eq('admission_id', admissionId)
          .order('created_at', { ascending: false });
        if (allSubs) submissions = allSubs;
      }

      // Process submissions to ensure they have the correct status
      const processedSubmissions = submissions.map(sub => ({
        ...sub,
        // If status is not set, determine it based on the presence of answers
        status: sub.status || (sub.answers ? 'completed' : 'incomplete')
      }));

      // Get incidents
      const { data: incs } = await supabase
        .from('exam_incidents')
        .select('*')
        .eq('exam_id', exam)
        .eq('admission_id', admissionId)
        .order('created_at', { ascending: false });

      // Log for debugging
      console.log('Processed Submissions:', processedSubmissions);
      console.log('Incidents:', incs);
      
      setQuickViewData({ 
        submissions: processedSubmissions as SubmissionRow[], 
        incidents: (incs || []) as IncidentRow[] 
      });
    } catch (error) {
      console.error('Error in openQuickView:', error);
      toast.error('Failed to load submission data');
    } finally {
      setQuickViewLoading(false);
    }
  };

  const fetchQuestions = async () => {
    setLoadingQuestions(true);
    const { data } = await supabase
      .from('exam_questions')
      .select('*')
      .eq('exam_id', examIdInput || 'elyonaris')
      .order('order_index', { ascending: true });
    setQuestions((data || []) as AdminQuestion[]);
    setLoadingQuestions(false);
  };

  const moveUp = async (index: number) => {
    if (index <= 0) return;
    const a = questions[index - 1];
    const b = questions[index];
    const tmp = a.order_index;
    await supabase.from('exam_questions').update({ order_index: b.order_index }).eq('id', a.id);
    await supabase.from('exam_questions').update({ order_index: tmp }).eq('id', b.id);
    await fetchQuestions();
  };

  const moveDown = async (index: number) => {
    if (index >= questions.length - 1) return;
    const a = questions[index];
    const b = questions[index + 1];
    const tmp = a.order_index;
    await supabase.from('exam_questions').update({ order_index: b.order_index }).eq('id', a.id);
    await supabase.from('exam_questions').update({ order_index: tmp }).eq('id', b.id);
    await fetchQuestions();
  };

  const fetchAnalytics = async () => {
    const exam = examIdInput || 'elyonaris';
    const { data: subs } = await supabase
      .from('exam_submissions')
      .select('score,total,answers,created_at')
      .eq('exam_id', exam)
      .order('created_at', { ascending: true });
    const { count: studentCount } = await supabase
      .from('students_1')
      .select('*', { count: 'exact', head: true });
    const arr: AnalyticsSubmission[] = (subs || []) as AnalyticsSubmission[];
    const avg = arr.length ? arr.reduce((a, s) => a + (s.total ? s.score / s.total : 0), 0) / arr.length : 0;
    const passRate = arr.length ? arr.filter((s) => s.total && s.score >= Math.round(0.5 * s.total)).length / arr.length : 0;
    const completionRate = (arr.length || 0) / (studentCount || 1);
    const itemStats: Record<string, Record<string, number>> = {};
    arr.forEach((s) => {
      let ansObj: Record<string, unknown> | null = null;
      try { ansObj = typeof s.answers === 'string' ? (JSON.parse(s.answers as string) as Record<string, unknown>) : ((s.answers as Record<string, unknown>) || null); } catch (e) { void e; }
      if (!ansObj) return;
      const keys = Object.keys(ansObj as Record<string, unknown>);
      keys.forEach((qid) => {
        const raw = (ansObj as Record<string, unknown>)[qid];
        const chosen = String(raw ?? '');
        itemStats[qid] = itemStats[qid] || {};
        itemStats[qid][chosen] = (itemStats[qid][chosen] || 0) + 1;
      });
    });
    const gradeTrend = arr.map((s) => (s.total ? Math.round((s.score / s.total) * 100) : 0));
    const passTrend = arr.map((s) => (s.total && s.score >= Math.round(0.5 * s.total) ? 100 : 0));
    const completionTrend = arr.map((_, i: number) => Math.round((((i + 1) / (studentCount || 1)) * 100)));
    setAnalytics({ avg: Math.round(avg * 100) / 100, passRate: Math.round(passRate * 100) / 100, completionRate: Math.round(completionRate * 100) / 100, itemStats, lastRefreshed: Date.now(), gradeTrend, passTrend, completionTrend });
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Admin — Registered Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 items-center mb-4">
              <Input placeholder="Search by ID, name, or roll" value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} />
              <Input placeholder="Exam id (default: elyonaris)" value={examIdInput} onChange={e => { setExamIdInput(e.target.value); setPage(1); }} className="w-56" />
              <Button variant="outline" onClick={fetchStudents} className="ml-auto"><RefreshCcw className="h-4 w-4 mr-2" />Refresh</Button>
              <Button variant="secondary" onClick={() => setFilterOpen(true)}><Filter className="h-4 w-4 mr-2" />Filters</Button>
            </div>

            {loading ? (
              <div className="flex items-center gap-2"><Loader2 className="animate-spin" /> Loading students…</div>
            ) : (
              <div className="space-y-3">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8">
                        <Checkbox
                          checked={paged.length > 0 && paged.every(s => selectedRows.has(s.admission_id))}
                          onCheckedChange={(v: CheckedState) => {
                            const next = new Set(selectedRows);
                            if (v) paged.forEach(s => next.add(s.admission_id)); else paged.forEach(s => next.delete(s.admission_id));
                            setSelectedRows(next);
                          }}
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Admission ID</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Roll</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paged.map(s => (
                      <TableRow key={s.admission_id} className="hover:bg-muted/50">
                        <TableCell className="w-8">
                          <Checkbox checked={selectedRows.has(s.admission_id)} onCheckedChange={(v: CheckedState) => {
                            const next = new Set(selectedRows);
                            if (v) next.add(s.admission_id); else next.delete(s.admission_id);
                            setSelectedRows(next);
                          }} />
                        </TableCell>
                        <TableCell>
                          <button className="text-sm font-semibold hover:underline" onClick={() => openQuickView(s.admission_id)}>
                            {s.full_name && s.full_name.trim() ? s.full_name : ((s.first_name && s.first_name.trim()) || (s.last_name && s.last_name.trim()) ? `${s.first_name || ''} ${s.last_name || ''}`.trim() : 'No Name')}
                          </button>
                          <div className="text-xs text-muted-foreground">{retakeEnabledMap[s.admission_id] ? 'Retake Enabled' : 'Retake Disabled'}</div>
                        </TableCell>
                        <TableCell className="font-mono">{s.admission_id}</TableCell>
                        <TableCell>{s.section && s.section.trim() ? s.section : 'No Section'}</TableCell>
                        <TableCell>{s.roll_number && s.roll_number.trim() ? s.roll_number : 'No Class'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => openQuickView(s.admission_id)}><Eye className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={async () => {
                              const next = prompt('Edit full name', s.full_name || `${s.first_name || ''} ${s.last_name || ''}`) || '';
                              const parts = next.trim().split(' ');
                              const first = parts[0] || '';
                              const last = parts.slice(1).join(' ');
                              const { error } = await supabase
                                .from('students_1')
                                .update({ full_name: next.trim(), first_name: first, last_name: last })
                                .eq('admission_id', s.admission_id);
                              if (error) toast.error('Failed to update profile'); else toast.success('Profile updated');
                            }}><Pencil className="h-4 w-4" /></Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => enableRetake(s.admission_id, examIdInput || 'elyonaris')}>Enable Retake</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => disableRetake(s.admission_id, examIdInput || 'elyonaris')}>Disable Retake</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => viewSubmission(s.admission_id, examIdInput || 'elyonaris')}>View Submission</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => deleteUser(s.admission_id)} className="text-destructive focus:text-destructive">Delete User</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => flagIncident(s.admission_id, examIdInput || 'elyonaris')} className="text-destructive focus:text-destructive"><Flag className="h-4 w-4 mr-2" />Flag Cheating</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableCaption>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">Page {page} of {totalPages}</div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}><ChevronLeft className="h-4 w-4 mr-1" />Prev</Button>
                        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Next<ChevronRight className="h-4 w-4 ml-1" /></Button>
                      </div>
                    </div>
                  </TableCaption>
                </Table>
                {filtered.length === 0 && <div className="text-sm text-muted-foreground">No students found</div>}
              </div>
            )}

            {selectedRows.size > 0 && (
              <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-card border rounded-xl shadow-lg px-4 py-3 flex items-center gap-3">
                <div className="text-sm">Selected {selectedRows.size}</div>
                <Button size="sm" onClick={async () => {
                  const exam = examIdInput || 'elyonaris';
                  await Promise.all(Array.from(selectedRows).map(adm => supabase.from('exam_retake').upsert([{ exam_id: exam, admission_id: adm, enabled: true, created_at: new Date().toISOString() }], { onConflict: 'exam_id,admission_id' })));
                  toast.success(`Bulk enabled retake (${selectedRows.size})`);
                  setRetakeEnabledMap(prev => {
                    const next = { ...prev };
                    Array.from(selectedRows).forEach(id => { next[id] = true; });
                    return next;
                  });
                }}>Bulk Enable Retake ({selectedRows.size})</Button>
                <Button size="sm" variant="outline" onClick={async () => {
                  const exam = examIdInput || 'elyonaris';
                  await Promise.all(Array.from(selectedRows).map(adm => supabase.from('exam_retake').delete().eq('exam_id', exam).eq('admission_id', adm)));
                  toast.success(`Bulk disabled retake (${selectedRows.size})`);
                  setRetakeEnabledMap(prev => {
                    const next = { ...prev };
                    Array.from(selectedRows).forEach(id => { next[id] = false; });
                    return next;
                  });
                }}>Bulk Disable Retake</Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedRows(new Set())}>Clear</Button>
              </div>
            )}

            <Sheet open={quickViewOpen} onOpenChange={setQuickViewOpen}>
              <SheetContent side="right">
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">{quickViewId}</div>
                  {quickViewLoading ? (
                    <div className="flex items-center gap-2"><Loader2 className="animate-spin" /> Loading…</div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <div className="font-semibold mb-2">Quiz Attempts</div>
                        <div className="space-y-3 max-h-64 overflow-auto pr-2">
                          {quickViewData.submissions.length === 0 ? (
                            <div className="text-sm text-muted-foreground">No submission attempts found</div>
                          ) : (
                            quickViewData.submissions.map((sub, idx) => (
                              <div key={sub.id || idx} className="border rounded-lg p-3 bg-muted/5">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-medium">
                                      {sub.status === 'completed' ? 'Completed' : 'Incomplete'}
                                      {sub.status === 'completed' && (
                                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">
                                          {sub.score}/{sub.total}
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {new Date(sub.created_at).toLocaleString()}
                                    </div>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {sub.exam_id}
                                  </div>
                                </div>
                                {sub.answers && typeof sub.answers === 'object' && (
                                  <div className="mt-2 text-xs text-muted-foreground">
                                    <div className="font-medium">Details:</div>
                                    <pre className="mt-1 p-2 bg-muted/20 rounded text-xs overflow-x-auto">
                                      {JSON.stringify(sub.answers, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold mb-2">Incident Log</div>
                        <div className="space-y-2 max-h-48 overflow-auto">
                          {quickViewData.incidents.length === 0 && <div className="text-sm text-muted-foreground">No incidents</div>}
                          {quickViewData.incidents.map((r, idx) => (
                            <div key={idx} className="text-sm">{new Date(r.created_at).toLocaleString()} — {r.reason}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            <FiltersDialog
              open={filterOpen}
              onOpenChange={setFilterOpen}
              sectionFilter={sectionFilter}
              setSectionFilter={setSectionFilter}
              retakeFilter={retakeFilter}
              setRetakeFilter={setRetakeFilter}
            />
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>ERGO — Exam Monitor (Admin View)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-muted-foreground">Recent suspicious activity reported by ERGO. Showing latest {ergoIncidents.length} events.</div>
              <div className="flex items-center gap-2">
                <Input placeholder="Filter exam id" value={examIdInput} onChange={e => setExamIdInput(e.target.value)} className="w-48" />
                <Button size="sm" variant="outline" onClick={fetchErgoIncidents}><RefreshCcw className="h-4 w-4 mr-2" />Refresh</Button>
              </div>
            </div>

            {ergoLoading ? (
              <div className="text-sm text-muted-foreground">Loading incidents…</div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-auto">
                {ergoIncidents.length === 0 && <div className="text-sm text-muted-foreground">No incidents found.</div>}
                {ergoIncidents.map((r) => (
                  <div key={r.id || `${r.exam_id}-${r.admission_id}-${r.created_at}`} className="p-2 bg-muted/30 rounded">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-semibold">{r.exam_id || '—'} — {r.admission_id || 'Unknown'}</div>
                        <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</div>
                      </div>
                      <div className="text-sm font-mono text-destructive">{r.reason}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>🛠️ Admin Dashboard — Content & Quiz Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="font-semibold">Create / Edit Question</div>
                <div className="min-h-24 border rounded px-3 py-2 bg-background" contentEditable onInput={(e) => {
                  const html = (e.currentTarget as HTMLDivElement).innerHTML;
                  setNewQTextHTML(html);
                  const text = (e.currentTarget as HTMLDivElement).innerText;
                  setNewQText(text);
                }} />
                <select className="w-full border rounded px-3 py-2" value={newQType} onChange={e => { setNewQType(e.target.value as 'mcq'|'tf'|'short'|'fib'|'media'); setCorrectIndex(null); }}>
                  <option value="mcq">Multiple Choice</option>
                  <option value="tf">True/False</option>
                  <option value="short">Short Answer</option>
                  <option value="fib">Fill-in-the-Blank</option>
                  <option value="media">Image/Video-based</option>
                </select>
                {(newQType === 'mcq' || newQType === 'media') && (
                  <div className="space-y-2">
                    <RadioGroup value={correctIndex != null ? String(correctIndex) : ''} onValueChange={(v) => setCorrectIndex(Number(v))}>
                      {optionInputs.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <RadioGroupItem value={String(idx)} />
                          <Input placeholder={`Option ${String.fromCharCode(65 + idx)}`} value={opt} onChange={e => {
                            const next = [...optionInputs];
                            next[idx] = e.target.value;
                            setOptionInputs(next);
                            if (correctIndex === idx) setNewQAnswer(e.target.value);
                          }} />
                        </div>
                      ))}
                    </RadioGroup>
                    <Button variant="outline" size="sm" onClick={() => setOptionInputs(prev => [...prev, ''])}>Add Option</Button>
                  </div>
                )}
                {newQType === 'tf' && (
                  <RadioGroup onValueChange={(v) => setNewQAnswer(v)}>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="True" />
                      <span>True</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="False" />
                      <span>False</span>
                    </div>
                  </RadioGroup>
                )}
                {(newQType === 'short' || newQType === 'fib') && (
                  <Input placeholder="Correct answer" value={newQAnswer} onChange={e => setNewQAnswer(e.target.value)} />
                )}
                {newQType === 'media' && (
                  <Input placeholder="Media URL (for Image/Video)" value={newQMedia} onChange={e => setNewQMedia(e.target.value)} />
                )}
                <div className="grid grid-cols-3 gap-2">
                  <Input placeholder="Subject" value={newQCategory} onChange={e => setNewQCategory(e.target.value)} />
                  <Input placeholder="Question Bank" value={newQGrade} onChange={e => setNewQGrade(e.target.value)} />
                  <Input type="number" min="0" step="any" placeholder="Marks (e.g. 1 or 0.5)" value={newQValue} onChange={e => setNewQValue(e.target.value)} />
                </div>
                <Button onClick={async () => {
                  const stem = String(newQText || '').trim();
                  if (!stem) { toast.error('Enter question text'); return; }
                  const opts = (() => {
                    if (newQType === 'mcq' || newQType === 'media') {
                      const list = optionInputs.map(s => s.trim()).filter(Boolean);
                      if (list.length < 2) { toast.error('Enter at least two options'); return null; }
                      if (correctIndex == null || !list[correctIndex]) { toast.error('Select a valid correct option'); return null; }
                      setNewQAnswer(list[correctIndex]);
                      return list;
                    }
                    if (newQType === 'tf') {
                      if (!['True','False'].includes(String(newQAnswer))) { toast.error('Choose True or False'); return null; }
                      return ['True', 'False'];
                    }
                    return [];
                  })();
                  if (opts === null) return;
                  if (newQType === 'short' || newQType === 'fib') {
                    if (!String(newQAnswer || '').trim()) { toast.error('Enter the correct answer'); return; }
                  }
                  const tags = [newQCategory && `[category:${newQCategory}]`, newQGrade && `[bank:${newQGrade}]`, newQType === 'media' && newQMedia && `[media:${newQMedia}]`].filter(Boolean).join(' ');
                  const taggedText = `${tags} ${stem}`.trim();
                  const nextOrder = (questions.length ? Math.max(...questions.map(q => Number(q.order_index) || 0)) + 1 : 1);
                  const val = Number(newQValue);
                  const { error } = await supabase.from('exam_questions').insert([
                    { exam_id: examIdInput || 'elyonaris', question_text: taggedText, options: opts.length ? opts : null, correct_answer: String(newQAnswer || '').trim() || null, order_index: nextOrder, value: Number.isFinite(val) ? val : null }
                  ]);
                  if (error) toast.error(`Failed to add question: ${error.message}`); else {
                    toast.success('Question added');
                    setNewQText('');
                    setNewQTextHTML('');
                    setOptionInputs(['', '', '']);
                    setCorrectIndex(null);
                    setNewQAnswer('');
                    setNewQMedia('');
                    setNewQValue('1');
                  }
                  await fetchQuestions();
                }} className="bg-accent">Add Question</Button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">Question Bank ({examIdInput || 'elyonaris'})</div>
                  <Button size="sm" variant="outline" onClick={fetchQuestions}>{loadingQuestions ? 'Loading…' : 'Refresh'}</Button>
                </div>
                <div className="mt-4 p-4 border-2 border-accent/30 rounded-lg bg-background shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-base font-bold text-accent">Exam Settings</div>
                    <div className="text-xs text-muted-foreground">Exam: <span className="font-mono">{examIdInput || 'elyonaris'}</span></div>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <select value={examIdInput} onChange={(e) => setExamIdInput(e.target.value)} className="w-48 border border-accent/40 rounded px-2 py-1 focus:outline-accent">
                        <option value="">Select Exam</option>
                        {examsList.map(x => <option key={x.id} value={x.id}>{x.id}{x.title ? ` — ${x.title}` : ''}</option>)}
                      </select>
                      <Button size="sm" onClick={() => setNewExamOpen(true)}>New Exam</Button>
                      <Button size="sm" variant="outline" onClick={fetchExamsList}>Refresh List</Button>
                      <Button size="sm" variant="ghost" onClick={() => setDiagnosticsOpen(v => !v)}>{diagnosticsOpen ? 'Hide' : 'Show'} Diagnostics</Button>
                    </div>
                    <div className="flex flex-col gap-3">
                      <label className="font-semibold text-sm text-accent">Exam Title</label>
                      <Input placeholder="Exam Title" value={examTitle} onChange={e => setExamTitle(e.target.value)} className="border border-accent/40" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="font-semibold text-sm text-accent">Duration (minutes)</label>
                        <Input placeholder="Duration (minutes)" type="number" value={examDuration} onChange={e => setExamDuration(e.target.value === '' ? '' : Number(e.target.value))} className="border border-accent/40" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="font-semibold text-sm text-accent">Exam Code</label>
                        <Input placeholder="Exam Code" value={examCode} onChange={e => setExamCode(e.target.value)} className="border border-accent/40" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="font-semibold text-sm text-accent">Options</label>
                        <div className="flex items-center gap-3">
                          <Checkbox checked={examAvailable} onCheckedChange={(v: CheckedState) => setExamAvailable(!!v)} />
                          <span className="text-sm select-none">Available</span>
                          <Checkbox checked={examBlurred} onCheckedChange={(v: CheckedState) => setExamBlurred(!!v)} />
                          <span className="text-sm select-none">Blurred</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 justify-end mt-2">
                      <Button variant="outline" onClick={fetchExamSettings} disabled={loadingExamSettings}>{loadingExamSettings ? 'Loading…' : 'Reload'}</Button>
                      <Button onClick={saveExamSettings}>Save Exam Settings</Button>
                      <Button variant="destructive" onClick={async () => {
                        if (!examIdInput) { toast.error('No exam selected'); return; }
                        if (!window.confirm(`Delete exam '${examIdInput}' and all its questions and records? This cannot be undone.`)) return;
                        let failed = false;
                        // Delete all related records first
                        const tables = [
                          { table: 'exam_questions', key: 'exam_id' },
                          { table: 'exam_submissions', key: 'exam_id' },
                          { table: 'exam_incidents', key: 'exam_id' },
                          { table: 'exam_retake', key: 'exam_id' }
                        ];
                        for (const { table, key } of tables) {
                          const { error } = await supabase.from(table).delete().eq(key, examIdInput);
                          if (error) {
                            toast.error(`Failed to delete from ${table}: ${error.message || error}`);
                            failed = true;
                          }
                        }
                        // Now delete the exam itself
                        const { error: examErr } = await supabase.from('exams').delete().eq('id', examIdInput);
                        if (examErr) {
                          toast.error(`Failed to delete exam: ${examErr.message || examErr}`);
                          failed = true;
                        }
                        if (!failed) {
                          toast.success(`Exam '${examIdInput}' and all related records deleted.`);
                          setExamIdInput('');
                          await fetchExamsList();
                        }
                      }}>Delete Exam</Button>
                    </div>
                  </div>
                </div>
              
                {/* New Exam Modal */}
                <Dialog open={newExamOpen} onOpenChange={setNewExamOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Exam</DialogTitle>
                      <DialogDescription>Provide an exam id and basic settings</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                      <Input placeholder="Exam ID (alphanumeric, - or _)" value={newExamId} onChange={e => setNewExamId(e.target.value)} />
                      <Input placeholder="Title" value={newExamTitle} onChange={e => setNewExamTitle(e.target.value)} />
                      <Input placeholder="Duration (minutes)" type="number" value={newExamDuration} onChange={e => setNewExamDuration(e.target.value === '' ? '' : Number(e.target.value))} />
                      <Input placeholder="Exam Code" value={newExamCode} onChange={e => setNewExamCode(e.target.value)} />
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Checkbox checked={newExamBlurred} onCheckedChange={(v: CheckedState) => setNewExamBlurred(!!v)} />
                          <label className="select-none">Blurred</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox checked={newExamAvailable} onCheckedChange={(v: CheckedState) => setNewExamAvailable(!!v)} />
                          <label className="select-none">Available</label>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setNewExamOpen(false)}>Cancel</Button>
                        <Button onClick={createNewExam}>Create</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <div className="space-y-2 max-h-80 overflow-auto">
                  {questions.map((q, i) => (
                    <div key={q.id} className="p-2 border rounded flex items-center justify-between">
                      <div className="text-sm truncate flex-1">{i+1}. {q.question_text}</div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-muted-foreground mr-2">Marks: <span className="font-semibold">{q.value ?? 1}</span></div>
                        <Button size="sm" variant="outline" onClick={() => moveUp(i)}>↑</Button>
                        <Button size="sm" variant="outline" onClick={() => moveDown(i)}>↓</Button>
                        <Button size="sm" variant="outline" onClick={() => openEditQ(q)}><Pencil className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={async () => {
                          if (!confirm('Delete this question? This action cannot be undone.')) return;
                          const { error } = await supabase.from('exam_questions').delete().eq('id', q.id);
                          if (error) toast.error('Failed to delete question'); else { toast.success('Question deleted'); await fetchQuestions(); }
                        }}>Delete</Button>
                      </div>
                    </div>
                  ))}
        {/* Edit Question Modal */}
        <Dialog open={editQOpen} onOpenChange={setEditQOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Question</DialogTitle>
              <DialogDescription>Edit the question text, options, correct answer, and marks.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Input placeholder="Question Text" value={editQText} onChange={e => setEditQText(e.target.value)} />
              <div className="space-y-1">
                <div className="font-semibold text-xs">Options</div>
                {editQOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input value={opt} onChange={e => {
                      const next = [...editQOptions];
                      next[idx] = e.target.value;
                      setEditQOptions(next);
                    }} />
                    <Button size="sm" variant="ghost" onClick={() => {
                      setEditQOptions(prev => prev.filter((_, i) => i !== idx));
                    }}>Remove</Button>
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={() => setEditQOptions(prev => [...prev, ''])}>Add Option</Button>
              </div>
              <Input placeholder="Correct Answer" value={editQAnswer} onChange={e => setEditQAnswer(e.target.value)} />
              <Input placeholder="Marks" type="number" min="0" step="any" value={editQValue} onChange={e => setEditQValue(e.target.value)} />
              <div className="flex gap-2 justify-end mt-2">
                <Button variant="outline" onClick={() => setEditQOpen(false)}>Cancel</Button>
                <Button onClick={saveEditQ}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
                </div>
              </div>
              {diagnosticsOpen && (
                <div className="mt-3 p-3 border rounded bg-muted/5 text-xs">
                  <div className="font-semibold mb-2">Diagnostics</div>
                  <div className="mb-2">Last DB Response:</div>
                  <pre className="whitespace-pre-wrap break-words max-h-48 overflow-auto bg-white p-2 border rounded">{JSON.stringify(lastDbResponse, null, 2)}</pre>
                  <div className="mt-2 mb-1">Exams List (client):</div>
                  <pre className="whitespace-pre-wrap break-words max-h-40 overflow-auto bg-white p-2 border rounded">{JSON.stringify(examsList, null, 2)}</pre>
                  <div className="text-muted-foreground mt-2">If responses show no rows and no error, RLS (Row Level Security) or permissions may be blocking writes.</div>
                </div>
              )}

              <div className="space-y-3">
                <div className="font-semibold">Bulk Import/Export</div>
                <Input type="file" accept=".csv" onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const text = await f.text();
                  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
                  let count = 0;
                  const baseOrder = (questions.length ? Math.max(...questions.map(q => Number(q.order_index) || 0)) + 1 : 1);
                  let offset = 0;
                  for (const line of lines) {
                    const [qt, optsStr, ans] = line.split(',');
                    const opts = (optsStr || '').split('|').map(s => s.trim()).filter(Boolean);
                    const { error } = await supabase.from('exam_questions').insert([
                      { exam_id: examIdInput || 'elyonaris', question_text: qt?.trim() || '', options: opts.length ? opts : null, correct_answer: ans?.trim() || null, order_index: baseOrder + offset }
                    ]);
                    if (!error) count++;
                    offset += 1;
                  }
                  toast.success(`Imported ${count} questions`);
                  await fetchQuestions();
                }} />
                <Button variant="outline" onClick={async () => {
                  const { data } = await supabase
                    .from('exam_questions')
                    .select('question_text, options, correct_answer')
                    .eq('exam_id', examIdInput || 'elyonaris')
                    .order('order_index', { ascending: true });
                  const rows = (data || []).map((r: { question_text: string; options: string[] | null; correct_answer: string | number | null }) => {
                    const opts = Array.isArray(r.options) ? r.options.join('|') : '';
                    return `${r.question_text},${opts},${r.correct_answer ?? ''}`;
                  });
                  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url; a.download = `${examIdInput || 'elyonaris'}-questions.csv`; a.click();
                  URL.revokeObjectURL(url);
                }}>Export Questions (CSV)</Button>

                <div className="space-y-3 p-3 border rounded bg-card">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">Reporting & Analytics</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Updated {analytics.lastRefreshed ? new Date(analytics.lastRefreshed).toLocaleTimeString() : '-'}</span>
                      <Button size="sm" variant="ghost" onClick={fetchAnalytics}><RefreshCcw className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded border bg-background">
                      <div className="text-xs text-muted-foreground">Avg. Grade</div>
                      <div className="text-xl font-bold">{(analytics.avg * 100).toFixed(0)}%</div>
                      <ChartContainer config={{ value: { color: 'hsl(var(--primary))', label: 'Avg' } }}>
                        <ResponsiveContainer width="100%" height={40}>
                          <LineChart data={analytics.gradeTrend.map((v, i) => ({ i, value: v }))}>
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line type="monotone" dataKey="value" stroke="var(--color-value)" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                    <div className="p-3 rounded border bg-background">
                      <div className="text-xs text-muted-foreground">Pass %</div>
                      <div className="text-xl font-bold">{(analytics.passRate * 100).toFixed(0)}%</div>
                      <ChartContainer config={{ value: { color: 'hsl(var(--accent))', label: 'Pass' } }}>
                        <ResponsiveContainer width="100%" height={40}>
                          <LineChart data={analytics.passTrend.map((v, i) => ({ i, value: v }))}>
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line type="monotone" dataKey="value" stroke="var(--color-value)" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                    <div className="p-3 rounded border bg-background">
                      <div className="text-xs text-muted-foreground">Completion %</div>
                      <div className="text-xl font-bold">{(analytics.completionRate * 100).toFixed(0)}%</div>
                      <ChartContainer config={{ value: { color: 'hsl(var(--muted))', label: 'Completion' } }}>
                        <ResponsiveContainer width="100%" height={40}>
                          <LineChart data={analytics.completionTrend.map((v, i) => ({ i, value: v }))}>
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line type="monotone" dataKey="value" stroke="var(--color-value)" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  </div>
                  <div className="max-h-40 overflow-auto text-xs mt-2">
                    {Object.entries(analytics.itemStats).slice(0,20).map(([qid, stats]) => (
                      <div key={qid} className="flex items-center gap-2">
                        <span className="font-mono">{qid}:</span>
                        <span>{Object.entries(stats).map(([opt, n]) => `${opt}(${n})`).join(', ')}</span>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="mt-2" onClick={async () => {
                    const exam = examIdInput || 'elyonaris';
                    const { data } = await supabase
                      .from('exam_submissions')
                      .select('admission_id,score,total,created_at');
                    const rows = (data || []).map((r: { admission_id: string; score: number; total: number; created_at: string }) => `${r.admission_id},${r.score},${r.total},${new Date(r.created_at).toISOString()}`);
                    const blob = new Blob([['admission_id,score,total,created_at', ...rows].join('\n')], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a'); a.href = url; a.download = `${exam}-results.csv`; a.click(); URL.revokeObjectURL(url);
                  }}>Export Results (CSV)</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
