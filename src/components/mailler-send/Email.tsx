import * as React from 'react';
import { Html, Button, Text } from "@react-email/components";

interface EmailProps {
  url?: string;
  code?: string;
  token?: string;
}

export function ForgotPasswordEmail({ url, token }: EmailProps) {
  return (
    <Html lang="en">
      <Text>Click the link below to reset your password:</Text>
      <Button href={`${url}?token=${token}`}>Reset Password</Button>
    </Html>
  );
}

export function OtpEmail({ code }: EmailProps) {
  return (
    <Html lang="en">
      <Text>Your OTP code is:</Text>
      <Text style={{ fontSize: '24px', fontWeight: 'bold' }}>{code}</Text>
    </Html>
  );
}

export function WelcomeEmail({ url, code }: EmailProps) {
  return (
    <Html lang="en">
      <Text>Welcome to our platform!</Text>
      <Text>Your signup OTP is:</Text>
      <Text style={{ fontSize: '24px', fontWeight: 'bold' }}>{code}</Text>
      <Button href={url}>Get Started</Button>
    </Html>
  );
}