Running the admin delete script

This repository includes a helper Node script to delete one student and their dependent rows.
Use this only if you have admin access to the Supabase project (service_role key) and you understand the risk.

Files:
- scripts/delete-student.js  — Node script that deletes exam_submissions, exam_incidents, exam_retake then students_1.

How to run
1) Install dependency (once):

   npm install @supabase/supabase-js

2) Export env vars (Windows PowerShell):

   $env:SUPABASE_URL = 'https://your-project.supabase.co'
   $env:SUPABASE_SERVICE_ROLE_KEY = 'your-service-role-key'

(Or on Windows cmd.exe use set SUPABASE_URL=... etc. On Linux/macOS use export.)

3) Run the script:

   node scripts/delete-student.js <ADMISSION_ID>

Example:

   node scripts/delete-student.js 12345

Safety & notes
- The service_role key grants full DB privileges. Keep it secret and run scripts only in a secure environment.
- The script deletes rows permanently. If you prefer to keep data, consider marking student records as soft-deleted instead.
- If the script fails with a permissions/RLS error even when using the service role, check Supabase project access.
- If you want this operation as an app feature (button in Admin UI), implement a server-side endpoint (Edge Function or a server using the service_role key) and call that endpoint from the Admin UI. I can scaffold that if you want.
