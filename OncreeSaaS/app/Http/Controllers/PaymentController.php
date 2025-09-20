<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Invoice;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    // GET /api/payments?invoice_id=...
    public function index(Request $request)
    {
        $q = Payment::with('invoice');

        if ($request->filled('invoice_id')) {
            $q->where('invoice_id', $request->invoice_id);
        }

        return $q->orderByDesc('date')->get();
    }

    // POST /api/payments
    public function store(Request $request)
    {
        $data = $request->validate([
            'invoice_id' => ['required','exists:invoices,id'],
            'amount'     => ['required','numeric','min:0'],
            'method'     => ['nullable','string','max:100'],
            'date'       => ['required','date'],
            'status'     => ['nullable','in:confirmed,pending'],
        ]);

        $data['status'] = $data['status'] ?? 'confirmed';

        $payment = Payment::create($data);

        // Après l'ajout, nous mettons à jour le statut de la facture
        $this->refreshInvoiceStatus($payment->invoice);

        return $payment->load('invoice');
    }

    // GET /api/payments/{payment}
    public function show(Payment $payment)
    {
        return $payment->load('invoice');
    }

    // PUT/PATCH /api/payments/{payment}
    public function update(Request $request, Payment $payment)
    {
        $data = $request->validate([
            'amount' => ['sometimes','numeric','min:0'],
            'method' => ['sometimes','nullable','string','max:100'],
            'date'   => ['sometimes','date'],
            'status' => ['sometimes','in:confirmed,pending'],
        ]);

        $payment->update($data);

        $this->refreshInvoiceStatus($payment->invoice);

        return $payment->load('invoice');
    }

    // DELETE /api/payments/{payment}
    public function destroy(Payment $payment)
    {
        $invoice = $payment->invoice;
        $payment->delete();

        // Après la suppression, nous mettons à jour le statut de la facture
        $this->refreshInvoiceStatus($invoice);

        return response()->noContent();
    }

    /**
     * Mettre à jour le statut de la facture basé sur la somme des paiements et la date d'échéance.
     */
    private function refreshInvoiceStatus(Invoice $invoice): void
    {
        $invoice->loadMissing('payments');
        $paid = (float) $invoice->payments()->where('status','confirmed')->sum('amount');

        if ($paid >= (float) $invoice->amount) {
            $invoice->status = 'paid';
        } else {
            $invoice->status = now()->greaterThan(\Carbon\Carbon::parse($invoice->due_date))
                ? 'overdue'
                : 'pending';
        }

        if ($invoice->isDirty('status')) {
            $invoice->save();
        }
    }
}
