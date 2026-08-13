/** Small cross-component signals that don't belong in persisted settings. */
class UiState {
  /** Group key that should drop straight into inline rename once rendered. */
  renameKey = $state('');
}

export const ui = new UiState();
