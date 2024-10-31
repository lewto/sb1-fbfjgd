import React from 'react';
import { Flag, AlertTriangle, AlertOctagon, Car, Square, Radio } from 'lucide-react';
import { useLIFX } from '../hooks/useLIFX';
import { cn } from '../lib/utils';

const TestApiControls: React.FC = () => {
  const { setFlag, isConnected, selectedDevices } = useLIFX();

  const handleFlagClick = async (flagType: string) => {
    if (!isConnected || selectedDevices.size === 0) {
      console.warn('LIFX not connected or no devices selected');
      return;
    }

    try {
      console.log(`Setting flag: ${flagType}`);
      await setFlag(flagType as any);
    } catch (error) {
      console.error('Failed to set test flag:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Track Flags */}
      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-3">Track Flags</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleFlagClick('green')}
            className={cn(
              'flex items-center justify-center space-x-2 p-3 rounded-lg transition-colors',
              'bg-[#1A1F35] hover:bg-[#1E2642] border border-[#1E2642]'
            )}
          >
            <Flag className="w-4 h-4 text-[#34C759]" />
            <span className="text-[#34C759]">Green Flag</span>
          </button>

          <button
            onClick={() => handleFlagClick('red')}
            className={cn(
              'flex items-center justify-center space-x-2 p-3 rounded-lg transition-colors',
              'bg-[#1A1F35] hover:bg-[#1E2642] border border-[#1E2642]'
            )}
          >
            <AlertOctagon className="w-4 h-4 text-[#FF3B30]" />
            <span className="text-[#FF3B30]">Red Flag</span>
          </button>

          <button
            onClick={() => handleFlagClick('yellow')}
            className={cn(
              'flex items-center justify-center space-x-2 p-3 rounded-lg transition-colors',
              'bg-[#1A1F35] hover:bg-[#1E2642] border border-[#1E2642]'
            )}
          >
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <span className="text-yellow-500">Yellow Flag</span>
          </button>

          <button
            onClick={() => handleFlagClick('checkered')}
            className={cn(
              'flex items-center justify-center space-x-2 p-3 rounded-lg transition-colors',
              'bg-[#1A1F35] hover:bg-[#1E2642] border border-[#1E2642]'
            )}
          >
            <Square className="w-4 h-4 text-white" />
            <span className="text-white">Checkered Flag</span>
          </button>
        </div>
      </div>

      {/* Safety Car */}
      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-3">Safety Car</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleFlagClick('safety')}
            className={cn(
              'flex items-center justify-center space-x-2 p-3 rounded-lg transition-colors',
              'bg-[#1A1F35] hover:bg-[#1E2642] border border-[#1E2642]'
            )}
          >
            <Car className="w-4 h-4 text-orange-500" />
            <span className="text-orange-500">Safety Car</span>
          </button>

          <button
            onClick={() => handleFlagClick('safety')}
            className={cn(
              'flex items-center justify-center space-x-2 p-3 rounded-lg transition-colors',
              'bg-[#1A1F35] hover:bg-[#1E2642] border border-[#1E2642]'
            )}
          >
            <Radio className="w-4 h-4 text-orange-500" />
            <span className="text-orange-500">Virtual SC</span>
          </button>
        </div>
      </div>

      {/* Debug Info */}
      <div className="text-sm text-gray-400 bg-[#1A1F35] p-4 rounded-lg">
        <p>Connection Status:</p>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>LIFX Connected: {isConnected ? 'Yes' : 'No'}</li>
          <li>Selected Devices: {selectedDevices.size}</li>
        </ul>
      </div>
    </div>
  );
};

export default TestApiControls;