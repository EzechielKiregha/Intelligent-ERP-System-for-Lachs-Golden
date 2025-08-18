import axiosdb from './axios';

export async function sendOtpRequest(toEmail: string) {
  return axiosdb.post('/api/mail/otp', { toEmail });
}

export async function sendWelcomeRequest(toEmail: string) {
  return axiosdb.post('/api/mail/welcome', { toEmail });
}

export async function sendForgotPasswordRequest(email: string) {
  return axiosdb.post('/api/mail/forgot-password', { email });
}
