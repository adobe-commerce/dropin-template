import { render } from './render';

describe('render', () => {
  it('should render', async () => {
    const root = document.createElement('div');
    root.setAttribute('id', 'root');

    const Container = () => <div>container</div>;

    await render.render(Container, {})(root);

    expect(root.innerHTML).toBe(
      '<div class="elsie-base-design"><div>container</div></div>'
    );
  });
});
