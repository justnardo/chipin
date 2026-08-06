# Bank logo drop-in

Put an SVG here named after the channel id in `src/lib/prototype/banks.ts` and it
renders everywhere a bank mark appears (portal, picker, wizard, host dashboard).
No file → the original monogram tile shows instead.

| File              | Channel                  |
| ----------------- | ------------------------ |
| `rbc.svg`         | RBC Royal Bank           |
| `cibc.svg`        | CIBC Caribbean           |
| `scotia.svg`      | Scotiabank               |
| `fidelity.svg`    | Fidelity Bank            |
| `bob.svg`         | Bank of The Bahamas      |
| `commonwealth.svg`| Commonwealth Bank        |
| `tscu.svg`        | Teachers & Salaried CU   |
| `sanddollar.svg`  | SandDollar               |
| `kanoo.svg`       | Kanoo                    |
| `omni.svg`        | Omni Financial           |

## What is actually here, and what it costs

These files are the institutions' trademarks. **No permission has been asked for
or granted**, and the prototype is deployed. That gate was written as "before any
public deploy" and the deploy happened anyway; recording it plainly is better
than leaving a control that reads as operating when it is not. The mitigations
that do hold: `robots.txt` is `Disallow: /`, every campaign is fictional, and
the marks appear only in the bank pickers.

All six are **monochrome autotraces of bitmaps** — `fill="#000000"` throughout,
1536x1024 canvases, potrace path soup. Nobody's brand colour survives in them.
Because they are also 3:1 to 5:1 lockups, rendering one whole in a 32px tile put
"Scotiabank" at a 3.6px cap height: the real logos looked worse than the
monogram tiles they replaced, which is what prompted this rewrite.

So `BankMark` shows the **emblem only**, cropped out of the lockup by a CSS mask
and knocked out in white on a chip of the institution's colour. Emblems are
near-square and survive 32px. The crop windows live in `banks.ts` and are
measured by `scripts/measure_bank_emblems.mjs`.

**Knocking a mark out in flat white is a modification of it**, which is a
different permission ask from reproducing it faithfully. It is the best
available treatment for this artwork, not the right end state.

## Replacing these properly

Ask each bank for the **square icon or app-icon variant, in official colour**,
as true vector from their brand or press page — not the horizontal lockup, which
cannot work at 32px whatever you do with it. Drop it in as `<id>.svg`, delete
that channel's `emblem` window in `banks.ts`, and render it as supplied. Colour
artwork displayed unaltered is a stronger position than a knockout, not a weaker
one.

Where marks may and may not appear is a product rule, not a styling preference —
see THREAT-MODEL T13/T14. Short version: **logos in the chooser, name in words
at the till.** Square or near-square marks look best; they render at 44px and
32px on a white tile.
