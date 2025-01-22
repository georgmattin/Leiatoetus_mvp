import { NextResponse } from 'next/server'
import axios from 'axios'
import { XMLParser } from 'fast-xml-parser'

export async function POST(request: Request) {
  const { query } = await request.json()
  
  const url = 'https://ariregxmlv6.rik.ee/v1/lihtandmed_v2'
  const xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
                     xmlns:prod="http://arireg.x-road.eu/producer/">
        <soapenv:Body>
            <prod:lihtandmed_v2>
                <prod:keha>
                    <prod:ariregister_kasutajanimi>${process.env.RIK_USERNAME}</prod:ariregister_kasutajanimi>
                    <prod:ariregister_parool>${process.env.RIK_PASSWORD}</prod:ariregister_parool>
                    <prod:evnimi>${query}</prod:evnimi>
                    <prod:keel>est</prod:keel>
                </prod:keha>
            </prod:lihtandmed_v2>
        </soapenv:Body>
    </soapenv:Envelope>`

  try {
    const response = await axios.post(url, xmlRequest, {
      headers: {
        'Content-Type': 'text/xml;charset=UTF-8',
        'SOAPAction': ''
      }
    })

    const parser = new XMLParser({
      ignoreAttributes: false,
      removeNSPrefix: true
    })

    const result = parser.parse(response.data)
    let companies = result?.Envelope?.Body?.lihtandmed_v2Response?.keha?.ettevotjad?.item || []
    
    // Teeme kindlasti massiiviks
    companies = Array.isArray(companies) ? companies : [companies]
    
    // Filtreerime ainult aktiivsed ettevõtted
    const activeCompanies = companies
      .filter(c => c.staatus === 'R')
      .slice(0, 5) // Võtame ainult esimesed 5 tulemust

    return NextResponse.json(activeCompanies)
  } catch (error) {
    console.error('Viga ettevõtete otsingul:', error)
    return NextResponse.json({ error: 'Viga ettevõtete otsingul' }, { status: 500 })
  }
} 