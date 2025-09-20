<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class InvoiceController extends Controller
{
    // GET /api/invoices  (filtres optionnels)
    public function index(Request $request)
    {
        $q = Invoice::with(['client','mission','payments']);

        if ($request->filled('client_id')) {
            $q->where('client_id', $request->client_id);
        }
        if ($request->filled('mission_id')) {
            $q->where('mission_id', $request->mission_id);
        }
        if ($request->filled('status')) {
            $q->where('status', $request->status); // en_attente/payé/en_retard
        }
        if ($request->filled('from')) {
            $q->whereDate('created_at', '>=', $request->from);
        }
        if ($request->filled('to')) {
            $q->whereDate('created_at', '<=', $request->to);
        }
        if ($request->boolean('overdue_only', false)) {
            $q->where('status', 'overdue');
        }

        // Tri décroissant par le plus récent
        return $q->orderByDesc('id')->get()->map(fn($inv) => $this->withComputed($inv));
    }

    // POST /api/invoices
    public function store(Request $request)
    {
        $data = $request->validate([
            'client_id'  => ['required','exists:clients,id'],
            'mission_id' => ['nullable','exists:missions,id'],
            'amount'     => ['required','numeric','min:0'],
            'due_date'   => ['required','date'],
            'status'     => ['nullable', Rule::in(['paid','pending','overdue'])],
            'pdf_path'   => ['nullable','string','max:255'],
        ]);

        // État initial
        $data['status'] = $data['status'] ?? 'pending';
        $invoice = Invoice::create($data);

        // Mettre à jour le statut automatiquement (par exemple si les dates/paiements changent)
        $this->refreshStatus($invoice);

        return $this->withComputed($invoice->fresh(['client','mission','payments']));
    }

    // GET /api/invoices/{invoice}
    public function show(Invoice $invoice)
    {
        $invoice->load(['client','mission','payments']);
        return $this->withComputed($invoice);
    }

    // PUT/PATCH /api/invoices/{invoice}
    public function update(Request $request, Invoice $invoice)
    {
        $data = $request->validate([
            'client_id'  => ['sometimes','exists:clients,id'],
            'mission_id' => ['sometimes','nullable','exists:missions,id'],
            'amount'     => ['sometimes','numeric','min:0'],
            'due_date'   => ['sometimes','date'],
            'status'     => ['sometimes', Rule::in(['paid','pending','overdue'])],
            'pdf_path'   => ['sometimes','nullable','string','max:255'],
        ]);

        $invoice->update($data);
        $this->refreshStatus($invoice);

        return $this->withComputed($invoice->fresh(['client','mission','payments']));
    }

    // DELETE /api/invoices/{invoice}
    public function destroy(Invoice $invoice)
    {
        $invoice->delete();
        return response()->noContent();
    }

    /**
     * Calculer les montants payés et retourner des champs dérivés.
     */
    private function withComputed(Invoice $invoice)
    {
        $paid = (float) $invoice->payments->sum('amount');
        $remaining = max(0, (float) $invoice->amount - $paid);

        return $invoice->setAttribute('paid_total', $paid)
                       ->setAttribute('remaining', $remaining);
    }

    /**
     * Mettre à jour le statut de la facture automatiquement :
     * - payé si la somme des paiements >= le montant.
     * - en_retard si la date est dépassée et le statut n'est pas payé.
     * - sinon en_attente.
     */
    private function refreshStatus(Invoice $invoice): void
    {
        $invoice->loadMissing('payments');

        $paid = (float) $invoice->payments->sum('amount');

        if ($paid >= (float) $invoice->amount) {
            $invoice->status = 'paid';
        } else {
            $due = Carbon::parse($invoice->due_date);
            $invoice->status = now()->greaterThan($due) ? 'overdue' : 'pending';
        }

        // Nous sauvegardons seulement si le statut a changé
        if ($invoice->isDirty('status')) {
            $invoice->save();
        }
    }
}
