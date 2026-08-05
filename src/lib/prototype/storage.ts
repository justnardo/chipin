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

const canUse = () => typeof localStorage !== 'undefined';

/**
 * Read a JSON array, migrating anything left in sessionStorage under the same key.
 * The migration exists so a demo already in progress when this shipped does not
 * lose its campaigns mid-conversation. Safe to remove once no old tabs remain.
 */
export function readList<T>(key: string): T[] {
	if (!canUse()) return [];
	try {
		const raw = localStorage.getItem(key);
		if (raw) return JSON.parse(raw) as T[];

		if (typeof sessionStorage === 'undefined') return [];
		const carried = sessionStorage.getItem(key);
		if (!carried) return [];
		const parsed = JSON.parse(carried) as T[];
		localStorage.setItem(key, carried);
		sessionStorage.removeItem(key);
		return parsed;
	} catch {
		// Corrupt or unreadable storage should degrade to "nothing saved yet",
		// never take the page down.
		return [];
	}
}

export function writeList<T>(key: string, value: T[]): void {
	if (!canUse()) return;
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch {
		// Quota or private-mode failures are not worth breaking the flow over.
	}
}

/** Random id for prototype records. Not a security token — see createToken. */
export function prototypeId(prefix: string): string {
	return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
