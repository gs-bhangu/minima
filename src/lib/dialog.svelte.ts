import type { DialogRequest } from './types';

class DialogStore {
  request = $state<DialogRequest | null>(null);

  show(request: DialogRequest) {
    this.request = request;
  }

  close() {
    this.request = null;
  }
}

export const dialog = new DialogStore();
