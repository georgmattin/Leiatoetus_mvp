import { Button } from '@react-email/components';

export const EmailButton = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Button
    href={href}
    style={{
      display: 'inline-block',
      padding: '12px 24px',
      backgroundColor: '#2563eb',
      color: '#ffffff',
      textDecoration: 'none',
      borderRadius: '6px',
      fontWeight: 500,
      fontSize: '16px',
      textAlign: 'center',
      margin: '16px 0',
    }}
  >
    {children}
  </Button>
); 