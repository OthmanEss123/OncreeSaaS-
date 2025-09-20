<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    public function index()
    {
        return Client::all();
    }

    public function store(Request $request)
    {
        $request->validate([
            'company_name' => 'required|string|max:255',
            'contact_name' => 'nullable|string|max:255',
            'email'        => 'required|email|unique:clients',
            'phone'        => 'nullable|string|max:20',
            'address'      => 'nullable|string|max:255',
        ]);

        return Client::create($request->all());
    }

    public function show(Client $client)
    {
        return $client;
    }

    public function update(Request $request, Client $client)
    {
        $request->validate([
            'company_name' => 'sometimes|string|max:255',
            'contact_name' => 'sometimes|string|max:255',
            'email'        => 'sometimes|email|unique:clients,email,' . $client->id,
            'phone'        => 'sometimes|string|max:20',
            'address'      => 'sometimes|string|max:255',
        ]);

        $client->update($request->all());
        return $client;
    }

    public function destroy(Client $client)
    {
        $client->delete();
        return response()->noContent();
    }
}
