import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface ForgotPasswordEmailProps {
  userFirstname?: string | null;
  resetPasswordLink?: string;
}

export const ForgotPasswordEmail = ({
  userFirstname,
  resetPasswordLink,
}: ForgotPasswordEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f6f9fc', padding: '10px' }}>
        <Preview>Reset your password</Preview>
        <Container style={{ backgroundColor: '#ffffff', border: '1px solid #f0f0f0', padding: '45px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
          <Section>
            <Text style={{ fontSize: '18px', fontWeight: '300', color: '#404040', marginBottom: '20px' }}>Hi {userFirstname},</Text>
            <Text style={{ fontSize: '16px', fontWeight: '300', color: '#404040', marginBottom: '20px' }}>
              Someone recently requested a password change for your Intelligent ERP account. If this was you, you can set a new password here:
            </Text>
            <Button
              style={{
                backgroundColor: '#80410e',
                color: '#fff',
                borderRadius: '4px',
                padding: '14px 7px',
                textDecoration: 'none',
                fontSize: '15px',
                textAlign: 'center',
                display: 'block',
                width: '210px',
                margin: '0 auto',
              }}
              href={resetPasswordLink}
            >
              Reset password
            </Button>
            <Text style={{ fontSize: '16px', fontWeight: '300', color: '#404040', marginTop: '20px' }}>
              If you don&apos;t want to change your password or didn&apos;t request this, just ignore and delete this message.
            </Text>
            <Text style={{ fontSize: '16px', fontWeight: '300', color: '#404040', marginTop: '20px' }}>
              To keep your account secure, please don&apos;t forward this email to anyone.
            </Text>
            <Text style={{ fontSize: '16px', fontWeight: '300', color: '#404040', marginTop: '20px' }}>Thank you for using Intelligent ERP!</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ForgotPasswordEmail;
