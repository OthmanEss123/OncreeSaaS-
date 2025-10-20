<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    public function index() { return Client::all(); }

    public function store(Request $request) {
        $data = $request->validate([
            'company_name'  => 'required|string|max:150',
            'contact_name'  => 'nullable|string|max:150',
            'contact_email' => 'required|email|unique:clients',
            'contact_phone' => 'nullable|string|max:50',
            'address'       => 'nullable|string|max:255',
            'password'      => 'nullable|string|max:255',
        ]);
        return Client::create($data);
    }

    public function show(Client $client) { return $client; }

    public function update(Request $request, Client $client) {
        $data = $request->validate([
            'company_name'  => 'sometimes|string|max:150',
            'contact_name'  => 'nullable|string|max:150',
            'contact_email' => 'sometimes|email|unique:clients,contact_email,'.$client->id,
            'contact_phone' => 'nullable|string|max:50',
            'address'       => 'nullable|string|max:255',
            'password'      => 'nullable|string|max:255',
        ]);
        $client->update($data);
        return $client;
    }

    public function destroy(Client $client) {
        $client->delete();
        return response()->noContent();
    }
}
