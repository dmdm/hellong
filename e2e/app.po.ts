import { browser, element, by } from 'protractor';

export class HellongPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('pym-root h1')).getText();
  }
}
