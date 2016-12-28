import { HellongPage } from './app.po';

describe('hellong App', function() {
  let page: HellongPage;

  beforeEach(() => {
    page = new HellongPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('pym works!');
  });
});
