const axios = require('axios');
const readline = require('readline');
require('dotenv').config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function teeLihtandmeteParing(otsing) {
    const url = 'https://ariregxmlv6.rik.ee/v1/lihtandmed_v2';
    const onRegistrikood = /^\d+$/.test(otsing);
    
    const xmlParing = `<?xml version="1.0" encoding="UTF-8"?>
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
                     xmlns:prod="http://arireg.x-road.eu/producer/">
        <soapenv:Body>
            <prod:lihtandmed_v2>
                <prod:keha>
                    <prod:ariregister_kasutajanimi>${process.env.RIK_USERNAME}</prod:ariregister_kasutajanimi>
                    <prod:ariregister_parool>${process.env.RIK_PASSWORD}</prod:ariregister_parool>
                    ${onRegistrikood 
                        ? `<prod:ariregistri_kood>${otsing}</prod:ariregistri_kood>`
                        : `<prod:evnimi>${otsing}</prod:evnimi>`}
                    <prod:keel>est</prod:keel>
                </prod:keha>
            </prod:lihtandmed_v2>
        </soapenv:Body>
    </soapenv:Envelope>`;

    try {
        const vastus = await axios.post(url, xmlParing, {
            headers: {
                'Content-Type': 'text/xml;charset=UTF-8',
                'SOAPAction': ''
            }
        });

        if (vastus.status === 200) {
            return parseLihtandmeteVastus(vastus.data);
        }
    } catch (error) {
        console.error('Viga päringu tegemisel:', error.message);
        return null;
    }
}

function parseLihtandmeteVastus(xmlText) {
    const { XMLParser } = require('fast-xml-parser');
    const parser = new XMLParser({
        ignoreAttributes: false,
        removeNSPrefix: true
    });

    try {
        const result = parser.parse(xmlText);
        let ettevotjad = result?.Envelope?.Body?.lihtandmed_v2Response?.keha?.ettevotjad?.item || [];
        
        // Teeme kindlasti massiiviks
        ettevotjad = Array.isArray(ettevotjad) ? ettevotjad : [ettevotjad];
        
        // Filtreerime ainult aktiivsed ettevõtted (staatus "R")
        const aktiivsedEttevotjad = ettevotjad.filter(e => e.staatus === 'R');
        
        if (aktiivsedEttevotjad.length === 0) {
            console.log("\nAktiivseid ettevõtteid ei leitud.");
            return null;
        }
        
        return aktiivsedEttevotjad;
    } catch (error) {
        console.error('Viga XML parsimisel:', error.message);
        return null;
    }
}

function kuvaLihtandmed(andmed) {
    if (!andmed || andmed.length === 0) {
        console.log("Andmeid ei leitud");
        return;
    }

    if (andmed.length > 1) {
        console.log(`\nLeitud ${andmed.length} aktiivset ettevõtet:`);
        console.log("(Maksimaalselt kuvatakse 100 tulemust)\n");
        
        andmed.forEach((ettevotja, index) => {
            console.log(`${index + 1}. ${ettevotja.evnimi}`);
            console.log(`   Registrikood: ${ettevotja.ariregistri_kood}`);
            if (ettevotja.evaadressid?.aadress_ads__ads_normaliseeritud_taisaadress) {
                console.log(`   Aadress: ${ettevotja.evaadressid.aadress_ads__ads_normaliseeritud_taisaadress}`);
            }
            console.log(); // Tühi rida ettevõtete vahel
        });

        if (andmed.length === 100) {
            console.log("\nNB! Kuvatud on maksimaalselt 100 tulemust.");
            console.log("Täpsema otsingu jaoks täpsusta ettevõtte nime.");
        }
    } else {
        const ettevotja = andmed[0];
        console.log("\n=== ETTEVÕTTE LIHTANDMED ===");
        console.log(`Nimi: ${ettevotja.evnimi}`);
        console.log(`Registrikood: ${ettevotja.ariregistri_kood}`);
        console.log(`Õiguslik vorm: ${ettevotja.oiguslik_vorm_tekstina}`);
        if (ettevotja.evaadressid?.aadress_ads__ads_normaliseeritud_taisaadress) {
            console.log(`Aadress: ${ettevotja.evaadressid.aadress_ads__ads_normaliseeritud_taisaadress}`);
        }
        if (ettevotja.evkapitalid?.kapitali_suurus) {
            console.log(`Kapital: ${ettevotja.evkapitalid.kapitali_suurus} ${ettevotja.evkapitalid.kapitali_valuuta}`);
        }
        console.log(`Esmaregistreerimine: ${ettevotja.esmakande_aeg}`);
        console.log("=".repeat(30));
    }
}

async function kysimus(kysimus) {
    return new Promise((resolve) => {
        rl.question(kysimus, (vastus) => {
            resolve(vastus.trim());
        });
    });
}

async function main() {
    while (true) {
        const otsing = await kysimus("\nSisesta ettevõtte nimi või registrikood (või 'exit' programmist väljumiseks): ");

        if (otsing.toLowerCase() === 'exit') {
            console.log("\nProgramm lõpetab töö.");
            rl.close();
            break;
        }

        if (!otsing) {
            console.log("Sisend ei saa olla tühi!");
            continue;
        }

        const andmed = await teeLihtandmeteParing(otsing);
        if (andmed) {
            kuvaLihtandmed(andmed);
        }
    }
}

main(); 