# Composing Directives

Angular 22's host directive de-duplication means atoms stack without NG0309 errors. One directive, one instance per element — no matter how many paths lead to it. But there are rules to understand when composing directives in your own components.

## De-duplication Rules

When the same directive appears multiple times in a host directive tree, Angular creates exactly **one instance**. This works across:

- Multiple host directives wrapping the same child directive
- Inheritance chains (parent class has it, child class adds it again)
- Template + host directive collision (directive matches via selector AND via hostDirectives)
- Arbitrary depth (3+ levels of nesting)

```ts
@Directive({
  hostDirectives: [AtomInteract, AtomHover],
})
export class MenuTrigger {}

@Directive({
  hostDirectives: [AtomInteract, AtomFocus],
})
export class TooltipTrigger {}

// One AtomInteract instance. De-duplicated.
@Component({
  hostDirectives: [MenuTrigger, TooltipTrigger],
})
export class ActionButton {}
```

## Input Exposure

Host directive inputs are **not accessible from the template** unless explicitly exposed:

```ts
// AtomInteract's `disabled` is NOT bindable here
@Component({
  hostDirectives: [AtomInteract],
  template: `<ng-content />`,
})
export class MyButton {}

// Now it IS bindable: <my-button [disabled]="true">
@Component({
  hostDirectives: [{directive: AtomInteract, inputs: ['disabled']}],
  template: `<ng-content />`,
})
export class MyButton {}
```

You can alias inputs when exposing them:

```ts
hostDirectives: [{directive: AtomInteract, inputs: ['disabled:myDisabled']}];
// Usage: <my-button [myDisabled]="true">
```

Once aliased, the original name is inaccessible from the template. Aliasing is a rename.

## NG0312: Conflicting Input Names

The main constraint after de-duplication. When the same input is exposed under **different names** by two directives in the chain, Angular throws NG0312:

```ts
// FAILS — NG0312
@Component({
  hostDirectives: [
    {directive: ProtoButton, inputs: ['disabled']}, // exposes as 'disabled'
    {directive: AtomInteract, inputs: ['disabled:off']}, // exposes as 'off'
  ],
})
export class AppButton {}
```

The fix: use the same name everywhere, or only expose from one source:

```ts
// WORKS — same name from both sources
@Component({
  hostDirectives: [
    {directive: AtomInteract, inputs: ['disabled', 'disabledInteractive', 'tabIndex']},
    {directive: ProtoButton, inputs: ['role', 'type']},
  ],
})
export class AppButton {}
```

The same rule applies to outputs.

## Merging Non-Conflicting Configurations

When multiple host directives expose **different** inputs from the same underlying directive, the configurations merge:

```ts
@Directive({
  hostDirectives: [{directive: AtomInteract, inputs: ['disabled']}],
})
export class MenuTrigger {}

@Directive({
  hostDirectives: [{directive: AtomInteract, inputs: ['tabIndex']}],
})
export class TooltipTrigger {}

// Both inputs work — merged from different sources
@Component({
  hostDirectives: [MenuTrigger, TooltipTrigger],
})
export class ActionButton {}
// <action-button [disabled]="true" [tabIndex]="3">
```

Identical configurations also merge safely — exposing `['disabled']` from two sources is fine as long as the name matches.

## Binding Precedence

When the host component and a host directive both bind the same attribute:

| Host binding | Host directive binding | Winner          |
| ------------ | ---------------------- | --------------- |
| Static       | Static                 | Host (template) |
| Static       | Dynamic                | Dynamic wins    |
| Dynamic      | Static                 | Dynamic wins    |
| Dynamic      | Dynamic                | Host wins       |

In practice: the host component's `host: {}` bindings take precedence over host directive bindings when both are dynamic.

## Dependency Injection

Host directives participate in the element's DI container:

```ts
@Directive({
  hostDirectives: [AtomInteract, AtomFocus],
})
export class ProtoButton {
  // Host can inject its host directives
  readonly #interact = inject(AtomInteract);
  readonly #focus = inject(AtomFocus);
}
```

Host directives can also inject their host:

```ts
export class AtomFocusTrap {
  // Host directive can inject the host it's attached to
  readonly #interact = inject(AtomInteract);
}
```

When both host and host directive provide the same DI token, the **host's provider wins**.

Child components can inject host directives from their parent — they're available in the component tree.

## Lifecycle Ordering

Host directives initialize **before** their host:

1. Deepest host directives (left to right)
2. Shallower host directives (left to right)
3. The host component itself
4. Any template-matched directives

`ngOnChanges` follows the same order — host directive changes fire before host component changes.

## Validation Errors

| Error  | Cause                                                                     |
| ------ | ------------------------------------------------------------------------- |
| NG0307 | Host directive class missing `@Directive` decorator                       |
| NG0308 | Host directive is not standalone (all host directives must be standalone) |
| NG0309 | Eliminated by de-duplication in Angular 22                                |
| NG0310 | Host directive is a component (only directives allowed)                   |
| NG0311 | Exposed input/output name doesn't exist on the directive                  |
| NG0312 | Same input/output exposed under conflicting alias names                   |

## The Correct Consumer Pattern

When using Terse UI atoms and protos in your components:

```ts
import {AtomFocus} from '@terse-ui/atoms/focus';
import {AtomHover} from '@terse-ui/atoms/hover';
import {AtomInteract} from '@terse-ui/atoms/interact';
import {ProtoButton} from '@terse-ui/protos/button';

@Component({
  selector: 'app-button',
  hostDirectives: [
    AtomFocus,
    AtomHover,
    {
      directive: AtomInteract,
      inputs: ['disabled', 'disabledInteractive', 'tabIndex'],
    },
    {
      directive: ProtoButton,
      inputs: ['role', 'type'],
    },
  ],
  template: `<ng-content />`,
})
export class AppButton {}
```

Map each input at the level where you want the consumer to control it. Inputs not listed in the `inputs` array are internal — not bindable from the template but still functional.
