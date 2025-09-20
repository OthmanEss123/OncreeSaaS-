<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    // GET /api/notifications?user_id=&status=
    public function index(Request $request)
    {
        $q = Notification::with('user');

        if ($request->filled('user_id')) {
            $q->where('user_id', $request->user_id);
        }
        if ($request->filled('status')) {
            $q->where('status', $request->status); // read/unread
        }

        return $q->orderByDesc('id')->get();
    }

    // GET /api/notifications/unread?user_id=...
    public function unread(Request $request)
    {
        $request->validate([
            'user_id' => ['required','exists:users,id']
        ]);

        return Notification::with('user')
            ->where('user_id', $request->user_id)
            ->where('status', 'unread')
            ->orderByDesc('id')
            ->get();
    }

    // POST /api/notifications
    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id' => ['required','exists:users,id'],
            'type'    => ['required','string','max:50'], // email, push...
            'message' => ['required','string','max:255'],
            'status'  => ['nullable','in:read,unread'],
        ]);

        $data['status'] = $data['status'] ?? 'unread';

        return Notification::create($data)->load('user');
    }

    // GET /api/notifications/{notification}
    public function show(Notification $notification)
    {
        return $notification->load('user');
    }

    // PUT/PATCH /api/notifications/{notification}
    public function update(Request $request, Notification $notification)
    {
        $data = $request->validate([
            'type'    => ['sometimes','string','max:50'],
            'message' => ['sometimes','string','max:255'],
            'status'  => ['sometimes','in:read,unread'],
        ]);

        $notification->update($data);
        return $notification->load('user');
    }

    // DELETE /api/notifications/{notification}
    public function destroy(Notification $notification)
    {
        $notification->delete();
        return response()->noContent();
    }

    // PATCH /api/notifications/{notification}/read
    public function markAsRead(Notification $notification)
    {
        if ($notification->status !== 'read') {
            $notification->status = 'read';
            $notification->save();
        }
        return $notification->load('user');
    }

    // PATCH /api/notifications/mark-all-read?user_id=...
    public function markAllRead(Request $request)
    {
        $request->validate([
            'user_id' => ['required','exists:users,id']
        ]);

        Notification::where('user_id', $request->user_id)
            ->where('status', 'unread')
            ->update(['status' => 'read']);

        return response()->json(['message' => 'All unread notifications marked as read.']);
    }
}

