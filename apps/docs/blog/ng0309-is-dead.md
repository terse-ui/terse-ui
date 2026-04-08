---
outline: [2, 3]
---

# Angular Host Directive De-Duplication Just Landed. NG0309 Is Dead.

<p style="opacity: 0.6; margin-top: -0.25rem;">
  By Jeremy C. Zacharia
</p>

The golden age for Angular library authors has begun.

## The Diamond That Broke Composition

Angular introduced the Directive Composition API in v15 with a simple but powerful promise: declare `hostDirectives` on any component or directive and the framework will apply them for you. No template markup, no consumer boilerplate, no inheritance chains. Just composition.

It worked beautifully — until you tried to compose two directives that shared a common dependency. The moment the same directive appeared twice in the resolved host directive tree, Angular threw **NG0309: Directives can only match an element once**. Game over.

This is the classic diamond problem. Directive A is a host directive of both Directive B and Directive C. A consumer puts both B and C on the same element. Angular flattens the tree and sees A twice. Instead of de-duplicating, it crashes.

This wasn't a niche edge case. This was the fundamental architecture of every headless UI library. Tooltips need anchor positioning. Menus need anchor positioning. Selects need anchor positioning. A button that opens a menu and shows a tooltip on hover? That's not an edge case — that's a Tuesday.

```ts
// Before - Broken

@Directive({
  selector: '[tooltipTrigger]',
  hostDirectives: [AnchorPositioner], // needs anchor positioning
})
export class TooltipTrigger {}

@Directive({
  selector: '[menuTrigger]',
  hostDirectives: [AnchorPositioner], // also needs anchor positioning
})
export class MenuTrigger {}

// A button that triggers both a menu and a tooltip:
// <button tooltipTrigger menuTrigger>Actions</button>
//
// NG0309 - AnchorPositioner matched twice via hostDirectives
```

The workarounds were all bad. You could remove the shared directive from `hostDirectives` and force the consumer to apply it manually — which defeats the entire purpose of encapsulation. You could broaden the selector to `[tooltipTrigger], [menuTrigger]` — which couples the shared directive to every consumer and makes it impossible to evolve independently. You could wire up injection-based coordination with optional providers — fragile boilerplate that duplicates logic the framework should own.

My workaround? I slapped a `__NG_ELEMENT_ID__` function property onto the directive class to hijack Angular's internal element-level injection, wired up a `WeakMap<HTMLElement, Map<object, unknown>>` to manually de-duplicate instances per element, used `runInInjectionContext` to construct them lazily, and wrapped the whole thing in a root-provided singleton service. It worked. It was also 60 lines of framework internals spelunking that no library author should have to write, maintain, or explain to their team.

None of these were real solutions. The better your architecture was — the more composable, the more layered, the more reusable — the more likely it was to hit this wall.

## Two Rules. Zero Workarounds.

