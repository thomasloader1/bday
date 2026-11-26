# Loading

One loading language across the app: spinner + sr-only label, no layout shift, no emoji swaps.

## States

| Context | Component | Usage |
|---|---|---|
| Page level | LoadingSpinner `standalone` | h-screen centered spinner on `[id]` / confirm |
| Inline (map) | LoadingSpinner `size="sm"` | LocationButton while lat/long undefined — inline, NO viewport overlay |
| Button pending | ui/Button `loading` | disabled + spinner in reserved slot + label; size unchanged |
| Confirm / decline | ui/Button `loading` | GroupedButtons success/danger variants during Firestore write |

## Rules

- Loading state is announced: `role="status"` + sr-only label on spinners; `aria-busy` + `disabled` on buttons.
- Never change layout while loading: buttons reserve the spinner slot; pages use a centered standalone.
- Never swap label text for emoji (`🥳`/`🖕` text-3xl jumps are gone).
- Pending actions disable their trigger to prevent double-submit.
