import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.habitize',
  appName: 'Habitize',
  webDir: 'out',
  server : {
    androidScheme : 'https'
  }
};

export default config;
