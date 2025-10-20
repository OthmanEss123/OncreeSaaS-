<?php

namespace App\Http\Controllers;

use App\Models\Rh;
use Illuminate\Http\Request;

class RhController extends Controller
{
    public function index() { return Rh::with('client')->get(); }

    public function store(Request $request) {
        $data = $request->validate([
            'name'      => 'required|string|max:150',
            'email'     => 'required|email|unique:rh',
            'password'  => 'required|string|min:8',
            'phone'     => 'nullable|string|max:30',
            'client_id' => 'required|exists:clients,id',
            'address'   => 'nullable|string|max:255',
        ]);
        $data['password'] = bcrypt($data['password']);
        return Rh::create($data);
    }

    public function show(Rh $rh) { return $rh->load('client'); }

    public function update(Request $request, Rh $rh) {
        $data = $request->validate([
            'name'      => 'sometimes|string|max:150',
            'email'     => 'sometimes|email|unique:rh,email,'.$rh->id,
            'password'  => 'nullable|string|min:8',
            'phone'     => 'nullable|string|max:30',
            'client_id' => 'sometimes|exists:clients,id',
            'address'   => 'nullable|string|max:255',
        ]);
        if(isset($data['password'])) $data['password'] = bcrypt($data['password']);
        $rh->update($data);
        return $rh;
    }

    public function destroy(Rh $rh) {
        $rh->delete();
        return response()->noContent();
    }
}
