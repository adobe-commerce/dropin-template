import { FunctionComponent } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { UIProvider } from '@adobe-commerce/elsie/components';
import { Lang } from '@adobe-commerce/elsie/i18n';
import { events } from '@adobe-commerce/event-bus';

import en_US from '../i18n/en_US.json';

// Langs
const langDefinitions = {
  default: en_US,
};

interface CartProviderProps {
  children?: any;
}

export const Provider: FunctionComponent<CartProviderProps> = ({
  children,
}) => {
  const [lang, setLang] = useState<Lang>('en_US');

  //   Events
  useEffect(() => {
    const localeEvent = events.on(
      'locale',
      (locale: string) => {
        setLang(locale as Lang);
      },
      { eager: true }
    );
    return () => {
      localeEvent?.off();
    };
  }, []);

  return (
    <UIProvider lang={lang} langDefinitions={langDefinitions}>
      {children}
    </UIProvider>
  );
};
