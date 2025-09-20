<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function index(){ return Role::all(); }
    public function store(Request $r){
        $data = $r->validate(['name'=>'required','description'=>'nullable']);
        return Role::create($data);
    }
    public function show(Role $role){ return $role; }
    public function update(Request $r, Role $role){
        $data = $r->validate(['name'=>'sometimes','description'=>'sometimes|nullable']);
        $role->update($data); return $role;
    }
    public function destroy(Role $role){ $role->delete(); return response()->noContent(); }
}
