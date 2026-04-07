# Host

## AutoHost

```ts
import {AutoHost} from '@terse-ui/core/utils/host';
```

## Usage

```ts
@AutoHost()
export class ThisOneInstancePerHostElement {}
```

This is what we had to do before Angular 22 de-deduplicated host directives.
