import { DocsPage, DocsContainer } from '@storybook/addon-docs';
import { setEndpoint } from '@adobe/fetch-graphql';
import { events } from '@adobe/event-bus';
import { Provider } from '../src/render/Provider';
import { initialize as pkg } from '../src/api';

// Initialize GraphQl Client
setEndpoint(process.env.ENDPOINT);

// Enable events logger
events.enableLogger(true);

// Initialize
initializers.register(pkg);

window.addEventListener('load', initializers.mount);

export const decorators = [
  (Story) => {
    return (
      <Provider>
        <Story />
      </Provider>
    );
  },
];

export const parameters = {
  options: {
    storySort: {
      order: [
        '*',
        [
          'Getting Started',
          'Foundations',
          'Buttons',
          ['Design Tokens', 'Assets', '*'],
          'Selection Controls',
          'Containment',
          'Media',
          'Patterns',
          'Tools',
          'Components',
          'Containers',
          '*',
        ],
        '*',
      ],
    },
  },
  docs: {
    container: (props) => {
      return (
        <Provider>
          <DocsContainer {...props} />
        </Provider>
      );
    },
    page: DocsPage,
  },
};
