import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://mopxykltpzvpajlmezxk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vcHh5a2x0cHp2cGFqbG1lenhrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTI3NTE4OSwiZXhwIjoyMDk2ODUxMTg5fQ.5ZbPzY2oGUHzDGThDWHjXSSnol0GFKMeKJ78r8W-9bc'
)

async function checkTables() {
  const tables = ['users', 'contratos', 'relatorios', 'logs', 'excecoes_prazos']
  
  console.log("Checking tables...")
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('count', { count: 'exact', head: true })
    if (error) {
      console.log(`Table ${table} check ERROR:`, error.message)
    } else {
      console.log(`Table ${table} EXISTS.`)
    }
  }
}

checkTables()
