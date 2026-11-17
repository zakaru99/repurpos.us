// 'readonly' can read assay proposals; 'reviewer' can also decide them;
// 'admin' can also manage access and maintenance
export type Role = 'admin' | 'reviewer' | 'readonly' | 'user';

export interface LoginState {
	loggedIn: boolean;
	isAdmin?: boolean;
	role?: Role;
	email?: string;
}

// /auth/status and /users send `role`; a backend from before reviewers
// existed only sends `admin`
export function roleOf(status: { admin?: boolean; role?: string }): Role {
	if (['admin', 'reviewer', 'readonly', 'user'].indexOf(status.role) !== -1) {
		return status.role as Role;
	}
	return status.admin ? 'admin' : 'user';
}

// Everyone with a staff role can open the admin portal and read proposals
export function hasPortal(role: Role): boolean {
	return role === 'admin' || role === 'reviewer' || role === 'readonly';
}

// Admins and reviewers can approve and decline proposals
export function canReview(role: Role): boolean {
	return role === 'admin' || role === 'reviewer';
}
