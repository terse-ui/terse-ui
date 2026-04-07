import {HostAttributeToken, inject, INJECTOR, runInInjectionContext} from '@angular/core';
import {staticCache} from '@terse-ui/core/internal';
import {AutoHost} from './auto-host';

@AutoHost()
export class HostAttributes {
  readonly #injector = inject(INJECTOR);

  readonly #cache = staticCache((key: string) =>
    runInInjectionContext(this.#injector, () =>
      inject(new HostAttributeToken(key), {optional: true}),
    ),
  );

  get(key: string) {
    return this.#cache(key);
  }
}
