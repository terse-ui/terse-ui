import {HostAttributeToken, inject, runInInjectionContext} from '@angular/core';
import {staticCache} from '@terse-ui/core/internal';
import {autoHost} from './auto-host';

export const hostAttributes = autoHost('hostAttr', ({injector}) => {
  const cache = staticCache((key: string) =>
    runInInjectionContext(injector, () => inject(new HostAttributeToken(key), {optional: true})),
  );
  return (key: string) => cache(key);
});
