import { DocsPage, DocsContainer } from '@storybook/addon-docs';
import { setEndpoint } from '@adobe/fetch-graphql';
import { initializers } from '@adobe/elsie/lib';
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
  options: {
    storySort: {
      order: [
        'Quick start',
        'Starter project',
        'CLI usage',
        'Host examples',
        ['Html host', 'React host', 'Vue host', '*'],
        'Base Design',
        [
          'Customizing Base',
          'Design tokens',
          ['Overview', 'Colors', 'Typography', 'Spacing', 'Shape styles', '*'],
          'Accessibility',
          '*',
        ],
        'Components',

        'API',
        ['Initializer', 'Render', 'Fetch GraphQL', 'Event Bus', '*'],
        'Utilities',
        [
          'classList',
          'debounce',
          'deepmerge',
          'getFormValues',
          'getFormErrors',
          '*',
        ],
      ],
    },
  },
};
