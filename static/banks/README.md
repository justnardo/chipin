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

These files are the institutions' trademarks, shown beside receiving-account
details. The repo deliberately ships none: source the artwork from the bank's
own brand/press page and get written permission — the Stage 0 bank-testing
conversations are the natural moment to ask. Square or near-square marks look
best; they render at 44px and 32px on a white tile.
