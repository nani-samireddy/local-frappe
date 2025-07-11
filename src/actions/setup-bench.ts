import { Command } from "@tauri-apps/plugin-shell";
import { homeDir } from "@tauri-apps/api/path";
import {
	mkdir,
	BaseDirectory,
	readTextFile,
	writeTextFile,
	copyFile,
} from "@tauri-apps/plugin-fs";


export async function streamInstallerLogs(
	containerId: string,
	siteName: string,
	setProgressState: (update: (prev: string) => string) => void
): Promise<void> {
	const step = "Running installer.py";

	const child: any = await Command.create("exec-sh", [
		"-c",
		`docker exec -i ${containerId} bash -c "python3 installer.py -b source --site-name ${siteName} 2>&1 | tee install.log"`
	]).spawn();

	child.stdout.on("data", (data: Uint8Array) => {
		const line = new TextDecoder().decode(data).trim();
		console.log(`[${step}] ${line}`);
		setProgressState((prev) => `${prev}<br/>[stdout] ${line}`);
	});

	child.stderr.on("data", (data: Uint8Array) => {
		const line = new TextDecoder().decode(data).trim();
		console.error(`[${step} error] ${line}`);
		setProgressState((prev) => `${prev}<br/>[stderr] ${line}`);
	});

	await child;
}


export async function runCommand(
	cmd: string,
	args: string[],
	step: string
): Promise<string> {
	try {
		const result = await Command.create("exec-sh", [
			"-c",
			`${cmd} ${args.join(" ")}`,
		]).execute();

		if (result.code !== 0) {
			console.error(`Error during "${step}":\n${result.stderr}`);
			throw new Error(result.stderr || `Failed at step: ${step}`);
		}

		return result.stdout;
	} catch (error) {
		console.error(`Command failed at step "${step}":`, error);
		throw error;
	}
}

interface SetupBenchArgs {
	benchName: string;
	siteName: string;
	setProgressState: (update: (prev: string) => string) => void;
}

async function setupBench({
	benchName,
	siteName,
	setProgressState,
}: SetupBenchArgs) {
	if (!benchName || !siteName) {
		throw new Error("Bench name and site name are required.");
	}

	const projectName = benchName.replace(/\s+/g, "-").toLowerCase();
	const home = await homeDir();
	const baseDir = `${home}/benches`;
	const projectDir = `${baseDir}/${projectName}`;
	const dockerComposePath = `${projectDir}/docker-compose.yaml`;
	const devContainerPath = `${projectDir}/.devcontainer/.devcontainer.json`;

	setProgressState((msg) => `${msg}<br/>Setting up bench: ${projectName}...`);

	// 1. Ensure base and project directories exist
	await mkdir(baseDir, { recursive: true });
	setProgressState(
		(msg) => `${msg}<br/>Created benches directory at ${baseDir} ✅`
	);

	await mkdir(projectDir, { recursive: true });
	setProgressState(
		(msg) => `${msg}<br/>Created project directory at ${projectDir} ✅`
	);

	// 2. Prepare docker-compose.yaml
	const dockerComposeTemplate = await readTextFile(
		"template-files/docker-compose.yaml",
		{
			baseDir: BaseDirectory.Resource,
		}
	);
	const dockerComposeContent = dockerComposeTemplate.replace(
		/project_name/g,
		projectName
	);
	await writeTextFile(dockerComposePath, dockerComposeContent);
	setProgressState((msg) => `${msg}<br/>Wrote docker-compose.yaml ✅`);

	// 3. Create .devcontainer config
	await mkdir(`${projectDir}/.devcontainer`, { recursive: true });
	const devContainerTemplate = await readTextFile(
		"template-files/devcontainer/devcontainer.json",
		{
			baseDir: BaseDirectory.Resource,
		}
	);
	const devContainerContent = devContainerTemplate.replace(
		/project_name/g,
		projectName
	);
	await writeTextFile(devContainerPath, devContainerContent);
	setProgressState((msg) => `${msg}<br/>Configured .devcontainer ✅`);

	// 4. Copy installer.py and apps.json
	await copyFile(
		"template-files/installer.py",
		`${projectDir}/installer.py`,
		{
			fromPathBaseDir: BaseDirectory.Resource,
		}
	);
	// await copyFile("template-files/apps.json", `${projectDir}/apps.json`, {
	// 	fromPathBaseDir: BaseDirectory.Resource,
	// });
	setProgressState((msg) => `${msg}<br/>Copied installer files ✅`);

	// 5. Start Docker Compose
	await runCommand(
		`cd ${projectDir} && docker-compose`,
		["-f", "docker-compose.yaml", "up", "-d"],
		"Starting Docker Compose"
	);
	setProgressState((msg) => `${msg}<br/>Started Docker Compose ✅`);

	// 6. Wait for frappe container to be running
	const containerName = `${projectName}-frappe-1`;
	let isRunning = false;

	setProgressState(
		(msg) => `${msg}<br/>Waiting for ${containerName} to be ready...`
	);

	while (!isRunning) {
		const inspectResult = await Command.create("exec-sh", [
			"-c",
			`docker inspect -f '{{.State.Running}}' ${containerName}`,
		]).execute();

		isRunning = inspectResult.stdout.trim() === "true";
		if (!isRunning) await new Promise((res) => setTimeout(res, 1000));
	}

	// 7. Get container ID and run installer
	const containerIdResult = await Command.create("exec-sh", [
		"-c",
		`docker ps -aqf "name=${containerName}"`,
	]).execute();
	const containerId = containerIdResult.stdout.trim();

	await runCommand(
		"docker",
		[
			"exec",
			"-i",
			containerId,
			"python3",
			"installer.py",
			"-b",
			"source",
			"--site-name",
			siteName,
		],
		"Running installer.py"
	);

	setProgressState((msg) => `${msg}<br/>Ran installer script ✅`);
}

export { setupBench };
