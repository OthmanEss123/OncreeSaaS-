<?php

namespace App\Http\Controllers;

use App\Models\Facture;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Mail;

class FactureController extends Controller
{
    public function index() { return Facture::with(['client','consultant','quote','items'])->get(); }

    public function store(Request $request) {
        try {
            $data = $request->validate([
                'client_id'        => 'required|exists:clients,id',
                'consultant_id'    => 'nullable|exists:consultants,id',
                'quote_id'         => 'nullable|exists:quotes,id',
                'created_by_manager'=> 'nullable|exists:managers,id',
                'facture_date'     => 'required|date',
                'due_date'         => 'nullable|date|after_or_equal:facture_date',
                'status'           => 'nullable|in:draft,sent,paid,cancelled',
                'total'            => 'nullable|numeric',
            ]);
            
            $facture = Facture::create($data);
            return response()->json($facture->load(['client', 'consultant', 'items']), 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Erreur lors de la création de la facture: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la création de la facture',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(Facture $facture) { return $facture->load(['client','consultant','quote','items']); }

    public function update(Request $request, Facture $facture) {
        $data = $request->validate([
            'client_id'        => 'sometimes|exists:clients,id',
            'consultant_id'    => 'nullable|exists:consultants,id',
            'quote_id'         => 'nullable|exists:quotes,id',
            'created_by_manager'=> 'nullable|exists:managers,id',
            'facture_date'     => 'sometimes|date',
            'due_date'         => 'nullable|date|after_or_equal:facture_date',
            'status'           => 'nullable|in:draft,sent,paid,cancelled',
            'total'            => 'nullable|numeric',
        ]);
        $facture->update($data);
        return $facture->load(['client','consultant','quote','items']);
    }

    public function destroy(Facture $facture) {
        $facture->delete();
        return response()->noContent();
    }

    /**
     * Envoyer la facture par email avec PDF en pièce jointe
     */
    public function sendEmail(Facture $facture) {
        try {
            // Charger les relations nécessaires
            $facture->load(['client', 'consultant', 'items']);
            
            if (!$facture->client) {
                return response()->json([
                    'success' => false,
                    'message' => 'Aucun client associé à cette facture'
                ], 404);
            }

            $client = $facture->client;
            $clientEmail = $client->contact_email;

            if (!$clientEmail) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email du client non trouvé'
                ], 404);
            }

            // Calculer le total si non défini
            $total = $facture->total;
            if (!$total && $facture->items && $facture->items->count() > 0) {
                $total = $facture->items->sum(function($item) {
                    return $item->quantity * $item->unit_price;
                });
            }

            // Préparer les données pour le PDF et l'email
            $data = [
                'facture' => $facture,
                'client' => $client,
                'consultant' => $facture->consultant,
                'items' => $facture->items,
                'total' => $total,
                'factureDate' => \Carbon\Carbon::parse($facture->facture_date)->locale('fr')->isoFormat('D MMMM YYYY'),
                'dueDate' => $facture->due_date ? \Carbon\Carbon::parse($facture->due_date)->locale('fr')->isoFormat('D MMMM YYYY') : null,
            ];

            // Générer le PDF
            $pdf = Pdf::loadView('emails.invoice', $data);
            
            // Envoyer l'email
            Mail::send('emails.invoice-email', $data, function ($message) use ($clientEmail, $facture, $pdf) {
                $message->to($clientEmail)
                    ->subject("Facture #{$facture->id} - {$facture->client->company_name}")
                    ->attachData($pdf->output(), "facture_{$facture->id}.pdf", [
                        'mime' => 'application/pdf',
                    ]);
            });

            // Mettre à jour le statut de la facture
            $facture->update(['status' => 'sent']);

            return response()->json([
                'success' => true,
                'message' => "Facture envoyée avec succès à {$clientEmail}"
            ]);
        } catch (\Exception $e) {
            \Log::error('Erreur lors de l\'envoi de la facture par email: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'envoi de l\'email: ' . $e->getMessage()
            ], 500);
        }
    }
}
