import React, { useState } from 'react';
import { useLIFX } from '../hooks/useLIFX';
import { AlertTriangle, Save, Power, ExternalLink } from 'lucide-react';

const LIFXSetup = () => {
  const [token, setToken] = useState('');
  const { initialize, disconnect, isConnected, error } = useLIFX();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    initialize(token);
  };

  const handleDisconnect = () => {
    disconnect();
    setToken('');
  };

  if (isConnected) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-[#1A1F35] p-4 rounded-lg border border-[#1E2642]">
          <div>
            <div className="text-white font-medium">LIFX Connected</div>
            <div className="text-sm text-gray-400 mt-1">Your LIFX account is connected and ready</div>
          </div>
          <button
            onClick={handleDisconnect}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
          >
            <Power className="w-4 h-4" />
            <span>Disconnect</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Token Link Card */}
      <div className="bg-[#1A1F35] p-4 rounded-lg border border-race-blue-500/50">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-white font-medium">Get Your LIFX Token</h3>
            <p className="text-sm text-gray-400 mt-1">
              Generate your API token from the LIFX Cloud Settings page
            </p>
          </div>
          <a
            href="https://cloud.lifx.com/settings"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-4 py-2 bg-race-blue-500 text-white rounded-lg hover:bg-race-blue-600 transition-colors ml-4"
          >
            <span>Open LIFX Cloud</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div>
        <label htmlFor="lifx-token" className="block text-sm font-medium text-gray-300">
          LIFX API Token
        </label>
        <input
          type="password"
          id="lifx-token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-race-blue-500 focus:ring-race-blue-500"
          placeholder="Enter your LIFX API token"
        />
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Save className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-yellow-500 font-medium">Important: Save Your Token</p>
            <p className="text-yellow-400 mt-1">
              LIFX tokens cannot be viewed after creation. Before leaving the LIFX website:
            </p>
            <ol className="mt-2 space-y-1 text-yellow-400 list-decimal ml-4">
              <li>Copy your new token</li>
              <li>Save it in a secure text file</li>
              <li>Store it somewhere safe</li>
            </ol>
            <p className="text-yellow-400 mt-2">
              If you lose your token, you'll need to generate a new one and reconnect.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-500 p-4 rounded-lg flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Connection Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-race-blue-500 hover:bg-race-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-race-blue-500"
      >
        Connect LIFX
      </button>
    </form>
  );
};

export default LIFXSetup;