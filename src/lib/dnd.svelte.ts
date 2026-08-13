type DragKind = 'tile' | 'group' | 'panel';

class DragState {
  kind = $state<DragKind | null>(null);
  /** Key of the dragged tile or group. */
  key = $state('');
  /** Section the dragged tile came from. */
  fromSection = $state('');
  /** Section currently under the pointer, and the insertion slot inside it. */
  overSection = $state('');
  overIndex = $state(-1);
  /** Insertion slot between groups while dragging a group. */
  overGroupIndex = $state(-1);

  startTile(key: string, fromSection: string) {
    this.kind = 'tile';
    this.key = key;
    this.fromSection = fromSection;
  }

  startGroup(key: string) {
    this.kind = 'group';
    this.key = key;
  }

  startPanel(key: string) {
    this.kind = 'panel';
    this.key = key;
  }

  hoverTile(sectionKey: string, index: number) {
    this.overSection = sectionKey;
    this.overIndex = index;
  }

  hoverGroup(index: number) {
    this.overGroupIndex = index;
  }

  clear() {
    this.kind = null;
    this.key = '';
    this.fromSection = '';
    this.overSection = '';
    this.overIndex = -1;
    this.overGroupIndex = -1;
  }
}

export const drag = new DragState();
