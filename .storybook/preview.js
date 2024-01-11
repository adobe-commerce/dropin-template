import { DocsPage, DocsContainer } from '@storybook/addon-docs';
import { initializers } from '@adobe/elsie/lib';
import { events } from '@adobe/event-bus';
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
          'Examples',
          ['HTML host', 'React host', 'Vue host', '*'],
          'Components',
          ['Overview', '*'],
          'Design',
          ['Overview', 'Colors', 'Typography', 'Spacing', 'Shape styles', '*'],
          'API',
          ['Initializer', 'Render', 'Event Bus', '*'],
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
