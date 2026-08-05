/**
 * Browser storage for the prototype's fictional data.
 *
 * Uses localStorage, not sessionStorage. sessionStorage is scoped to a single tab,
 * which broke the flow this prototype exists to demonstrate: a donor status link
 * opened in any other tab — or handed to the person it was issued to — found no
 * report, and a host opening their dashboard in a new tab saw an empty inbox. The
 * donor-reports → host-attests → donor-sees-status loop is the product thesis, so
 * it has to survive leaving the tab it started in.
 *
 * Still device-local and still fictional. There is no server, no account, and no
 * sync between devices; clearing site data clears everything.
 */

/**
 * Resolve a usable Storage, or null.
 *
 * A `typeof` guard is not enough: in a sandboxed iframe, or with site data blocked,
 * merely *touching* `localStorage` throws a SecurityError rather than being
 * undefined. That would escape a caller's try/catch and take the page down — the
 * opposite of what this module promises. So access happens inside try/catch, and a
 * probe write confirms the store is actually usable (Safari private mode has
 * historically exposed a localStorage that throws on every set).
 *
 * Memoised: the answer cannot change within a page load, and probing on every read
 * would mean two extra writes per call.
 */
const PROBE_KEY = '__chipin_storage_probe__';
let resolved: Storage | null | undefined;

function store(): Storage | null {
	if (resolved !== undefined) return resolved;
	try {
		const candidate = localStorage;
		candidate.setItem(PROBE_KEY, '1');
		candidate.removeItem(PROBE_KEY);
		resolved = candidate;
	} catch {
		resolved = null;
	}
	return resolved;
}

/** Same hazard as above; sessionStorage is only touched for the one-time carry-over. */
function legacyStore(): Storage | null {
	try {
		return sessionStorage;
	} catch {
		return null;
	}
}

/**
 * Read a JSON array, migrating anything left in sessionStorage under the same key.
 * The migration exists so a demo already in progress when this shipped does not
 * lose its campaigns mid-conversation. Safe to remove once no old tabs remain.
 */
export function readList<T>(key: string): T[] {
	const active = store();
	if (!active) return [];
	try {
		const raw = active.getItem(key);
		if (raw) return JSON.parse(raw) as T[];

		const legacy = legacyStore();
		if (!legacy) return [];
		const carried = legacy.getItem(key);
		if (!carried) return [];
		const parsed = JSON.parse(carried) as T[];
		active.setItem(key, carried);
		legacy.removeItem(key);
		return parsed;
	} catch {
		// Corrupt or unreadable storage should degrade to "nothing saved yet",
		// never take the page down.
		return [];
	}
}

export function writeList<T>(key: string, value: T[]): void {
	const active = store();
	if (!active) return;
	try {
		active.setItem(key, JSON.stringify(value));
	} catch {
		// Quota or private-mode failures are not worth breaking the flow over.
	}
}

/** Random id for prototype records. Not a security token — see createToken. */
export function prototypeId(prefix: string): string {
	return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
