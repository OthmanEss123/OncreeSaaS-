<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    // GET /api/services  (avec filtres optionnels)
    public function index(Request $request)
    {
        $q = Service::query();

        if ($request->filled('active')) {
            // active=true / false
            $q->where('active', filter_var($request->get('active'), FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->filled('search')) {
            $s = $request->get('search');
            $q->where(function ($qq) use ($s) {
                $qq->where('title', 'like', "%$s%")
                   ->orWhere('description', 'like', "%$s%");
            });
        }

        if ($request->filled('min_price')) {
            $q->where('price', '>=', (float) $request->get('min_price'));
        }
        if ($request->filled('max_price')) {
            $q->where('price', '<=', (float) $request->get('max_price'));
        }

        return $q->orderBy('title')->get();
    }

    // POST /api/services
    public function store(Request $request)
    {
        $data = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'price'       => 'required|numeric|min:0',
            'duration'    => 'required|integer|min:1', // minutes
            'active'      => 'sometimes|boolean',
        ]);

        $service = Service::create($data);
        return response()->json($service, 201);
    }

    // GET /api/services/{service}
    public function show(Service $service)
    {
        return $service;
    }

    // PUT/PATCH /api/services/{service}
    public function update(Request $request, Service $service)
    {
        $data = $request->validate([
            'title'       => 'sometimes|string|max:255',
            'description' => 'sometimes|nullable|string',
            'price'       => 'sometimes|numeric|min:0',
            'duration'    => 'sometimes|integer|min:1',
            'active'      => 'sometimes|boolean',
        ]);

        $service->update($data);
        return $service;
    }

    // DELETE /api/services/{service}
    public function destroy(Service $service)
    {
        $service->delete();
        return response()->noContent();
    }

    // PATCH /api/services/{service}/toggle  (optionnel : activation/désactivation rapide)
    public function toggle(Service $service)
    {
        $service->active = ! $service->active;
        $service->save();

        return $service;
    }
}
