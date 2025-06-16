import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface OtpEmailProps {
  verificationCode?: string;
}

export const OtpEmail = ({ verificationCode }: OtpEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#FEF3C7', color: '#212121', padding: '10px' }}>
        <Preview>Your OTP Code</Preview>
        <Container style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
          <Section style={{ padding: '25px 35px' }}>
            <Heading style={{ color: '#80410e', fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>Verify Your Login</Heading>
            <Text style={{ color: '#5a3b02', fontSize: '14px', marginBottom: '14px' }}>
              Use the code below to complete your login to Intelligent ERP. If you did not request this, please ignore this email.
            </Text>
            <Section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#80410e', fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>Verification Code</Text>
              <Text style={{ color: '#80410e', fontSize: '36px', fontWeight: 'bold', marginBottom: '10px' }}>{verificationCode}</Text>
              <Text style={{ color: '#5a3b02', fontSize: '14px' }}>(This code is valid for 10 minutes)</Text>
            </Section>
          </Section>
          <Hr style={{ borderTop: '1px solid #D1D5DB', margin: '20px 0' }} />
          <Section style={{ padding: '25px 35px' }}>
            <Text style={{ color: '#5a3b02', fontSize: '14px' }}>
              Intelligent ERP will never email you and ask you to disclose or verify your password, credit card, or banking account number.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default OtpEmail;