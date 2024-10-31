import React, { useState } from 'react';
import { Lightbulb, Power, Info, X, AlertTriangle, Settings as SettingsIcon, CheckCircle2, Globe } from 'lucide-react';
import { useLIFX } from '../hooks/useLIFX';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

// Socket standards by region
const SOCKET_STANDARDS = {
  'North America': ['A19', 'BR30', 'PAR30'],
  'Europe/UK': ['E27', 'B22', 'GU10'],
  'Australia/NZ': ['B22', 'E27', 'GU10'],
  'Asia': ['E27', 'B22']
};

const LightControl = () => {
  const { devices, loading, error, selectedDevices, toggleDevice } = useLIFX();
  const [removingDevice, setRemovingDevice] = useState<string | null>(null);
  const [hiddenDevices, setHiddenDevices] = useState<Set<string>>(new Set());
  const [showSocketInfo, setShowSocketInfo] = useState(false);

  const handleToggleAll = () => {
    const visibleDeviceIds = visibleDevices.map(device => device.id);
    const allSelected = visibleDeviceIds.every(id => selectedDevices.has(id));

    visibleDeviceIds.forEach(id => {
      if (allSelected && selectedDevices.has(id)) {
        toggleDevice(id);
      } else if (!allSelected && !selectedDevices.has(id)) {
        toggleDevice(id);
      }
    });
  };

  const visibleDevices = devices.filter(device => !hiddenDevices.has(device.id));

  if (loading) {
    return (
      <div className="bg-[#0D1119] rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0D1119] rounded-xl p-6 relative">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Lightbulb className="w-5 h-5 text-race-blue-500" />
            <h2 className="text-lg font-semibold text-white">Light Control</h2>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowSocketInfo(!showSocketInfo)}
              className="p-2 rounded-lg hover:bg-[#1A1F35] transition-colors"
              title="Socket Standards Info"
            >
              <Globe className="w-4 h-4 text-gray-400" />
            </button>
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-[#151A2D] rounded-lg border border-[#1E2642]">
              <Power className={cn(
                "w-4 h-4 transition-colors",
                visibleDevices.length ? 'text-[#34C759]' : 'text-gray-500'
              )} />
              <span className="text-sm text-gray-400">
                {selectedDevices.size} of {visibleDevices.length}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">Select lights to control with race flags</p>
          <button
            onClick={handleToggleAll}
            disabled={visibleDevices.length === 0}
            className={cn(
              "flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200",
              visibleDevices.length === selectedDevices.size
                ? "bg-[#34C759]/10 text-[#34C759] hover:bg-[#34C759]/20 border border-[#34C759]/20"
                : "bg-[#1A1F35] text-gray-400 hover:text-white hover:bg-[#1E2642] border border-[#1E2642]",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-medium">
              {visibleDevices.length === selectedDevices.size ? 'Deselect All' : 'Select All'}
            </span>
          </button>
        </div>
      </div>

      {showSocketInfo && (
        <div className="mb-6 bg-[#151A2D] p-5 rounded-lg border border-[#1E2642]">
          <div className="flex items-start space-x-3">
            <Globe className="w-5 h-5 text-race-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-white mb-3">LIFX Socket Standards by Region</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(SOCKET_STANDARDS).map(([region, sockets]) => (
                  <div key={region} className="bg-[#1A1F35] p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-race-blue-500 mb-2">{region}</h4>
                    <div className="flex flex-wrap gap-2">
                      {sockets.map(socket => (
                        <span key={socket} className="text-xs bg-[#151A2D] text-gray-400 px-2 py-1 rounded">
                          {socket}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-500/10 text-red-500 p-4 rounded-lg flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Connection Error</p>
            <p className="text-sm mt-1">{error}</p>
            <Link 
              to="/settings" 
              className="inline-flex items-center space-x-2 text-sm mt-3 text-blue-500 hover:text-blue-400 transition-colors"
            >
              <SettingsIcon className="w-4 h-4" />
              <span>Check LIFX Connection</span>
            </Link>
          </div>
        </div>
      )}

      {visibleDevices.length > 0 && (
        <div className="bg-[#151A2D] p-5 rounded-lg border border-[#1E2642] mb-6">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-race-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-white mb-3">To identify your lights:</h3>
              <ol className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center space-x-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#1A1F35] flex items-center justify-center text-xs text-gray-400">1</span>
                  <span>Check your LIFX app for the exact names of your lights</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#1A1F35] flex items-center justify-center text-xs text-gray-400">2</span>
                  <span>Match the names and groups shown below</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#1A1F35] flex items-center justify-center text-xs text-gray-400">3</span>
                  <span>Click to add or remove lights from control</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {visibleDevices.map(device => (
          <div
            key={device.id}
            className={`relative flex items-center justify-between p-4 rounded-lg transition-all duration-200 ${
              selectedDevices.has(device.id)
                ? 'bg-[#1A1F35] ring-1 ring-white/20'
                : 'bg-[#151A2D]'
            } border border-[#1E2642] group`}
          >
            <button
              className="flex-1 flex items-center justify-between"
              onClick={() => toggleDevice(device.id)}
            >
              <div className="flex items-center space-x-3">
                <Lightbulb 
                  className={selectedDevices.has(device.id) ? 'text-[#34C759]' : 'text-gray-400'} 
                  size={16}
                />
                <div className="text-left">
                  <span className="text-white text-sm block">{device.label}</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-400">
                      Group: {device.group.name}
                    </span>
                    <span className="text-gray-600">•</span>
                    <span className="text-xs text-gray-400">
                      Location: {device.location.name}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${device.connected ? 'bg-[#34C759]' : 'bg-gray-500'}`} />
                <span className={`text-xs ${selectedDevices.has(device.id) ? 'text-[#34C759]' : 'text-gray-400'}`}>
                  {selectedDevices.has(device.id) ? 'ADDED' : 'NOT ADDED'}
                </span>
              </div>
            </button>
            <button
              onClick={() => setRemovingDevice(device.id)}
              className="ml-4 p-1.5 rounded-lg hover:bg-[#FF3B30]/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
            >
              <X className="w-4 h-4 text-[#FF3B30]" />
            </button>
          </div>
        ))}

        {visibleDevices.length === 0 && (
          <div className="text-center py-8">
            <Lightbulb className="h-8 w-8 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">No LIFX devices found</p>
            <p className="text-sm text-gray-500 mt-1">
              Make sure your lights are:
            </p>
            <ul className="text-sm text-gray-500 mt-2 space-y-1">
              <li>• Connected to Wi-Fi</li>
              <li>• Added to your LIFX account</li>
              <li>• Using the correct API key</li>
            </ul>
            <Link
              to="/settings"
              className="inline-flex items-center space-x-2 text-blue-500 hover:text-blue-400 mt-4 transition-colors"
            >
              <SettingsIcon className="w-4 h-4" />
              <span>Check LIFX Connection</span>
            </Link>
          </div>
        )}
      </div>

      {removingDevice && (
        <RemoveConfirm
          deviceLabel={devices.find(d => d.id === removingDevice)?.label || ''}
          onConfirm={() => handleRemove(removingDevice)}
          onCancel={() => setRemovingDevice(null)}
        />
      )}
    </div>
  );
};

export default LightControl;