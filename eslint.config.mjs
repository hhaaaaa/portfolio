import { fileURLToPath } from 'node:url';

import { createConfig } from './config/eslint-base.mjs';

export default createConfig({
  rootDir: fileURLToPath(new URL('.', import.meta.url)),
  next: true,
});
