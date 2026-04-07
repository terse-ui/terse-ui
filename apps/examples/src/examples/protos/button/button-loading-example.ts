import {Component, signal} from '@angular/core';
import {ProtoButton} from '@terse-ui/protos/button';

@Component({
  selector: 'ex-proto-button-loading',
  imports: [ProtoButton],
  template: `
    <p class="description">
      Use the keyboard to tab into the button and press Enter or Space to see the loading state.
      Focus remains on the button while loading.
    </p>

    <button
      protoButton
      [aria-label]="isLoading() ? 'Submitting, please wait' : null"
      [disabled]="isLoading()"
      [disabledInteractive]="isLoading()"
      (click)="startLoading(); clicks.set(clicks() + 1)"
    >
      @if (isLoading()) {
        <span aria-hidden="true" class="loader"></span>
        Submitting...
      } @else {
        Submit
      }
    </button>

    <div class="clicks">{{ clicks() }} clicks</div>
  `,
  styles: `
    :host {
      display: grid;
      place-items: center;
      gap: 1rem;
      text-align: center;
    }

    .description {
      line-height: 1.5;
      text-wrap: balance;
    }

    [protoButton] {
      font-size: 1em;
      padding-left: 1rem;
      padding-right: 1rem;
      border-radius: 0.5rem;
      color: var(--primary);
      border: none;
      height: 2.5rem;
      font-weight: 500;
      background-color: var(--surface);
      transition: background-color 100ms cubic-bezier(0.4, 0, 0.2, 1);
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      gap: 0.5rem;
    }

    [protoButton]:focus-visible {
      outline: 2px solid var(--ring);
    }

    [protoButton]:not([data-disabled]):hover {
      background-color: var(--surface-hover);
    }

    [protoButton]:not([data-disabled]):active {
      background-color: var(--surface-active);
    }

    [protoButton][data-disabled] {
      opacity: 0.5;
      cursor: not-allowed;
    }

    [protoButton] .loader {
      width: 1rem;
      height: 1rem;
      border: 2px solid var(--on-surface);
      border-bottom-color: transparent;
      border-radius: 50%;
      display: inline-block;
      box-sizing: border-box;
      animation: rotation 1s linear infinite;
    }

    @keyframes rotation {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  `,
})
export class ProtoButtonLoadingExample {
  readonly isLoading = signal(false);
  readonly clicks = signal(0);

  async startLoading() {
    this.isLoading.set(true);
    await new Promise((res) => setTimeout(res, 3000)); // Simulate loading
    this.isLoading.set(false);
  }
}
