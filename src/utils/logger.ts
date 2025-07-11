import { appDataDir } from "@tauri-apps/api/path";
import { writeTextFile } from "@tauri-apps/plugin-fs";

const LOG_FILE = "local-frappe.log";

async function getLogFilePath(): Promise<string> {
	const dir = await appDataDir();
	return `${dir}/${LOG_FILE}`;
}

function getTimestamp(): string {
	return new Date().toISOString();
}

export async function logInfo(message: string) {
	const logLine = `[${getTimestamp()}] [INFO] ${message}\n`;
	const path = await getLogFilePath();
	await writeTextFile(path, logLine, { append: true });
}

export async function logError(context: string, error: unknown) {
	const errorMsg =
		error instanceof Error
			? error.message
			: typeof error === "string"
			? error
			: JSON.stringify(error);
	const logLine = `[${getTimestamp()}] [ERROR] ${context} — ${errorMsg}\n`;
	const path = await getLogFilePath();
	await writeTextFile(path, logLine, { append: true });
}
