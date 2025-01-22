import { createClient } from '@supabase/supabase-js'
import * as readline from 'readline'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import * as fs from 'fs'

// Env faili laadimine
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const envPath = resolve(__dirname, '../.env.local')

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
}

// API seadistused
const API_PROCESS_COMPANY = process.env.API_URL || "http://localhost:5000/api/process-company"
const API_KEY = process.env.API_KEY || "leiatoetusgu4SGC8HNgH9WbiRgQ3hjamDrh4hpSUKMK7vWIjkzJt4hAfH2i99otpohjEzfEpMwKXjpNxhfZ9EB0qBOAKxtFqQ2ZLd6TWLFxuiEIklYshjMTn7ONFa7j"

// Supabase kliendi seadistamine
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

// Readline interface loomine
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// Promise-põhine readline küsimus
const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve)
  })
}

// Funktsioon API kättesaadavuse kontrollimiseks
async function checkApiAvailability(): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 sec timeout

    const response = await fetch(API_PROCESS_COMPANY, {
      method: 'HEAD',
      signal: controller.signal
    }).catch(() => null)

    clearTimeout(timeoutId)
    return response?.ok ?? false
  } catch {
    return false
  }
}

// Funktsioon ettevõtte analüüsimiseks
async function processCompany(userId: string, registryCode: string) {
  try {
    console.log('\n=== ALUSTAN ETTEVÕTTE ANALÜÜSI ===')
    console.log(`Kasutaja ID: ${userId}`)
    console.log(`Registrikood: ${registryCode}`)

    // Kontrolli API kättesaadavust
    const isApiAvailable = await checkApiAvailability()
    if (!isApiAvailable) {
      console.log('\n⚠️ HOIATUS: API server ei ole kättesaadav!')
      console.log(`API URL: ${API_PROCESS_COMPANY}`)
      console.log('Veenduge, et Flask API server on käivitatud ja töötab.')
      return
    }

    const response = await fetch(API_PROCESS_COMPANY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        company_registry_code: registryCode,
        user_id: userId
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP viga! Staatus: ${response.status}\nVastus: ${errorText}`)
    }

    const data = await response.json()
    console.log('\n=== ANALÜÜSI TULEMUS ===')
    console.log(data)

    if (data.status === 'success') {
      console.log('\nAnalüüs õnnestus!')
      console.log(`Tulemuste URL: /sobivad-toetused?user_id=${userId}${data.order_id ? `&order_id=${data.order_id}` : ''}`)
    } else {
      console.log('\nAnalüüs ebaõnnestus:', data.message || 'Tundmatu viga')
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
      console.error('\n❌ API serveriga ei õnnestunud ühendust luua!')
      console.error('Veenduge, et:')
      console.error('1. Flask API server on käivitatud')
      console.error(`2. Server töötab aadressil: ${API_PROCESS_COMPANY}`)
      console.error('3. Tulemüür ei blokeeri ühendust')
    } else {
      console.error('\nViga ettevõtte analüüsimisel:', error)
    }
  }
}

// Funktsioon kasutaja ja tellimuste andmete pärimiseks
async function getUserData(userId: string, orderId: string) {
  try {
    // Profiili andmete päring
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError) {
      throw profileError
    }

    // Konkreetse tellimuse päring
    const { data: order, error: orderError } = await supabase
      .from('one_time_orders')
      .select('*')
      .eq('user_id', userId)
      .eq('id', orderId)
      .single()

    if (orderError) {
      throw orderError
    }

    // Teavituste tellimuse päring
    const { data: teavitusTellimus, error: teavitusError } = await supabase
      .from('teavituste_tellimused')
      .select('*')
      .eq('user_id', userId)
      .eq('one_time_order_id', orderId)
      .eq('status', 'paid')
      .is('cancelled_at', null)
      .single()

    if (teavitusError && teavitusError.code !== 'PGRST116') {
      throw teavitusError
    }

    // Tulemuste kuvamine
    console.log('\n=== KASUTAJA PROFIIL ===')
    if (profile) {
      console.log(profile)
    } else {
      console.log('Kasutaja profiili ei leitud!')
    }

    console.log('\n=== TELLIMUSE INFO ===')
    if (order) {
      console.log(order)
      // Kui leiame tellimuse ja seal on registrikood, käivitame analüüsi
      if (order.company_registry_code) {
        await processCompany(userId, order.company_registry_code.toString())
      }
    } else {
      console.log('Tellimust ei leitud!')
    }

    console.log('\n=== AKTIIVNE TEAVITUSE TELLIMUS ===')
    if (teavitusTellimus) {
      console.log(teavitusTellimus)
    } else {
      console.log('Aktiivset teavituse tellimust ei leitud!')
    }

  } catch (error) {
    console.error('Viga:', error)
  } finally {
    rl.close()
  }
}

// Põhiprogramm
async function main() {
  try {
    const userId = await question('Sisesta kasutaja ID: ')
    const orderId = await question('Sisesta tellimuse number: ')
    await getUserData(userId, orderId)
  } catch (error) {
    console.error('Viga:', error)
    rl.close()
  }
}

// Käivita programm
main() 