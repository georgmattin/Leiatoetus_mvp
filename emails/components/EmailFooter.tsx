import { Text, Link, Hr } from '@react-email/components';

export const EmailFooter = () => (
  <>
    <Hr style={{ borderTop: '1px solid #e5e7eb', margin: '20px 0' }} />
    <Text style={{ color: '#6b7280', fontSize: '14px', lineHeight: '21px', margin: '0 0 15px 0' }}>
      Parimate soovidega,<br />
      <strong style={{ color: '#111827' }}>LeiaToetus.ee meeskond</strong>
    </Text>
    <Text style={{ margin: '0 0 10px 0' }}>
      <Link href="mailto:info@leiatoetus.ee" style={{ color: '#2563eb', textDecoration: 'none' }}>
        info@leiatoetus.ee
      </Link>
      <br />
      <Link href="https://www.leiatoetus.ee" style={{ color: '#2563eb', textDecoration: 'none' }}>
        www.leiatoetus.ee
      </Link>
    </Text>
    <Text style={{ fontSize: '12px', color: '#9ca3af', margin: '15px 0 0 0' }}>
      Avar Agentuur OÜ<br />
      Pärnu mnt. 137, 11314 Tallinn
    </Text>
  </>
); 