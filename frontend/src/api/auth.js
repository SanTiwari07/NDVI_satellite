/** api/auth.js — POST /auth/login and POST /auth/signup */
import api from './index';

export const login = (mobile_number, password) =>
  api.post('/auth/login', { mobile_number, password }).then((r) => r.data);

export const signup = (mobile_number, password, name = null) =>
  api.post('/auth/signup', { mobile_number, password, ...(name ? { name } : {}) }).then((r) => r.data);

export const sendOtp = (phone) =>
  fetch('/api/auth/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  }).then(async (r) => {
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || `Error ${r.status}`);
    return d;
  });

export const verifyOtp = (phone, otp) =>
  fetch('/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, otp }),
  }).then(async (r) => {
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || `Error ${r.status}`);
    return d;
  });
