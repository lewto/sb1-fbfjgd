import axios, { AxiosError } from 'axios';
import { LIFXDevice, LIFXState } from '../types/lifx';

const LIFX_API_URL = 'https://api.lifx.com/v1';
const REQUEST_TIMEOUT = 30000; // Increased to 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;
const MIN_STATE_INTERVAL = 50;

class LIFXService {
  private token: string | null = null;
  private retryCount: number = 0;
  private connectedDevices: Map<string, LIFXDevice> = new Map();
  private lastStateUpdate: Map<string, number> = new Map();
  private stateQueue: Map<string, LIFXState[]> = new Map();

  setToken(token: string | null) {
    console.log('Setting LIFX token:', token ? 'Token provided' : 'No token');
    this.token = token;
    if (token) {
      localStorage.setItem('lifx_token', token);
      // Clear device caches on new token
      this.connectedDevices.clear();
      this.lastStateUpdate.clear();
      this.stateQueue.clear();
    } else {
      localStorage.removeItem('lifx_token');
    }
  }

  getToken(): string | null {
    const token = this.token || localStorage.getItem('lifx_token');
    return token;
  }

  disconnect() {
    console.log('Disconnecting LIFX service');
    this.token = null;
    localStorage.removeItem('lifx_token');
    this.connectedDevices.clear();
    this.lastStateUpdate.clear();
    this.stateQueue.clear();
  }

