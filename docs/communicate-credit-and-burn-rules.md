# Scandoc Zero Communicate: revised credit and burn rules

This is a provisional design model for the Communicate preview, not a funded account, production policy or live AGI implementation. Science remains knowledge-only and unchanged.

## Credit meanings

- **Starting allowance:** 20 non-cash demo credits, not a purchase or deposit.
- **Refundable stake:** An admission hold, not a contribution fee. It returns after a terminal settlement.
- **Success bonus:** A fixed, disclosed usage-credit award for the trusted synthetic module passing its declared checks. Conversation, identity and personal worth are not scored.
- **Pool:** 100 initial demo credits. Before admission, the pool protects the maximum of the proposed success bonus and fault compensation. This is possible because those awards are mutually exclusive.
- **Conservation:** Available user credits + user-held stake + available pool + protected pool reserve remain 120 throughout each sandbox.

## Admission lifecycle

Reserve → check → settle is separate from reserve → recorded host fault → fixture review → revoke admission.

The first reservation locks the selected stake and reward parameters for the sandbox. A normalized module digest covers algorithm, declared boundary, dataset and claimed relation, excluding its display name. A module digest may have only one terminal outcome in the sandbox.

Normal checks do not settle funds automatically. Successful checks leave the admission pending explicit settlement; failed metric or boundary checks leave it pending a stake-only refund. The synthetic boundary-violating fixture requests no actual data and is rejected before metric evaluation, including before a simulated host fault could qualify it for compensation.

## Terminal outcomes

| Outcome | Stake returned | Bonus | Compensation | Admission |
|---|---:|---:|---:|---|
| Successful checked work | Full stake | Disclosed fixed bonus | None | Closed |
| Rejected work | Full stake | None | None | Closed |
| Voluntary burn | Full stake | None | None | Revoked |
| Reviewed eligible host-fault burn | Full stake | None | Equal to original stake | Revoked |

An eligible return of 20 on a 10-credit hold consists of 10 returned principal plus 10 compensation. It is not 20 profit, a yield guarantee or a reward for destroying a hash. Voluntary revocation never grants this compensation.

## Fault eligibility

A selected burn reason is insufficient. The preview must first record a simulated host-outage fixture after the derived-only boundary passes. The fixture includes the admission ID, module digest, failure phase and simulated status.

A separate fixture-review step checks that those values match the active admission. Only the reviewed fixture enables the compensated burn route. This is reproducible synthetic scenario evidence, not actual independent adjudication or proof of a real system failure.

## Receipts and accounting

Every committed action binds the policy version and previous receipt hash. The export includes the complete prototype receipt history, current admission and all ledger balances.

Changes are staged and checked before hashing. Only after receipt hashing succeeds does the staged state replace the committed state. Failed operations do not change balances, reserve funds or append a receipt.

Burn revokes the active topology admission, retains its module digest and receipt history, and blocks another terminal settlement of that digest in the current sandbox. No attempt is made to erase a hash.

## Limits before real implementation

The preview has no accounts, cash redemption, live model, real module uploader, external payments or production receipt compatibility. Reset and reload erase the local sandbox; they are not durable anti-replay controls.

Real rewards would require separately specified module acceptance criteria, consent and zero-data boundaries, independent incident assessment, funding and liability policies, durable admission IDs, reward-budget controls and account-level replay prevention. The starting allowance, stake sizes, bonus sizes and compensation conditions are still modelling choices.
