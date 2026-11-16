import { Before, After, setDefaultTimeout } from '@cucumber/cucumber';
import { HrmWorld } from './world';

// Cucumber's default step timeout is 5 seconds; opening this app can take longer.
setDefaultTimeout(30000);

Before(async function (this: HrmWorld) {
  await this.launch();
});

After(async function (this: HrmWorld) {
  await this.close();
});
