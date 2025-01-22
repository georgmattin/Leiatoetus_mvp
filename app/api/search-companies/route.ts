import { NextResponse } from 'next/server';
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

export async function POST(request: Request) {
  try {
    const { searchTerm } = await request.json();
    const isRegistryCode = /^\d+$/.test(searchTerm);

    const url = 'https://ariregxmlv6.rik.ee/v1/lihtandmed_v2';
    const xmlParing = `<?xml version="1.0" encoding="UTF-8"?>
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
                     xmlns:prod="http://arireg.x-road.eu/producer/">
        <soapenv:Body>
            <prod:lihtandmed_v2>
                <prod:keha>
                    <prod:ariregister_kasutajanimi>${process.env.RIK_USERNAME}</prod:ariregister_kasutajanimi>
                    <prod:ariregister_parool>${process.env.RIK_PASSWORD}</prod:ariregister_parool>
                    ${isRegistryCode 
                      ? `<prod:ariregistri_kood>${searchTerm}</prod:ariregistri_kood>`
                      : `<prod:evnimi>${searchTerm}</prod:evnimi>`}
                    <prod:keel>est</prod:keel>
                </prod:keha>
            </prod:lihtandmed_v2>
        </soapenv:Body>
    </soapenv:Envelope>`;

    const vastus = await axios.post(url, xmlParing, {
      headers: {
        'Content-Type': 'text/xml;charset=UTF-8',
        'SOAPAction': ''
      }
    });

    const parser = new XMLParser({
      ignoreAttributes: false,
      removeNSPrefix: true
    });

    const result = parser.parse(vastus.data);
    let ettevotjad = result?.Envelope?.Body?.lihtandmed_v2Response?.keha?.ettevotjad?.item || [];
    
    // Teeme kindlasti massiiviks
    ettevotjad = Array.isArray(ettevotjad) ? ettevotjad : [ettevotjad];
    
    // Filtreerime ainult aktiivsed ettevõtted
    const aktiivsedEttevotjad = ettevotjad
      .filter(e => e.staatus === 'R')
      .map(e => ({
        evnimi: e.evnimi,
        ariregistri_kood: e.ariregistri_kood,
        aadress: e.evaadressid?.aadress_ads__ads_normaliseeritud_taisaadress
      }));

    return NextResponse.json(aktiivsedEttevotjad);
  } catch (error) {
    console.error('Viga ettevõtete otsimisel:', error);
    return NextResponse.json({ error: 'Viga ettevõtete otsimisel' }, { status: 500 });
  }
} 