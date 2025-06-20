import axios from 'axios';

const baseurl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
const axiosdb = axios.create({
  baseURL: baseurl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export default axiosdb;