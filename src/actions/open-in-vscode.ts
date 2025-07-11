import { Command } from "@tauri-apps/plugin-shell";

export async function openInVSCode(benchPath: string): Promise<void> {
	try {
		const encodedPathCommand =
			`cd "${benchPath}" && ` +
			`code --folder-uri="vscode-remote://dev-container+$(pwd | tr -d '\\n' | xxd -c 256 -p)/workspace/development"`;

		const result = await Command.create("exec-sh", ["-c", encodedPathCommand]).execute();

		if (result.code !== 0) {
			console.error("VS Code open failed:", result.stderr);
			throw new Error(result.stderr || "Failed to open VS Code folder.");
		}

		console.log("VS Code opened successfully.");
	} catch (error) {
		console.error("Error launching VS Code:", error);
	}
}
