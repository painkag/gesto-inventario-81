import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.e3c36a1c17e84247a036f4db08857821',
  appName: 'gesto-inventario-81',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    url: 'https://e3c36a1c-17e8-4247-a036-f4db08857821.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      permissions: ['camera']
    },
    BarcodeScanner: {
      permissions: ['camera']
    }
  }
};

export default config;