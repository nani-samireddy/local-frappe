import { appDataDir } from "@tauri-apps/api/path";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";

// Internal imports
import { logError, logInfo } from "@/utils/logger";

export type BenchMeta = {
	name: string;
	path: string;
	sites: string[];
	apps: string[];
	createdAt: string;
};

const BENCH_META_FILE = "registry.json";

async function getMetaFilePath(): Promise<string> {
	const dir = await appDataDir();
	return `${dir}/${BENCH_META_FILE}`;
}

export async function getBenchMetadata(): Promise<BenchMeta[]> {
	const metaPath = await getMetaFilePath();
	try {
		const content = await readTextFile(metaPath);
		const benches = JSON.parse(content) as BenchMeta[];
		await logInfo("Fetched bench metadata.");
		return benches;
	} catch (error) {
		await logError("Failed to read bench metadata", error);
		throw new Error("Could not read bench registry.");
	}
}

export async function addBenchMetadata(bench: BenchMeta): Promise<void> {
	try {
		const metaPath = await getMetaFilePath();
		const existing = await getBenchMetadata();

		// Prevent duplicates by name or path
		const filtered = existing.filter(
			(b) => b.name !== bench.name && b.path !== bench.path
		);
		const updated = [...filtered, bench];

		await writeTextFile(metaPath, JSON.stringify(updated, null, 2));
		await logInfo(`Added bench "${bench.name}" to registry.`);
	} catch (error) {
		await logError(`Failed to add bench "${bench.name}"`, error);
		throw new Error("Could not save bench to registry.");
	}
}

export async function updateBenchMetadata(
	updatedBench: BenchMeta
): Promise<void> {
	try {
		const metaPath = await getMetaFilePath();
		const existing = await getBenchMetadata();

		const updated = existing.map((b) =>
			b.name === updatedBench.name ? updatedBench : b
		);

		await writeTextFile(metaPath, JSON.stringify(updated, null, 2));
		await logInfo(`Updated bench "${updatedBench.name}" metadata.`);
	} catch (error) {
		await logError(`Failed to update bench "${updatedBench.name}"`, error);
		throw new Error("Could not update bench metadata.");
	}
}

export async function removeBenchMetadata(name: string): Promise<void> {
	try {
		const metaPath = await getMetaFilePath();
		const existing = await getBenchMetadata();
		const updated = existing.filter((b) => b.name !== name);

		await writeTextFile(metaPath, JSON.stringify(updated, null, 2));
		await logInfo(`Removed bench "${name}" from registry.`);
	} catch (error) {
		await logError(`Failed to remove bench "${name}"`, error);
		throw new Error("Could not remove bench from registry.");
	}
}
