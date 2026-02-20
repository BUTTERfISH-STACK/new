/**
 * Security Middleware
 * 
 * JWT authentication and role-based access control.
 * This is a foundation for future authentication integration.
 */

import { NextRequest, NextResponse } from 'next/server'

// Simple role definitions
export type UserRole = 'admin' | 'manager' | 'sales_rep' | 'viewer'

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  '/api/deals',
  '/api/contacts',
  '/api/companies',
  '/api/tasks',
  '/api/activities',
  '/api/communications',
  '/api/automations',
  '/api/ai',
  '/api/insights',
]

// Admin-only routes
const ADMIN_ONLY_ROUTES = [
  '/api/automations',
]

/**
 * Check if route requires authentication
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route))
}

/**
 * Check if route requires admin role
 */
function isAdminOnlyRoute(pathname: string): boolean {
  return ADMIN_ONLY_ROUTES.some(route => pathname.startsWith(route))
}

/**
 * Extract token from request
 */
function extractToken(request: NextRequest): string | null {
  // Try Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Try cookie
  return request.cookies.get('auth-token')?.value || null
}

/**
 * Decode and validate JWT token (simplified)
 * In production, use proper JWT library
 */
function validateToken(token: string): { valid: boolean; userId?: string; role?: UserRole } {
  // Simplified validation - in production use proper JWT
  if (!token || token.length < 10) {
    return { valid: false }
  }

  // For demo purposes, accept any valid-looking token
  // In production, verify signature and expiration
  return {
    valid: true,
    userId: 'demo-user',
    role: 'admin' // Default role for demo
  }
}

/**
 * Check role permissions
 */
function hasRole(requiredRole: UserRole, userRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    admin: 4,
    manager: 3,
    sales_rep: 2,
    viewer: 1,
  }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

/**
 * Main middleware function
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip non-API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Skip auth routes
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next()
  }

  // Check if route is protected
  if (!isProtectedRoute(pathname)) {
    return NextResponse.next()
  }

  // Extract and validate token
  const token = extractToken(request)
  if (!token) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  const validation = validateToken(token)
  if (!validation.valid) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    )
  }

  // Check admin-only routes
  if (isAdminOnlyRoute(pathname) && validation.role !== 'admin') {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    )
  }

  // Add user info to headers for downstream use
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', validation.userId || '')
  requestHeaders.set('x-user-role', validation.role || '')

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

/**
 * Get current user from request
 */
export function getCurrentUser(request: NextRequest): { userId: string; role: UserRole } | null {
  const userId = request.headers.get('x-user-id')
  const role = request.headers.get('x-user-role') as UserRole

  if (!userId) return null

  return { userId, role: role || 'viewer' }
}

export default middleware
