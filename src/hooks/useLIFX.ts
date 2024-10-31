import { useState, useEffect, useCallback } from 'react';
import { lifxService } from '../services/lifx';
import { LIFXDevice } from '../types/lifx';

export const useLIFX = () => {
  const [devices, setDevices] = useState<LIFXDevice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedDevices, setSelectedDevices] = useState<Set<string>>(() => {
    const savedDevices = localStorage.getItem('selected_devices');
    return new Set(savedDevices ? JSON.parse(savedDevices) : []);
  });

  const fetchDevices = useCallback(async () => {
    if (!lifxService.getToken()) {
      setLoading(false);
      setIsConnected(false);
      return;
    }

    try {
      const fetchedDevices = await lifxService.getLights();
      setDevices(fetchedDevices);
      setIsConnected(true);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to LIFX';
      setError(errorMessage);
      setIsConnected(false);
      setDevices([]);
      
      if (errorMessage.includes('Invalid LIFX API token')) {
        lifxService.disconnect();
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const initialize = useCallback(async (token: string) => {
    console.log('Initializing LIFX with token');
    setLoading(true);
    setError(null);
    try {
      lifxService.setToken(token);
      await fetchDevices();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize LIFX connection';
      console.error('LIFX initialization error:', errorMessage);
      setError(errorMessage);
      setIsConnected(false);
      
      if (errorMessage.includes('Invalid LIFX API token')) {
        lifxService.disconnect();
      }
    } finally {
      setLoading(false);
    }
  }, [fetchDevices]);

  const toggleDevice = useCallback(async (deviceId: string) => {
    const newSelectedDevices = new Set(selectedDevices);
    if (newSelectedDevices.has(deviceId)) {
      newSelectedDevices.delete(deviceId);
    } else {
      newSelectedDevices.add(deviceId);
    }
    setSelectedDevices(newSelectedDevices);
    localStorage.setItem('selected_devices', JSON.stringify(Array.from(newSelectedDevices)));
  }, [selectedDevices]);

  const setFlag = useCallback(async (flagType: 'green' | 'yellow' | 'red' | 'safety' | 'checkered', isInitial: boolean = false) => {
    if (!isConnected || selectedDevices.size === 0) {
      console.warn('Cannot set flag: LIFX not connected or no devices selected');
      return;
    }

    const selector = Array.from(selectedDevices).join(',');
    console.log(`Setting ${flagType} flag for devices: ${selector}`);
    setError(null);

    try {
      switch (flagType) {
        case 'green':
          await lifxService.setGreenFlag(selector, isInitial);
          break;
        case 'red':
          await lifxService.setRedFlag(selector);
          break;
        case 'yellow':
          await lifxService.setYellowFlag(selector);
          break;
        case 'safety':
          await lifxService.setSafetyCarFlag(selector);
          break;
        case 'checkered':
          await lifxService.setCheckeredFlag(selector);
          break;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set flag';
      console.error('Failed to set flag:', errorMessage);
      setError(errorMessage);
      
      if (errorMessage.includes('Invalid LIFX API token')) {
        lifxService.disconnect();
        setIsConnected(false);
      }
    }
  }, [isConnected, selectedDevices]);

  const disconnect = useCallback(async () => {
    console.log('Disconnecting LIFX');
    lifxService.disconnect();
    setIsConnected(false);
    setDevices([]);
    setSelectedDevices(new Set());
    setError(null);
  }, []);

  useEffect(() => {
    const token = lifxService.getToken();
    if (token && !isConnected && !loading) {
      console.log('Auto-initializing LIFX with saved token');
      initialize(token);
    }
  }, [initialize, isConnected, loading]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isConnected && !loading) {
      interval = setInterval(fetchDevices, 30000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isConnected, fetchDevices, loading]);

  return {
    devices,
    loading,
    error,
    isConnected,
    initialize,
    setFlag,
    selectedDevices,
    toggleDevice,
    disconnect
  };
};

export default useLIFX;