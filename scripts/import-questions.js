// @ts-check
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { config } from 'dotenv';
import { readFile } from 'fs/promises';

// Load environment variables from .env.local
config({ path: '.env.local' });

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  try {
    // Import the questions directly from TypeScript source
    const { verbalReasoningQuestions } = await import('../src/data/verbalReasoningQuestions.ts');
    
    // Get environment variables
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase URL or key in environment variables');
    }

    // Initialize Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);

    const EXAM_ID = '00SAT2025';
    
    console.log('Deleting existing questions...');
    const { error: deleteError } = await supabase
      .from('exam_questions')
      .delete()
      .eq('exam_id', EXAM_ID);

    if (deleteError) {
      console.error('Error deleting questions:', deleteError);
      return;
    }

    console.log(`Found ${verbalReasoningQuestions.length} questions in the source file`);
    console.log('Importing new questions...');
    const questions = verbalReasoningQuestions.map((q, i) => {
      console.log(`Processing question ${q.id} (${i + 1}/${verbalReasoningQuestions.length})`);
      return {
        exam_id: EXAM_ID,
        question_text: q.question_text,
        options: q.options,
        correct_answer: q.correct_answer,
        order_index: i + 1,
        value: 2.5
      };
    });

    // Insert in batches of 20
    const BATCH_SIZE = 20;
    for (let i = 0; i < questions.length; i += BATCH_SIZE) {
      const batch = questions.slice(i, i + BATCH_SIZE);
      const { error } = await supabase
        .from('exam_questions')
        .insert(batch);

      if (error) {
        console.error('Error importing batch:', error);
        return;
      }
      console.log(`Imported batch ${Math.floor(i/BATCH_SIZE) + 1}`);
    }

    console.log('Successfully imported all questions!');
  } catch (error) {
    console.error('An error occurred:', error);
    process.exit(1);
  }
}

main();