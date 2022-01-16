# Mog

Opionated mini-ODM and collection of MongoDB utils. Mostly for use in my own projects but you might find it useful as a boilerplate CRM for small projects.

### Installation:
```
npm install -S @fdebijl/mog
```

### Usage:
Recommended usage is to have a file that exports a single instance of mog for use across an entire project. Simply import the configured instance of Mog in other files to use any of the exposed operations.

TS:
```ts
import { Mog } from '@fdebijl/mog';

export const mog = new Mog({
  url: 'mongodb://mongodb0.example.com:27017',
  db: 'sample',
  appName: 'Sample app',
  defaultCollection: 'users'
});
```

JS:
```js
const { Mog } = require('@fdebijl/mog');

export const mog = new Mog({
  url: 'mongodb://mongodb0.example.com:27017',
  db: 'sample',
  appName: 'Sample app',
  defaultCollection: 'users'
});
```