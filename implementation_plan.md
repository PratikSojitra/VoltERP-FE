# Refactor Payment System to Single-Record per Invoice

Currently, the system creates a new `Payment` document for each partial payment, and automatically generates a `PENDING` payment document for the remaining balance. This results in multiple rows in the Payments table for the same invoice, which clutters the UI.

## Goal
Consolidate all payments for a single invoice/purchase into **one** `Payment` document. Partial payments will be stored as an array of transactions (`history`) inside this single document. The table will only show one row per invoice.

## Open Questions
> [!IMPORTANT]
> If we make this change, users will not be able to "edit" the amount of a past partial payment to fix a typo directly from the main "Edit Payment" modal, because clicking "Edit" will now act as "Add new partial payment" to the history. Is it acceptable to only allow adding new partial payments, or do we need a separate "Manage History" UI to delete/fix past typos? For this plan, I will assume we just append to the history.

## Proposed Changes

---

### Backend Schema (`VoltERP-BE`)

#### [MODIFY] `src/payment/schemas/payment.schema.ts`
- Add a `history` array to store individual transactions:
  ```typescript
  @Prop([{
      amount: Number,
      paymentDate: Date,
      paymentMethod: String,
      referenceNumber: String,
      notes: String,
      createdAt: { type: Date, default: Date.now }
  }])
  history: any[];
  ```
- The root `amount` will now represent the **Total Amount Paid** (sum of history).
- Ensure the root `paymentDate`, `paymentMethod`, etc., store the details of the **latest** transaction for easy display in the table.

#### [MODIFY] `src/payment/payment.service.ts`
- **`create`**: When a new payment is created, push the initial payload into the `history` array. Set the root `amount` to the payload's amount.
- **`update`**: When updating (adding a partial payment):
  - Do NOT overwrite the root `amount` with the new partial amount.
  - Instead, push the new partial amount to `history`.
  - Add the new partial amount to the root `amount` (so `root amount = previous total + new partial amount`).
  - Update root fields (`paymentDate`, `paymentMethod`, etc.) to the newest transaction.
  - Recalculate `status` (`PARTIAL` or `COMPLETED`) based on the new total `amount` vs invoice `outstandingAmount`.
- **`syncInvoice` & `syncPurchase`**: 
  - Remove all logic that automatically creates or deletes `PENDING` payment documents. There is now only one payment document per invoice.
  - Update calculation to read the single payment document's total amount instead of summing multiple documents.

#### [MODIFY] `src/invoice/invoice.service.ts` & `src/purchase/purchase.service.ts`
- When an invoice/purchase is created, create exactly **one** `Payment` document with `status: 'PENDING'` and `amount: 0`. Wait, if `amount: 0`, the UI will show 0. We will initialize it with an empty history.

---

### Frontend (`VoltERP-FE`)

#### [MODIFY] `app/dashboard/payments/PaymentModal.tsx`
- Currently, when editing a payment, the modal populates the form with the payment's `amount` (which will now be the *total* paid). We need to change this so the `amount` input is blank (or 0) so the user can enter the *new* partial payment amount they want to add.
- Calculate the `outstanding` correctly by simply reading `selectedInvoice.outstandingAmount`. We no longer need to "add back" the editing payment amount because the user is entering a fresh partial payment, not replacing the old one.

#### [MODIFY] `app/dashboard/payments/PaymentViewModal.tsx`
- Update the modal to render the `payment.history` array instead of making a separate API call to fetch related payments (since they are all in the same document now!).

## Verification Plan
1. Create a new invoice. Verify only one `PENDING` payment appears in the list.
2. Edit the payment and add a partial amount. Verify the status changes to `PARTIAL` and no new row is created.
3. View the payment. Verify the partial transaction appears in the history list.
4. Edit the payment again and pay the remaining balance. Verify the status changes to `COMPLETED` and the history shows both transactions.
