import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function inspect() {
  console.log('--- Inspecting auth users ---')
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
  if (authError) {
    console.error('Auth error:', authError)
  } else {
    console.log(`Found ${authUsers.users.length} auth users:`)
    authUsers.users.forEach(u => {
      console.log(`ID: ${u.id}, Email: ${u.email}, Created: ${u.created_at}`)
    })
  }

  console.log('\n--- Inspecting public.users ---')
  const { data: dbUsers, error: dbError } = await supabase.from('users').select('*')
  if (dbError) {
    console.error('DB error:', dbError)
  } else {
    console.log(`Found ${dbUsers.length} DB users:`)
    dbUsers.forEach(u => {
      console.log(`ID: ${u.id}, CPF: ${u.cpf}, Email: ${u.email}, Perfil: ${u.perfil}, Ativo: ${u.ativo}`)
    })
  }
}

inspect()
