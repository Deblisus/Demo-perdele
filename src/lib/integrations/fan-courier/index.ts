import { FanCourierClient } from './client';

export * from './types';
export * from './client';
export * from './normalize';

// Use environment variables for the default singleton instance
const clientId = process.env.FAN_COURIER_CLIENT_ID || '';
const username = process.env.FAN_COURIER_USERNAME || '';
const password = process.env.FAN_COURIER_PASSWORD || '';

export const fanCourierClient = new FanCourierClient({
  clientId,
  username,
  password
});
