const LIFETIME_MS = 8000;

class ToastStore {
  message = $state('');
  actionLabel = $state('');
  visible = $state(false);

  #action: (() => void) | null = null;
  #timer: ReturnType<typeof setTimeout> | undefined;

  show(message: string, actionLabel?: string, action?: () => void) {
    this.message = message;
    this.actionLabel = actionLabel ?? '';
    this.#action = action ?? null;
    this.visible = true;
    clearTimeout(this.#timer);
    this.#timer = setTimeout(() => this.dismiss(), LIFETIME_MS);
  }

  run() {
    this.#action?.();
    this.dismiss();
  }

  dismiss() {
    clearTimeout(this.#timer);
    this.visible = false;
    this.#action = null;
  }
}

export const toast = new ToastStore();
