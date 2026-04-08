import {type ApplicationRef, provideZonelessChangeDetection} from '@angular/core';
import {createCustomElement} from '@angular/elements';
import {createApplication} from '@angular/platform-browser';
import {ExAtomClasses} from './examples/atoms/ex-atom-classes';
import {ExProtoButtonLoading} from './examples/protos/ex-proto-button-loading';

const EXAMPLES = [
  {component: ExProtoButtonLoading, name: 'ex-proto-button-loading'},
  {component: ExAtomClasses, name: 'ex-atom-classes'},
] as const;

void (async () => {
  const app: ApplicationRef = await createApplication({
    providers: [provideZonelessChangeDetection()],
  });

  for (const {component, name} of EXAMPLES) {
    const element = createCustomElement(component, {
      injector: app.injector as never,
    });

    if (!customElements.get(name)) {
      customElements.define(name, element);
    }
  }

  if (ngDevMode) {
    console.log(
      '[Terse UI Examples] Registered custom elements:',
      EXAMPLES.map((d) => d.name),
    );
  }
})();
