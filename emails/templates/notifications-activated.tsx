import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from '@react-email/components';
import { EmailButton } from '../components/EmailButton';
import { EmailFooter } from '../components/EmailFooter';

interface NotificationsActivatedEmailProps {
  companyName: string;
  startDate: string;
  billingPeriod: string;
  price: string;
}

export const NotificationsActivatedEmail = ({
  companyName,
  startDate,
  billingPeriod,
  price,
}: NotificationsActivatedEmailProps) => {
  console.log('Rendering email template with:', { companyName, startDate, billingPeriod, price });
  return (
    <Html>
      <Head />
      <Preview>Teavitused on aktiveeritud!</Preview>
      <Body style={{ backgroundColor: '#ffffff' }}>
        <Container style={{ maxWidth: '600px', margin: '40px auto' }}>
          <Section style={{ padding: '40px 30px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
            <Text style={{ fontSize: '24px', lineHeight: '32px', fontWeight: 600, color: '#111827', margin: '0 0 20px 0' }}>
              Teavitused on aktiveeritud!
            </Text>
            <Text style={{ color: '#4b5563', fontSize: '16px', lineHeight: '24px', margin: 0 }}>
              Olete edukalt aktiveerinud teavitused ettevõttele <strong style={{ color: '#111827' }}>{companyName}</strong>
            </Text>
          </Section>

          <Section style={{ padding: '30px' }}>
            <Section style={{ backgroundColor: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: '4px', padding: '20px', marginBottom: '20px' }}>
              <Text style={{ fontSize: '18px', color: '#111827', margin: '0 0 16px 0' }}>Teie tellimuse info</Text>
              <Row>
                <Column>
                  <Text style={{ color: '#4b5563' }}>Tellimuse algus:</Text>
                </Column>
                <Column>
                  <Text style={{ color: '#111827', fontWeight: 500, textAlign: 'right' }}>{startDate}</Text>
                </Column>
              </Row>
              <Row>
                <Column>
                  <Text style={{ color: '#4b5563' }}>Hind:</Text>
                </Column>
                <Column>
                  <Text style={{ color: '#111827', fontWeight: 500, textAlign: 'right' }}>
                    {price} / {billingPeriod}
                  </Text>
                </Column>
              </Row>
            </Section>

            <Section style={{ backgroundColor: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: '4px', padding: '20px', marginBottom: '20px' }}>
              <Text style={{ fontSize: '18px', color: '#111827', margin: '0 0 16px 0' }}>Mida see tähendab?</Text>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#4b5563', fontSize: '15px', lineHeight: '24px' }}>
                <li style={{ marginBottom: '8px' }}>Teavitame teid koheselt, kui leiame teie ettevõttele sobivaid toetusi</li>
                <li style={{ marginBottom: '8px' }}>Saate infot lähenevate tähtaegade kohta</li>
                <li style={{ marginBottom: '8px' }}>Hoiame teid kursis oluliste muudatustega toetuste tingimustes</li>
                <li>Saate personaalseid soovitusi toetuste taotlemiseks</li>
              </ul>
            </Section>

            <Text style={{ color: '#4b5563', fontSize: '15px', lineHeight: '24px', margin: 0 }}>
              Teavitused saadetakse teie e-posti aadressile. Saate igal ajal oma teavituste seadeid muuta{' '}
              <EmailButton href="https://www.leiatoetus.ee/account/settings">
                LeiaToetus.ee portaalis
              </EmailButton>
            </Text>
          </Section>

          <Section style={{ padding: '0 30px 30px' }}>
            <EmailFooter />
          </Section>
        </Container>
      </Body>
    </Html>
  );
}; 