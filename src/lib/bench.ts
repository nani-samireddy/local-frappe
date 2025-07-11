import { readDir } from "@tauri-apps/plugin-fs";
import { homeDir } from "@tauri-apps/api/path";

export type BenchDetails = {
	name: string;
	path: string;
	apps: string[];
	sites: string[];
};

/**
 * List all benches with their apps and sites from the default benches directory
 */
export async function listBenches(): Promise<BenchDetails[]> {
	const home = await homeDir();
	const benchesDir = `${home}/benches`;

	try {
		const entries = await readDir(benchesDir);

		// Filter only directories (benches)
		const benches = entries.filter((entry) => entry.isDirectory);

		const benchDetails: BenchDetails[] = [];

		for (const bench of benches) {
			if (!bench.name) continue;

			const benchPath = `${benchesDir}/${bench.name}`;
			const appsPath = `${benchPath}/source/apps`;
			const sitesPath = `${benchPath}/source/sites`;

			const getNames = async (path: string) => {
				try {
					const subEntries = await readDir(path);

					return subEntries
						.filter((entry) => entry.isDirectory)
						.map((entry) => entry.name as string);
				} catch (error) {
					console.error(`Failed to read directory ${path}:`, error);
					return [];
				}
			};

			const apps = await getNames(appsPath);
			const sites = await getNames(sitesPath);

			benchDetails.push({
				name: bench.name,
				path: benchPath,
				apps,
				sites,
			});
		}

		return benchDetails;
	} catch (error) {
		console.error("Failed to list benches:", error);
		return [];
	}
}

export async function getBenchInfo(benchName: string): Promise<{
	apps: string[];
	sites: string[];
}> {
	const home = await homeDir();
	const benchPath = `${home}/benches/${benchName}`;
	const appsPath = `${benchPath}/source/apps`;
	const sitesPath = `${benchPath}/source/sites`;

	const getNames = async (path: string) => {
		try {
			const entries = await readDir(path);
			return entries
				.filter((entry) => entry.isDirectory)
				.map((entry) => entry.name as string);
		} catch {
			return [];
		}
	};

	const apps = await getNames(appsPath);
	const sites = await getNames(sitesPath);

	return { apps, sites };
}
