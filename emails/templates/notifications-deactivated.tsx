import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import { EmailButton } from '../components/EmailButton';
import { EmailFooter } from '../components/EmailFooter';

interface NotificationsDeactivatedEmailProps {
  companyName: string;
  endDate: string;
}

export const NotificationsDeactivatedEmail = ({
  companyName,
  endDate,
}: NotificationsDeactivatedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Teavitused on deaktiveeritud</Preview>
      <Body style={{ backgroundColor: '#ffffff' }}>
        <Container style={{ maxWidth: '600px', margin: '40px auto' }}>
          <Section style={{ padding: '40px 30px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
            <Text style={{ fontSize: '24px', lineHeight: '32px', fontWeight: 600, color: '#111827', margin: '0 0 20px 0' }}>
              Teavitused on deaktiveeritud
            </Text>
            <Text style={{ color: '#4b5563', fontSize: '16px', lineHeight: '24px', margin: 0 }}>
              Olete deaktiveerinud teavitused ettevõttele <strong style={{ color: '#111827' }}>{companyName}</strong>
            </Text>
          </Section>

          <Section style={{ padding: '30px' }}>
            <Section style={{ backgroundColor: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: '4px', padding: '20px', marginBottom: '20px' }}>
              <Text style={{ fontSize: '18px', color: '#111827', margin: '0 0 16px 0' }}>Tellimuse info</Text>
              <Text style={{ margin: '0 0 8px 0', color: '#4b5563', fontSize: '15px', lineHeight: '24px' }}>
                Teie tellimus kehtib kuni <strong style={{ color: '#111827' }}>{endDate}</strong>
              </Text>
              <Text style={{ margin: '0', color: '#4b5563', fontSize: '15px', lineHeight: '24px' }}>
                Saate teavitused igal ajal uuesti aktiveerida enne tellimuse lõppemist.
              </Text>
            </Section>

            <Text style={{ color: '#4b5563', fontSize: '15px', lineHeight: '24px', margin: '0 0 24px 0', textAlign: 'center' }}>
              Soovite teavitused uuesti aktiveerida?
            </Text>

            <div style={{ textAlign: 'center' }}>
              <EmailButton href="https://www.leiatoetus.ee/account/notifications">
                Aktiveeri teavitused
              </EmailButton>
            </div>
          </Section>

          <Section style={{ padding: '0 30px 30px' }}>
            <EmailFooter />
          </Section>
        </Container>
      </Body>
    </Html>
  );
}; 