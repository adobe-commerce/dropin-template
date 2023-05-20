import { FunctionComponent } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { UIProvider } from '@adobe/elsie/components';
import { Lang } from '@adobe/elsie/i18n';
import { events } from '@adobe/event-bus';

events.enableLogger(true);
// Langs
const langDefinitions = {
  default: require('../i18n/en_US.json'),
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
    const localeEvent = events.on('locale', (locale: string) => {
      setLang(locale as Lang);
    });
    return () => {
      localeEvent.off();
    };
  }, []);

  return (
    <UIProvider lang={lang} langDefinitions={langDefinitions}>
      {children}
    </UIProvider>
  );
};
