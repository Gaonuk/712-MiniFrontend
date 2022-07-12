// RainbowMagicConnector.ts

import { MagicConnector } from '@everipedia/wagmi-magic-connector';

export const rainbowMagicConnector = ({ chains }: any) => ({
  id: 'magic',
  name: 'Magic',
  iconUrl: 'https://svgshare.com/i/iJK.svg',
  iconBackground: '#fff',
  createConnector: () => {
    const connector = new MagicConnector({
      chains: chains,
      options: {
        apiKey: 'pk_live_BF03CC3A7FA007AA',
        oauthOptions: {
          providers: ['facebook', 'google', 'twitter'],
        }
      },
    });
    return {
      connector,
    };
  },
});