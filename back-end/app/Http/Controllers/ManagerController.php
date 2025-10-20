<?php

namespace App\Http\Controllers;

use App\Models\Manager;
use Illuminate\Http\Request;

class ManagerController extends Controller
{
    public function index() { return Manager::with('client')->get(); }

    public function store(Request $request) {
        $data = $request->validate([
            'name'      => 'required|string|max:150',
            'email'     => 'required|email|unique:managers',
            'password'  => 'required|string|min:8',
            'phone'     => 'nullable|string|max:30',
            'client_id' => 'required|exists:clients,id',
            'address'   => 'nullable|string|max:255',
        ]);
        $data['password'] = bcrypt($data['password']);
        return Manager::create($data);
    }

    public function show(Manager $manager) { return $manager->load('client'); }

    public function update(Request $request, Manager $manager) {
        $data = $request->validate([
            'name'      => 'sometimes|string|max:150',
            'email'     => 'sometimes|email|unique:managers,email,'.$manager->id,
            'password'  => 'nullable|string|min:8',
            'phone'     => 'nullable|string|max:30',
            'client_id' => 'sometimes|exists:clients,id',
            'address'   => 'nullable|string|max:255',
        ]);
        if(isset($data['password'])) $data['password'] = bcrypt($data['password']);
        $manager->update($data);
        return $manager;
    }

    public function destroy(Manager $manager) {
        $manager->delete();
        return response()->noContent();
    }
}