  private getHeaders() {
    const token = this.getToken();
    if (!token) {
      throw new Error('LIFX API token not set');
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  private async makeRequest<T>(endpoint: string, config: any = {}): Promise<T> {
    const url = `${LIFX_API_URL}${endpoint}`;
    const headers = this.getHeaders();

    try {
      console.log(`Making LIFX API request to: ${url}`);
      console.log('Request config:', {
        ...config,
        headers: { Authorization: 'Bearer [hidden]' }
      });

      const response = await axios({
        ...config,
        url,
        headers,
        timeout: REQUEST_TIMEOUT,
        timeoutErrorMessage: 'LIFX API request timed out. Please check your network connection and try again.'
      });

      this.retryCount = 0;
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('LIFX API error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });

        if (error.response?.status === 401) {
          throw new Error('Invalid LIFX API token');
        }

        if (error.code === 'ECONNABORTED') {
          throw new Error('Connection timed out. Please check your network and try again.');
        }

        if (this.retryCount < MAX_RETRIES) {
          this.retryCount++;
          const delay = RETRY_DELAY * Math.pow(2, this.retryCount - 1);
          console.log(`Retrying request (attempt ${this.retryCount} of ${MAX_RETRIES}) after ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.makeRequest(endpoint, config);
        }
      }
      throw error;
    }
  }

  async getLights(): Promise<LIFXDevice[]> {
    console.log('Getting LIFX lights');
    const devices = await this.makeRequest<LIFXDevice[]>('/lights/all');
    
    // Update connected devices cache
    devices.forEach(device => {
      this.connectedDevices.set(device.id, device);
    });

    return devices;
  }

  private validateDevice(deviceId: string): LIFXDevice | null {
    const device = this.connectedDevices.get(deviceId);
    if (!device) {
      console.warn(`Device ${deviceId} not found in cache`);
      return null;
    }
    if (!device.connected) {
      console.warn(`Device ${deviceId} is not connected`);
      return null;
    }
    return device;
  }

  private async applyState(selector: string, state: LIFXState): Promise<void> {
    const now = Date.now();
    const lastUpdate = this.lastStateUpdate.get(selector) || 0;

    if (now - lastUpdate < MIN_STATE_INTERVAL) {
      // Queue the state change
      const queue = this.stateQueue.get(selector) || [];
      queue.push(state);
      this.stateQueue.set(selector, queue);
      return;
    }

    try {
      await this.makeRequest(`/lights/${selector}/state`, {
        method: 'PUT',
        data: state
      });
      this.lastStateUpdate.set(selector, now);

      // Process queued states
      const queue = this.stateQueue.get(selector) || [];
      if (queue.length > 0) {
        const nextState = queue.shift();
        this.stateQueue.set(selector, queue);
        if (nextState) {
          setTimeout(() => this.applyState(selector, nextState), MIN_STATE_INTERVAL);
        }
      }
    } catch (error) {
      console.error(`Failed to apply state to ${selector}:`, error);
      throw error;
    }
  }

  async setState(selector: string, state: LIFXState): Promise<void> {
    if (!selector) {
      console.error('setState: No selector provided');
      throw new Error('No lights selected');
    }

    // Validate all devices in selector
    const deviceIds = selector.split(',');
    const validDevices = deviceIds.filter(id => this.validateDevice(id));

    if (validDevices.length === 0) {
      throw new Error('No valid devices found');
    }

    // Use only valid devices in selector
    const validSelector = validDevices.join(',');
    console.log('Setting state for selector:', validSelector);
    console.log('State to apply:', state);

    await this.applyState(validSelector, state);
  }

  async setGreenFlag(selector: string, isInitial: boolean = false): Promise<void> {
    console.log('Setting green flag for selector:', selector);
    
    try {
      // Initial bright green at 100% brightness for 5 seconds
      await this.setState(selector, {
        power: 'on',
        color: { hue: 120, saturation: 1, kelvin: 3500 },
        brightness: 1,
        duration: 0.1
      });

      // Wait 5 seconds
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Fade to 50% brightness
      await this.setState(selector, {
        power: 'on',
        color: { hue: 120, saturation: 1, kelvin: 3500 },
        brightness: 0.5,
        duration: 1.0
      });
    } catch (error) {
      console.error('Error setting green flag:', error);
      throw error;
    }
  }

  async setRedFlag(selector: string): Promise<void> {
    console.log('Setting red flag for selector:', selector);
    
    try {
      // Initial bright red
      await this.setState(selector, {
        power: 'on',
        color: { hue: 0, saturation: 1, kelvin: 3500 },
        brightness: 1,
        duration: 0.1
      });

      // Pulse effect
      await this.makeRequest(`/lights/${selector}/effects/pulse`, {
        method: 'POST',
        data: {
          color: { hue: 0, saturation: 1, brightness: 1, kelvin: 3500 },
          from_color: { hue: 0, saturation: 1, brightness: 0.3, kelvin: 3500 },
          period: 0.5,
          cycles: 6,
          power_on: true
        }
      });

      // Set final state
      await this.setState(selector, {
        power: 'on',
        color: { hue: 0, saturation: 1, kelvin: 3500 },
        brightness: 1,
        duration: 0.1
      });
    } catch (error) {
      console.error('Error setting red flag:', error);
      throw error;
    }
  }

  async setYellowFlag(selector: string): Promise<void> {
    console.log('Setting yellow flag for selector:', selector);
    
    try {
      await this.setState(selector, {
        power: 'on',
        color: { hue: 60, saturation: 1, kelvin: 3500 },
        brightness: 1,
        duration: 0.1
      });
    } catch (error) {
      console.error('Error setting yellow flag:', error);
      throw error;
    }
  }

  async setSafetyCarFlag(selector: string): Promise<void> {
    console.log('Setting safety car flag for selector:', selector);
    
    try {
      // Initial yellow
      await this.setState(selector, {
        power: 'on',
        color: { hue: 60, saturation: 1, kelvin: 3500 },
        brightness: 1,
        duration: 0.1
      });

      // Pulse effect
      await this.makeRequest(`/lights/${selector}/effects/pulse`, {
        method: 'POST',
        data: {
          color: { hue: 60, saturation: 1, brightness: 1, kelvin: 3500 },
          from_color: { hue: 60, saturation: 1, brightness: 0.3, kelvin: 3500 },
          period: 0.5,
          cycles: 6,
          power_on: true
        }
      });

      // Set final state
      await this.setState(selector, {
        power: 'on',
        color: { hue: 60, saturation: 1, kelvin: 3500 },
        brightness: 1,
        duration: 0.1
      });
    } catch (error) {
      console.error('Error setting safety car flag:', error);
      throw error;
    }
  }

  async setCheckeredFlag(selector: string): Promise<void> {
    console.log('Setting checkered flag for selector:', selector);
    
    try {
      // Rapid white flashing effect
      await this.makeRequest(`/lights/${selector}/effects/pulse`, {
        method: 'POST',
        data: {
          color: { hue: 0, saturation: 0, brightness: 1, kelvin: 9000 },
          from_color: { hue: 0, saturation: 0, brightness: 0, kelvin: 2500 },
          period: 0.3,
          cycles: 10,
          power_on: true
        }
      });

      // Wait for flashing to complete (3 seconds)
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Set to green flag state (50% brightness)
      await this.setState(selector, {
        power: 'on',
        color: { hue: 120, saturation: 1, kelvin: 3500 },
        brightness: 0.5,
        duration: 1.0
      });
    } catch (error) {
      console.error('Error setting checkered flag:', error);
      throw error;
    }
  }
}

export const lifxService = new LIFXService();