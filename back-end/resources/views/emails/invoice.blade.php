<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Facture #{{ $facture->id }}</title>
    <style>
        * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
        }
        
        body { 
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
            font-size: 12px; 
            color: #2c3e50; 
            padding: 30px;
            background: #ffffff;
            line-height: 1.6;
        }
        
        /* En-tête de facture */
        .invoice-header {
            text-align: center;
            background: #ffffff;
            color: #000000;
            padding: 25px;
            margin-bottom: 30px;
            font-size: 24px;
            font-weight: bold;
            border: 3px solid rgb(169, 183, 190);
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            letter-spacing: 1px;
        }
        
        /* Informations facture */
        .invoice-info {
            display: table;
            width: 100%;
            margin-bottom: 30px;
            border-spacing: 15px 0;
        }
        
        .info-box {
            display: table-cell;
            width: 48%;
            border: 2px solid #e0e6ed;
            padding: 20px;
            vertical-align: top;
            background: #f8f9fa;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .info-box-title {
            text-align: center;
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #667eea;
            color: #667eea;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .info-line {
            margin-bottom: 10px;
            padding: 5px 0;
        }
        
        .info-label {
            display: inline-block;
            width: 100px;
            font-weight: bold;
            color: #495057;
        }
        
        /* Détails de facture */
        .invoice-details {
            margin-bottom: 30px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #e0e6ed;
        }
        
        .invoice-details-title {
            font-weight: bold;
            font-size: 13px;
            margin-bottom: 10px;
            color: #667eea;
        }
        
        .detail-row {
            display: table;
            width: 100%;
            margin-bottom: 8px;
        }
        
        .detail-label {
            display: table-cell;
            width: 150px;
            font-weight: bold;
            color: #495057;
        }
        
        .detail-value {
            display: table-cell;
            color: #2c3e50;
        }
        
        /* Table des items */
        .items-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin-bottom: 25px;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        
        .items-table th,
        .items-table td {
            border: 1px solid #dee2e6;
            padding: 12px;
            text-align: left;
        }
        
        .items-table th {
            background-color: #667eea;
            color: white;
            font-weight: bold;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .items-table tbody tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        
        .items-table tbody tr:hover {
            background-color: #e7f5ff;
        }
        
        .text-right {
            text-align: right;
        }
        
        .text-center {
            text-align: center;
        }
        
        /* Total */
        .total-section {
            margin-top: 20px;
            padding: 20px;
            background-color: #667eea;
            color: white;
            border-radius: 8px;
            text-align: right;
        }
        
        .total-label {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .total-amount {
            font-size: 24px;
            font-weight: bold;
        }
        
        /* Statut */
        .status-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .status-draft {
            background-color: #6c757d;
            color: white;
        }
        
        .status-sent {
            background-color: #0d6efd;
            color: white;
        }
        
        .status-paid {
            background-color: #198754;
            color: white;
        }
        
        .status-cancelled {
            background-color: #dc3545;
            color: white;
        }
        
        /* Pied de page */
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e0e6ed;
            text-align: center;
            color: #868e96;
            font-size: 10px;
        }
    </style>
</head>
<body>
    <!-- En-tête de la facture -->
    <div class="invoice-header">
        FACTURE #{{ $facture->id }}
    </div>

    <!-- Informations Client et Prestataire -->
    <div class="invoice-info">
        <div class="info-box">
            <div class="info-box-title">Client</div>
            <div class="info-line">
                <span class="info-label">Société :</span> 
                {{ $client->company_name ?? 'N/A' }}
            </div>
            @if($client->contact_name)
            <div class="info-line">
                <span class="info-label">Contact :</span> 
                {{ $client->contact_name }}
            </div>
            @endif
            <div class="info-line">
                <span class="info-label">Email :</span> 
                {{ $client->contact_email ?? 'N/A' }}
            </div>
            @if($client->address)
            <div class="info-line">
                <span class="info-label">Adresse :</span> 
                {{ $client->address }}
            </div>
            @endif
            @if($client->contact_phone)
            <div class="info-line">
                <span class="info-label">Téléphone :</span> 
                {{ $client->contact_phone }}
            </div>
            @endif
        </div>
        
        @if($consultant)
        <div class="info-box">
            <div class="info-box-title">Prestataire</div>
            <div class="info-line">
                <span class="info-label">Nom :</span> 
                {{ $consultant->name ?? ($consultant->first_name . ' ' . $consultant->last_name) ?? 'N/A' }}
            </div>
            @if($consultant->email)
            <div class="info-line">
                <span class="info-label">Email :</span> 
                {{ $consultant->email }}
            </div>
            @endif
            @if($consultant->address)
            <div class="info-line">
                <span class="info-label">Adresse :</span> 
                {{ $consultant->address }}
            </div>
            @endif
        </div>
        @endif
    </div>

    <!-- Détails de la facture -->
    <div class="invoice-details">
        <div class="invoice-details-title">Détails de la facture</div>
        <div class="detail-row">
            <span class="detail-label">Date de facture :</span>
            <span class="detail-value">{{ $factureDate }}</span>
        </div>
        @if($dueDate)
        <div class="detail-row">
            <span class="detail-label">Date d'échéance :</span>
            <span class="detail-value">{{ $dueDate }}</span>
        </div>
        @endif
        <div class="detail-row">
            <span class="detail-label">Statut :</span>
            <span class="detail-value">
                <span class="status-badge status-{{ $facture->status }}">
                    @if($facture->status === 'draft') Brouillon
                    @elseif($facture->status === 'sent') Envoyée
                    @elseif($facture->status === 'paid') Payée
                    @elseif($facture->status === 'cancelled') Annulée
                    @else {{ $facture->status }}
                    @endif
                </span>
            </span>
        </div>
    </div>

    <!-- Table des items -->
    @if($items && $items->count() > 0)
    <table class="items-table">
        <thead>
            <tr>
                <th style="width: 5%;">#</th>
                <th style="width: 50%;">Description</th>
                <th style="width: 15%;" class="text-center">Quantité</th>
                <th style="width: 15%;" class="text-right">Prix unitaire</th>
                <th style="width: 15%;" class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($items as $index => $item)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $item->description }}</td>
                <td class="text-center">{{ number_format($item->quantity, 2) }}</td>
                <td class="text-right">{{ number_format($item->unit_price, 2) }} €</td>
                <td class="text-right">{{ number_format($item->quantity * $item->unit_price, 2) }} €</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    <!-- Total -->
    <div class="total-section">
        <div class="total-label">Total TTC</div>
        <div class="total-amount">{{ number_format($total ?? 0, 2) }} €</div>
    </div>

    <!-- Pied de page -->
    <div class="footer">
        <p>Document généré automatiquement le {{ \Carbon\Carbon::now()->format('d/m/Y à H:i') }}</p>
        <p>Cette facture est confidentielle et destinée uniquement à l'usage du destinataire mentionné ci-dessus.</p>
    </div>
</body>
</html>

