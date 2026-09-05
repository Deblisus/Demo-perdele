import {
  FanCourierConfig,
  CreateAwbPayload,
  AwbResponseSchema,
  TrackingResponseSchema,
  LocalitySchema,
  LoginResponseSchema,
  AwbResponse,
  TrackingResponse,
  Locality
} from './types';
import { z } from 'zod';

export class FanCourierError extends Error {
  constructor(message: string, public statusCode?: number, public details?: unknown) {
    super(message);
    this.name = 'FanCourierError';
  }
}

export class FanCourierClient {
  private config: FanCourierConfig;
  private token: string | null = null;
  private tokenExpiry: number | null = null;
  private baseUrl = 'https://api.fancourier.ro';

  constructor(config: FanCourierConfig) {
    this.config = config;
  }

  private async authenticate(): Promise<void> {
    if (!this.config.username || !this.config.password) {
      throw new FanCourierError('Username and password are required for authentication');
    }

    const url = new URL(`${this.baseUrl}/login`);
    url.searchParams.append('username', this.config.username);
    url.searchParams.append('password', this.config.password);

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new FanCourierError(`Authentication failed with status ${response.status}`, response.status);
    }

    const rawData = await response.json();
    const result = LoginResponseSchema.safeParse(rawData);

    if (!result.success || result.data.status !== 'success') {
      throw new FanCourierError('Invalid authentication response format', response.status, !result.success ? result.error : result.data);
    }

    this.token = result.data.data.token;
    
    let expiresTime = Date.now() + 24 * 60 * 60 * 1000;
    if (result.data.data.expiresAt) {
        expiresTime = new Date(result.data.data.expiresAt).getTime();
    }
    this.tokenExpiry = expiresTime - 5 * 60 * 1000; // 5 minute buffer
  }

  private async getToken(): Promise<string> {
    if (!this.token || !this.tokenExpiry || Date.now() >= this.tokenExpiry) {
      await this.authenticate();
    }
    return this.token!;
  }

  private async fetchWithAuth(endpoint: string, options: RequestInit = {}, retries = 1): Promise<Response> {
    const token = await this.getToken();
    
    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${token}`);
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers
    });

    if (response.status === 401 && retries > 0) {
      this.token = null;
      return this.fetchWithAuth(endpoint, options, retries - 1);
    }

    return response;
  }

  /**
   * Create a new AWB
   */
  async createAwb(payload: CreateAwbPayload): Promise<AwbResponse> {
    const requestBody = {
      clientId: this.config.clientId,
      shipments: [
        {
          info: {
            service: payload.service,
            packages: {
              parcel: payload.parcels || 0,
              envelope: payload.envelopes || 0
            },
            weight: payload.weight,
            cod: payload.cod,
            declaredValue: payload.declaredValue,
            payment: payload.payment || 'expeditor',
            content: payload.content,
            observation: payload.observation,
            options: payload.options,
            dimensions: payload.dimensions ? {
              length: payload.dimensions.length,
              width: payload.dimensions.width,
              height: payload.dimensions.height
            } : undefined
          },
          recipient: {
            name: payload.recipient.name,
            phone: payload.recipient.phone,
            email: payload.recipient.email,
            address: {
              county: payload.recipient.county,
              locality: payload.recipient.city,
              street: payload.recipient.street,
              streetNo: payload.recipient.streetNo,
              zipCode: payload.recipient.zipCode
            }
          }
        }
      ]
    };

    const response = await this.fetchWithAuth('/intern-awb', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new FanCourierError(`Failed to create AWB: ${response.statusText}`, response.status, errorText);
    }

    const data = await response.json();
    const result = AwbResponseSchema.safeParse(data);

    console.log('AWB Response:', JSON.stringify(data, null, 2));

    if (!result.success) {
      // Include the raw body in the *message*, not just `details` — callers
      // log `error.message`, so anything left in `details` is lost. Without
      // it a schema drift reads as a bare 'Failed to parse AWB response'.
      throw new FanCourierError(
        `Failed to parse AWB response: ${JSON.stringify(data).slice(0, 1000)}`,
        undefined,
        { issues: result.error, body: data }
      );
    }

    return result.data;
  }

  /**
   * Get AWB Label
   */
  async getAwbLabel(awbNumber: string, format = 'pdf'): Promise<Buffer> {
    const url = new URL(`${this.baseUrl}/awb/label`);
    url.searchParams.append('clientId', this.config.clientId);
    url.searchParams.append('awbs[]', awbNumber);
    if (format === 'pdf') {
      url.searchParams.append('pdf', '1');
    }

    const response = await this.fetchWithAuth(`${url.pathname}${url.search}`, {
      method: 'GET'
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new FanCourierError(`Failed to get AWB label: ${response.statusText}`, response.status, errorText);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Track AWB
   */
  async trackAwb(awbNumber: string): Promise<TrackingResponse[]> {
    const url = new URL(`${this.baseUrl}/reports/awb/tracking`);
    url.searchParams.append('clientId', this.config.clientId);
    url.searchParams.append('awb[]', awbNumber);

    const response = await this.fetchWithAuth(`${url.pathname}${url.search}`, {
      method: 'GET'
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new FanCourierError(`Failed to track AWB: ${response.statusText}`, response.status, errorText);
    }

    const data = await response.json();
    const targetData = data?.data || data;
    
    const arraySchema = z.array(TrackingResponseSchema);
    const result = arraySchema.safeParse(targetData);

    if (!result.success) {
       const singleResult = TrackingResponseSchema.safeParse(targetData);
       if (singleResult.success) {
           return [singleResult.data];
       }
      throw new FanCourierError('Failed to parse tracking response', undefined, result.error);
    }

    return result.data;
  }

  /**
   * Get Localities
   */
  async getLocalities(county?: string): Promise<Locality[]> {
    const url = new URL(`${this.baseUrl}/reports/localities`);
    if (county) {
      url.searchParams.append('county', county);
    }

    const response = await this.fetchWithAuth(`${url.pathname}${url.search}`, {
      method: 'GET'
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new FanCourierError(`Failed to get localities: ${response.statusText}`, response.status, errorText);
    }

    const data = await response.json();
    const targetData = data?.data || data;
    
    const arraySchema = z.array(LocalitySchema);
    const result = arraySchema.safeParse(targetData);

    if (!result.success) {
      throw new FanCourierError('Failed to parse localities response', undefined, result.error);
    }

    return result.data;
  }

  /**
   * Get Counties
   */
  async getCounties(): Promise<string[]> {
    const response = await this.fetchWithAuth(`/reports/counties`, {
      method: 'GET'
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new FanCourierError(`Failed to get counties: ${response.statusText}`, response.status, errorText);
    }

    const data = await response.json();
    const targetData = data?.data || data;
    
    const arraySchema = z.array(z.string());
    
    // In case counties are objects
    if (Array.isArray(targetData) && targetData.length > 0 && typeof targetData[0] === 'object') {
      const objSchema = z.array(z.object({ name: z.string().optional(), county: z.string().optional() }));
      const objResult = objSchema.safeParse(targetData);
      if (objResult.success) {
          return objResult.data.map(d => d.name || d.county || '').filter(Boolean);
      }
    }
    
    const result = arraySchema.safeParse(targetData);

    if (!result.success) {
      throw new FanCourierError('Failed to parse counties response', undefined, result.error);
    }

    return result.data;
  }
}
