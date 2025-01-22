import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Text,
} from '@react-email/components';
import { EmailButton } from '../components/EmailButton';
import { EmailFooter } from '../components/EmailFooter';

export const WelcomeEmail = ({ name }: { name: string }) => (
  <Html>
    <Head />
    <Preview>Tere tulemast meie teenusesse!</Preview>
    <Body>
      <Container>
        <Text>Tere {name}!</Text>
        <Text>Täname, et liitusite meiega...</Text>
        <EmailButton href="https://teie-teenus.ee">
          Alusta kasutamist
        </EmailButton>
        <EmailFooter />
      </Container>
    </Body>
  </Html>
); 