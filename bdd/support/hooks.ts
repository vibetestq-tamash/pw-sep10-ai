import { Before, After, setDefaultTimeout } from '@cucumber/cucumber';
import { HrmWorld } from './world';

setDefaultTimeout(30000);

Before(async function (this: HrmWorld) {
  await this.launch();
});

After(async function (this: HrmWorld) {
  await this.close();
});
