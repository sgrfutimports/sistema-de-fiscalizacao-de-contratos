import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function seed() {
  const cpf = '04649321492'
  const password = 'admin'
  const email = `${cpf}@71bimtz.eb.mil.br`
  
  console.log('Iniciando criação do administrador específico...')

  // Tenta deletar se já existir (para evitar erros em repetições)
  const { data: usersData } = await supabase.auth.admin.listUsers()
  const existingUser = usersData.users.find(u => u.email === email)
  if (existingUser) {
    console.log('Usuário já existe, deletando antigo...')
    await supabase.from('users').delete().eq('id', existingUser.id)
    await supabase.auth.admin.deleteUser(existingUser.id)
  }
  
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password: password,
    email_confirm: true
  })
  
  if (authError) {
     console.log('Erro ao criar usuário na autenticação:', authError)
     return
  }
  
  const id = authData?.user?.id
  if (id) {
    const { error: dbError } = await supabase.from('users').insert({
      id,
      nome: 'Administrador (Ricardo)',
      cpf: cpf,
      email,
      telefone: '(00) 00000-0000',
      perfil: 'ADMIN',
      ativo: true,
      primeiro_acesso: false // Definido como false para não forçar a troca de senha caso você queira manter "admin" por agora
    })
    
    if (dbError) {
        console.log('Erro ao inserir no banco:', dbError)
    } else {
        console.log('Admin user criado com sucesso!')
    }
  }
}

seed()
