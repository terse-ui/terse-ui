import {existsSync, watch} from 'fs';
import {resolve} from 'path';
import type {Plugin} from 'vitepress';

export function examplesWatcher(): Plugin {
  return {
    name: 'examples-watcher',
    apply: 'serve',
    configureServer(server) {
      const examplesPath = resolve(process.cwd(), 'apps/docs/public/examples');

      if (!existsSync(examplesPath)) {
        console.warn(`[examples-watcher] Examples directory not found: ${examplesPath}`);
        return;
      }

      const watcher = watch(examplesPath, {recursive: true}, (_, filename) => {
        if (filename && (filename.endsWith('.js') || filename.endsWith('.js.map'))) {
          server.ws.send({type: 'full-reload'});
          console.log(`[examples-watcher] Detected change in ${filename}, reloading page...`);
        }
      });

      watcher.on('error', (error) => {
        console.error('[examples-watcher] Error watching examples directory:', error);
      });

      server.httpServer?.once('close', () => {
        watcher.close();
      });
    },
  };
}
