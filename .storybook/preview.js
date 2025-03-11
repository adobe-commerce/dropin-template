import { DocsPage, DocsContainer } from '@storybook/addon-docs';
import { initializers } from '@adobe-commerce/elsie/lib';
import { events } from '@adobe-commerce/event-bus';
import { Provider } from '../src/render/Provider';
import { initialize as pkg, setEndpoint } from '../src/api';

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
        '*',
        ['Getting Started', 'API', 'Containers', 'Components', '*'],
        'Base',
        [
          'Welcome',
          'Quick start',
          'CLI usage',
          'Foundations',
          [
            'Design tokens',
            [
              'Overview',
              'Colors',
              'Typography',
              'Spacing',
              'Shape styles',
              '*',
            ],
            '*',
          ],
          'Components',
          ['Overview', '*'],
          'API',
          ['Initializer', 'Render', 'Event Bus', '*'],
          'Host examples',
          ['Html host', 'React host', 'Vue host', '*'],
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
      ],
    },
  },
};
