# Auth Guard — Example Usage

This document shows how future API routes and Server Actions should use the auth guard layer.

## In an API Route Handler

```typescript
// app/api/attendance/route.ts
import { requirePermission } from '@/lib/auth-guard';
import { handleApiError } from '@/lib/errors';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 1. Guard: ensure user has attendance.write permission
    const session = await requirePermission('attendance.write');

    // 2. session.user is now fully typed with id, role, permissions
    const { user } = session;

    // 3. Your business logic here
    // const body = await request.json();
    // await attendanceService.markAttendance({ markedBy: user.id, ...body });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
```

## In a Server Action

```typescript
// features/attendance/actions/mark-attendance.ts
'use server';

import { requirePermission } from '@/lib/auth-guard';
import { ForbiddenError } from '@/lib/errors';

export async function markAttendanceAction(data: unknown) {
  // Guard fires before any business logic
  const session = await requirePermission('attendance.write');

  // If we get here, user is authenticated AND has the permission
  console.log(`Attendance marked by: ${session.user.id}`);
}
```

## Role-Based Guard (Multiple Allowed Roles)

```typescript
// Only HOD and ADMIN can view department reports
const session = await requireRole(['HOD', 'ADMIN']);
```

## Error Handling in API Routes

The `handleApiError()` utility maps typed errors to HTTP status codes:

| Error Class       | HTTP Status | When Used                             |
|-------------------|-------------|---------------------------------------|
| `AuthError`       | 401         | No valid session                      |
| `ForbiddenError`  | 403         | Authenticated but missing permission  |
| `NotFoundError`   | 404         | Resource does not exist               |
| `ValidationError` | 422         | Invalid request body                  |

All responses follow the shape: `{ success: false, message: string, errors: [] }`
