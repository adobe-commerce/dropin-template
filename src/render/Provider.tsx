import { FunctionComponent } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { UIProvider } from '@adobe-commerce/elsie/components';
import { Lang } from '@adobe-commerce/elsie/i18n';
import { events } from '@adobe-commerce/event-bus';
import { deepmerge } from '@adobe-commerce/elsie/lib';
import { config } from '@/dropin-name/api';

import en_US from '../i18n/en_US.json';

// Langs
const langDefinitions = {
  default: en_US,
};

interface ProviderProps {
  children?: any;
}

export const Provider: FunctionComponent<ProviderProps> = ({
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

  const userLangDefinitions = config.getConfig()?.langDefinitions;

  const definitions = deepmerge(langDefinitions, userLangDefinitions ?? {});

  return (
    <UIProvider lang={lang} langDefinitions={definitions}>
      {children}
    </UIProvider>
  );
};
