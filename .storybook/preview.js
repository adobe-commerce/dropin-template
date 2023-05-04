import { DocsPage, DocsContainer } from '@storybook/addon-docs';
import { Provider } from '../src/render/Provider';

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

export const decorators = [
  (Story) => {
    return (
      <Provider>
        <Story />
      </Provider>
    );
  },
];
