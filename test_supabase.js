const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://wplcufzxkcsisaqpbctv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwbGN1Znp4a2NzaXNhcXBiY3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3OTkzOTUsImV4cCI6MjA5NzM3NTM5NX0.fR1aCMqbEdM4DJvTS-CCJwSuN7amOPEsfW1efgt6DB8'
);

async function test() {
  const { error } = await supabase.from('interviews').insert({
    user_id: '00000000-0000-0000-0000-000000000000',
    transcript: [],
    job_role: 'Test',
    score: 100,
    summary: 'Test summary',
    json_report: []
  });
  console.log("Error:", error);
}

test();
