/*
  delete-student.js
  Node script to delete a student and dependent rows using the Supabase service_role key.

  USAGE (from repository root):
    npm install @supabase/supabase-js
    set SUPABASE_URL=https://your-project.supabase.co
    set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
    node scripts/delete-student.js <ADMISSION_ID>

  Notes:
  - This script MUST be run in a secure environment (never expose the service role key in the browser).
  - It deletes rows from exam_submissions, exam_incidents, exam_retake and then deletes the student row.
  - It logs results and exits with non-zero code on failure.
*/

const { createClient } = require('@supabase/supabase-js');

async function main() {
  const id = process.argv[2];
  if (!id) {
    console.error('Usage: node scripts/delete-student.js <ADMISSION_ID>');
    process.exit(2);
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
    process.exit(2);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });

  try {
    console.log('Deleting exam_submissions for', id);
    const { data: subs, error: errSubs } = await supabase.from('exam_submissions').delete().select('*').eq('admission_id', id);
    if (errSubs) throw errSubs;
    console.log('Deleted exam_submissions:', subs ? subs.length : 0);

    console.log('Deleting exam_incidents for', id);
    const { data: incs, error: errIncs } = await supabase.from('exam_incidents').delete().select('*').eq('admission_id', id);
    if (errIncs) throw errIncs;
    console.log('Deleted exam_incidents:', incs ? incs.length : 0);

    console.log('Deleting exam_retake for', id);
    const { data: retr, error: errRetr } = await supabase.from('exam_retake').delete().select('*').eq('admission_id', id);
    if (errRetr) throw errRetr;
    console.log('Deleted exam_retake rows:', retr ? retr.length : 0);

    console.log('Deleting student record', id);
    const { data: delStu, error: errStu } = await supabase.from('students_1').delete().select('*').eq('admission_id', id);
    if (errStu) throw errStu;
    console.log('Deleted student rows:', delStu ? delStu.length : 0);

    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Delete failed:', err);
    process.exit(1);
  }
}

main();
