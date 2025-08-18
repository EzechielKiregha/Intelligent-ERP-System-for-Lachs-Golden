import axiosdb from 'axios';

type SendEmailPayload = {
  service_id: string;
  template_id: string;
  user_id: string;
  template_params: Record<string, any>;
  accessToken?: string;
};

export async function sendEmailJS(payload: SendEmailPayload) {
  const { accessToken, ...bodyPayload } = payload;

  const headers: Record<string,string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const res = await axiosdb.post(
      'https://api.emailjs.com/api/v1.0/email/send',
      bodyPayload,
      {
        headers,
        timeout: 15000,
      }
    );

    return res.data;
  } catch (err: any) {
    const status = err.response?.status ?? 500;
    const body = err.response?.data ?? { message: err.message ?? 'Unknown error' };
    // keep the same throw shape your routes expect
    throw { status, body };
  }
}
