import { useEffect, useState } from 'react';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface TelegramWebAppData {
  query_id?: string;
  user?: TelegramUser;
  auth_date: number;
  hash: string;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        close: () => void;
        expand: () => void;
        sendData: (data: string) => void;
        initData: string;
        initDataUnsafe: TelegramWebAppData;
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
        };
        BackButton: {
          isVisible: boolean;
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
        };
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
          secondary_bg_color?: string;
        };
        colorScheme: 'light' | 'dark';
        viewportHeight: number;
        viewportStableHeight: number;
        isExpanded: boolean;
      };
    };
  }
}

export const useTelegramWebApp = () => {
  const [isReady, setIsReady] = useState(false);
  const [webApp, setWebApp] = useState<Window['Telegram']>()
  const [user, setUser] = useState<TelegramUser | null>(null);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      setWebApp(window.Telegram);

      if (tg.initDataUnsafe?.user) {
        setUser(tg.initDataUnsafe.user);
      }

      setIsReady(true);
    } else {
      setIsReady(true);
    }
  }, []);

  const sendData = (data: Record<string, any>) => {
    if (webApp?.WebApp) {
      webApp.WebApp.sendData(JSON.stringify(data));
    }
  };

  const ready = () => {
    webApp?.WebApp?.ready();
  };

  const expand = () => {
    webApp?.WebApp?.expand();
  };

  const close = () => {
    webApp?.WebApp?.close();
  };

  return {
    isReady,
    webApp: webApp?.WebApp,
    user,
    sendData,
    ready,
    expand,
    close,
    themeParams: webApp?.WebApp?.themeParams || {},
    colorScheme: webApp?.WebApp?.colorScheme || 'light'
  };
};