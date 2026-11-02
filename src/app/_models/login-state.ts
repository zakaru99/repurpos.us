// 'reviewer' can read and decide assay proposals; 'admin' can also manage
// access and maintenance
export type Role = 'admin' | 'reviewer' | 'user';

export interface LoginState {
	loggedIn: boolean;
	isAdmin?: boolean;
	role?: Role;
	email?: string;
}

// /auth/status and /users send `role`; a backend from before reviewers
// existed only sends `admin`
export function roleOf(status: { admin?: boolean; role?: string }): Role {
	if (status.role === 'admin' || status.role === 'reviewer' || status.role === 'user') {
		return status.role;
	}
	return status.admin ? 'admin' : 'user';
}

// Admins and reviewers can open the admin portal
export function canReview(role: Role): boolean {
	return role === 'admin' || role === 'reviewer';
}