[PR #67996](https://github.com/angular/angular/pull/67996) slated for v22 release (early June) adds de-duplication logic to both the Angular compiler and runtime. When the framework encounters the same directive multiple times in a resolved host directive tree, it no longer throws. Instead, it applies two deterministic rules.

**Rule 1 — Template wins.** If a directive matches once in the template (the consumer wrote it explicitly) and also appears as a host directive, the host directive matches are discarded. The mental model: a host directive match represents `Partial<YourDirective>`, while a template match represents the full directive with all its inputs and outputs.

**Rule 2 — Host duplicates merge.** If a directive appears multiple times as a host directive (the diamond case), Angular merges the input/output mappings from all instances into a single directive instance. If two instances try to expose the same input or output under different alias names, both the compiler and runtime produce an error — this isn't a free-for-all, it's intentional conflict resolution.

The elegance is in what library authors don't have to think about. You declare your host directives at the level where they make architectural sense. You don't need to know what other directives your consumers might combine yours with. You don't need de-duplication utilities or provider gymnastics. Angular handles the graph resolution — duplicates are collapsed into a single instance, and the framework moves on.

## CSS Anchor Positioning — Shared Anchors

CSS anchor positioning is the modern way to tether floating elements — tooltips, menus, popovers, selects — to their trigger. Every one of these patterns needs the trigger element to have a unique `anchor-name` in CSS. The natural way to model this in Angular is a small directive that stamps the style onto the host element using a host binding.

The problem was obvious: every popover-style directive wanted to include this anchor as a host directive, and any element that combined two of them would crash. A toolbar button with both a tooltip and a dropdown menu? That's the most common interactive pattern on the web — and it was impossible.

```ts
// The shared anchor directive

@Directive({
  selector: '[anchorPositioner]',
  host: {
    '[style.anchor-name]': 'anchorName',
  },
})
export class AnchorPositioner {
  readonly anchorName = `--anchor-${uniqueId()}`;
}
```

```ts
// Every trigger declares the dependency - no collisions

@Directive({
  selector: '[tooltipTrigger]',
  hostDirectives: [AnchorPositioner],
})
export class TooltipTrigger {
  readonly anchor = inject(AnchorPositioner);
  // positions tooltip via: position-anchor: var(--anchor-xxx)
}

@Directive({
  selector: '[menuTrigger]',
  hostDirectives: [AnchorPositioner],
})
export class MenuTrigger {
  readonly anchor = inject(AnchorPositioner);
}

@Directive({
  selector: '[selectTrigger]',
  hostDirectives: [AnchorPositioner],
})
export class SelectTrigger {
  readonly anchor = inject(AnchorPositioner);
}
```

```html
<!-- One button. Three floating behaviors. One anchor instance. -->
<button tooltipTrigger menuTrigger selectTrigger>Actions</button>

<!-- All three inject the SAME AnchorPositioner instance.       -->
<!-- All three reference the SAME anchor-name for positioning.  -->
<!-- The consumer wrote ZERO workaround code.                   -->
```

This is what encapsulation is supposed to look like. Each directive declares exactly what it needs. The framework resolves collisions. The consumer just writes markup. There's no leaked implementation detail, no manual wiring, no coupling between directives that shouldn't know about each other.

## Accessibility Primitives — Composable Behaviors

Accessible UI is built from atomic behaviors: disabled state management, focus visibility tracking, hover detection, press/release handling. A well-designed library provides these as standalone directives that can be mixed into any component via `hostDirectives`. Each one owns a single concern and binds its state to the host element through host bindings.

The catch? Higher-level directives compose these atoms, and when two higher-level directives share atoms, the diamond appears. A `ButtonBehavior` needs disabled + focus. A `DropdownItemBehavior` also needs disabled + focus. A sidebar item that needs to be both a button and a dropdown item? Before this fix, that was a crash.

```ts
// Atomic behavior directives

@Directive({
  host: {
    '[attr.data-disabled]': 'disabled() || null',
    '[attr.aria-disabled]': 'disabled() || null',
  },
})
export class Disableable {
  readonly disabled = input(false);
}

@Directive({
  host: {
    '[attr.data-focus-visible]': 'focusVisible() || null',
    '(focus)': 'onFocus()',
    '(blur)': 'onBlur()',
  },
})
export class FocusVisible {
  readonly focusVisible = signal(false);

  onFocus() {
    this.focusVisible.set(true);
  }
  onBlur() {
    this.focusVisible.set(false);
  }
}
```

```ts
// Compound behaviors - the diamond forms

// ButtonBehavior = Disableable + FocusVisible
@Directive({
  hostDirectives: [{directive: Disableable, inputs: ['disabled']}, FocusVisible],
})
export class ButtonBehavior {}

// DropdownItemBehavior = Disableable + FocusVisible + Selectable
@Directive({
  hostDirectives: [{directive: Disableable, inputs: ['disabled']}, FocusVisible, Selectable],
})
export class DropdownItemBehavior {}
```

```ts
// The payoff - compose without fear

// A sidebar item IS a button AND a dropdown item.
// Disableable + FocusVisible appear in BOTH host directive trees.
// Before: NG0309.   Now: merged automatically.

@Component({
  selector: 'sidebar-item',
  hostDirectives: [
    ButtonBehavior, // brings Disableable + FocusVisible
    DropdownItemBehavior, // also brings Disableable + FocusVisible
  ], // One Disableable, one FocusVisible. Merged.
  template: `<ng-content />`,
})
export class SidebarItem {}
```

This is the exact scenario from the original GitHub issue. A collapsed sidebar renders items inside a dropdown. An expanded sidebar renders them as regular buttons. The component needs both behaviors simultaneously. Before this fix, you had to choose between architectural purity and a working application. Now you don't.

## Design System Theming — Shared Appearance

Design systems often have a core directive that applies visual rules — data attributes for variant styling, color scheme bindings, size tokens. Every interactive component bundles it as a host directive so consumers get correct theming automatically without remembering to add an extra attribute.

But a component that composes two themed primitives inherits that appearance directive twice. Before the fix, the library author had two options: break encapsulation by removing the host directive, or break the consumer by leaving it in and hoping they never compose two themed components.

```ts
// Shared appearance directive

@Directive({
  selector: '[appearance]',
  host: {
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
  },
})
export class Appearance {
  readonly variant = input('default');
  readonly size = input('md');
}
```

::: code-group

```html [Before - Broken encapsulation]
<!-- Can't use hostDirectives for Appearance -
     diamond crashes. Force the consumer to
     apply it manually: -->

<button appearance dsButton dsDropdownItem>
  <!-- Forgot appearance? No compile error.
     Just broken styling. Silent. Invisible.
     Shipped. -->
</button>
```

```html [After - Pure composition]
<!-- Appearance is encapsulated in dsButton
     and dsDropdownItem where it belongs.
     The library owns the concern entirely. -->

<button dsButton dsDropdownItem>
  <!-- dsButton has Appearance.
     dsDropdownItem has Appearance.
     Angular keeps one instance.
     Consumer writes nothing extra. -->
</button>
```

:::

## Form Controls — Shared Validation Wiring

Every form control directive needs the same foundational behaviors: disabled state management, validation state tracking (`aria-invalid`, `aria-describedby`), and touched/dirty lifecycle. A library encapsulates these into shared directives and bundles them into higher-level primitives like `InputBehavior` and `TextareaBehavior`.

Now imagine an auto-growing tag input that starts as a single-line input and expands into a textarea as the user adds more tags. It needs behaviors from both. Both bring `Disableable` and `FormFieldState`. Before: crash. Now: merged.

```ts
// Now works

@Directive({
  host: {
    '[attr.aria-invalid]': 'invalid()',
    '[attr.aria-describedby]': 'errorId()',
    '[attr.data-touched]': 'touched() || null',
  },
})
export class FormFieldState {
  readonly invalid = signal(false);
  readonly touched = signal(false);
  private readonly id = uniqueId();
  readonly errorId = computed(() => (this.invalid() ? `err-${this.id}` : null));
}

@Directive({
  hostDirectives: [{directive: Disableable, inputs: ['disabled']}, FormFieldState],
})
export class InputBehavior {}

@Directive({
  hostDirectives: [{directive: Disableable, inputs: ['disabled']}, FormFieldState],
})
export class TextareaBehavior {}

// Compose both — shared atoms de-duplicated
@Component({
  selector: 'tag-input',
  hostDirectives: [InputBehavior, TextareaBehavior],
  // One Disableable. One FormFieldState. Merged.
  template: `...`,
})
export class TagInput {}
```

## Deep Composition Trees — The Stress Test

The above examples show two-level diamonds. Real libraries go deeper. A navigation menu item composes an `Interactive` behavior, which itself composes individual atoms. A `PopoverTrigger` composes anchor positioning and hover detection. The menu item composes both of those compound behaviors. At four levels deep, duplicates don't just appear — they multiply exponentially through the tree.

This is where de-duplication proves it isn't a convenience feature — it's structural. Without it, the deeper your composition tree, the more fragile your library becomes. With it, depth is free.

```ts
// 4 levels deep — just works

// Layer 1: Atoms
@Directive({host: {'[attr.data-disabled]': 'disabled() || null'}})
export class Disableable {
  readonly disabled = input(false);
}

@Directive({host: {'[attr.data-focus-visible]': 'focusVisible() || null'}})
export class FocusVisible {
  readonly focusVisible = signal(false);
}

@Directive({host: {'[style.anchor-name]': 'anchorName'}})
export class AnchorPositioner {
  readonly anchorName = `--anchor-${uniqueId()}`;
}

@Directive({host: {'[attr.data-hovered]': 'hovered() || null'}})
export class Hoverable {
  readonly hovered = signal(false);
}

// Layer 2: Compounds
@Directive({
  hostDirectives: [Disableable, FocusVisible, Hoverable],
})
export class Interactive {}

@Directive({
  hostDirectives: [AnchorPositioner, Hoverable],
})
export class PopoverTrigger {}

// Layer 3: Primitives — Hoverable appears in BOTH
@Directive({
  hostDirectives: [Interactive, PopoverTrigger],
})
export class MenuButton {}

// Layer 4: Consumer component
@Component({
  selector: 'nav-item',
  hostDirectives: [MenuButton],
  template: `<ng-content />`,
  // Resolved tree:
  //   Disableable       x1
  //   FocusVisible      x1
  //   AnchorPositioner  x1
  //   Hoverable         x1  (was x2, de-duplicated)
})
export class NavItem {}
```

Four layers. Five unique atom directives. One potential duplicate resolved silently. The consumer writes a single line — `hostDirectives: [MenuButton]` — and everything resolves. That's the power of framework-level composition.

## React Hooks vs Angular Host Directives

React solved the composition problem through hooks and merging props. React Aria provides `useButton`, `useFocusVisible`, `useHover`, and `mergeProps` — each returning a bag of props the consumer merges onto a JSX element. Base UI takes a similar approach with render props and slot utilities. It works, and it works well. But the composition is manual. The consumer is responsible for merging, for ref forwarding, for making sure event handlers from different hooks don't clobber each other.

Angular host directives push that responsibility into the framework. Dependency injection wires up instances. Host bindings are resolved by the compiler. Lifecycle hooks are managed by the runtime. And now, with de-duplication, even the diamond problem is resolved automatically. The composition surface moves from user-land code to framework and library infrastructure.

::: code-group

```tsx [React — Manual composition with hooks]
// Both useMenuTrigger and useTooltipTrigger need hover
// detection and anchor positioning internally.
// The consumer assembles everything by hand.

function MenuButtonWithTooltip({label, children}) {
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Menu state + trigger props
  const menuState = useMenuTriggerState({});
  const {menuTriggerProps, menuProps} = useMenuTrigger({}, menuState, triggerRef);

  // Tooltip state + trigger props
  const tooltipState = useTooltipTriggerState({delay: 500});
  const {triggerProps: tooltipTriggerProps} = useTooltipTrigger({}, tooltipState, triggerRef);

  // Button semantics
  const {buttonProps} = useButton(menuTriggerProps, triggerRef);

  // Focus ring (keyboard focus only)
  const {focusProps, isFocusVisible} = useFocusRing();

  // Hover detection — needed by BOTH tooltip and menu.
  // Each hook tracks hover internally, but only the consumer
  // knows both need it. If you forget this, the tooltip
  // never appears on hover.
  const {hoverProps, isHovered} = useHover({
    onHoverStart: () => tooltipState.open(true),
    onHoverEnd: () => tooltipState.close(),
  });

  // The consumer merges 5 prop bags. If any two define
  // the same event handler (onFocus, onPointerDown, onKeyDown),
  // only mergeProps prevents one from silently clobbering
  // the other. Miss it, and you get bugs that pass code
  // review but break in production.
  return (
    <>
      <button
        {...mergeProps(buttonProps, tooltipTriggerProps, focusProps, hoverProps)}
        ref={triggerRef}
        data-focus-visible={isFocusVisible || undefined}
        data-hovered={isHovered || undefined}
      >
        {label}
      </button>
      {tooltipState.isOpen && (
        <Tooltip state={tooltipState} triggerRef={triggerRef}>
          {children}
        </Tooltip>
      )}
      {menuState.isOpen && (
        <MenuPopover state={menuState} triggerRef={triggerRef}>
          {children}
        </MenuPopover>
      )}
    </>
  );
}
```

```ts [Angular — Framework composition with host directives]
// Both MenuTrigger and TooltipTrigger declare Hoverable
// and AnchorPositioner as host directives.
// Angular de-duplicates. The consumer writes markup.

@Component({
  selector: 'button[appMenuButtonWithTooltip]',
  hostDirectives: [
    MenuTrigger, // brings Hoverable + AnchorPositioner
    TooltipTrigger, // also brings Hoverable + AnchorPositioner
    FocusVisible,
  ],
  // Hoverable x1        (de-duplicated)
  // AnchorPositioner x1  (de-duplicated)
  template: `<ng-content />`,
})
export class MenuButtonWithTooltip {}

// No ref wiring. No prop merging.
// No event handler conflicts.
// No forgotten hover binding.
// 7 lines. Done.
```

:::

The difference isn't capability — it's ownership. React hooks give you the pieces and trust you to assemble them correctly. Angular host directives assemble them for you. Both approaches produce accessible, composable UI. But Angular's approach means the framework absorbs the complexity, not the consumer. And with de-duplication, that story is now complete — the same composition patterns React library authors take for granted are now fully available to Angular library authors, with less manual wiring.

## Angular Is Now a Library-First Framework

Step back and look at what Angular has shipped over the last two years. Signals replaced the reactive model with something that's both simpler and more powerful than RxJS for component state. Zoneless change detection removed the last unpredictable runtime behavior. `linkedSignal` and `resource` gave us derived and async state primitives. And `hostDirectives` gave us composition without inheritance.

But `hostDirectives` had a hole. The diamond problem meant that the more composable your library was — the more layered, the more reusable, the more principled — the more likely your consumers would hit NG0309. The better your architecture, the more it broke. That paradox is gone now.

The composition stack is complete:

- **Signals** — reactive state without RxJS ceremony
- **Zoneless** — deterministic change detection
- **linkedSignal / resource** — derived and async state
- **Host Directives** — composition without inheritance
- **De-duplication** — the missing piece

The Angular ecosystem has long watched React's library layer with admiration — Radix, Base UI, React Aria, Headless UI. Those libraries exist because React's composition model was complete from day one. Hooks compose. They don't collide. Angular's `hostDirectives` got it 90% of the way there but left a gap that prevented the same caliber of library architecture. De-duplication closes that gap entirely.

There are no more workarounds. No more horrific `__NG_ELEMENT_ID__` hacks. No more choosing between good architecture and working code. No more dreaded NG0309. You just use Angular.

---

_This fix exists because [Alex Inkin](https://github.com/waterplea) refused to let it stay broken. He opened the original issue, made the case clearly, and kept pushing until the Angular team prioritized it. And [Kristiyan Kostadinov](https://github.com/crisbeto) turned it into reality — implementing the compiler and runtime changes in [PR #67996](https://github.com/angular/angular/pull/67996). The library author community owes them both._
