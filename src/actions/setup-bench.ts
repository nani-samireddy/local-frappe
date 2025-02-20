import { Command } from "@tauri-apps/plugin-shell";
import { homeDir } from "@tauri-apps/api/path";
import { invoke } from "@tauri-apps/api/core";
import {
  mkdir,
  BaseDirectory,
  create,
  readTextFile,
  writeTextFile,
  copyFile,
} from "@tauri-apps/plugin-fs";
// import { message } from "@tauri-apps/plugin-dialog";

async function runCommand(cmd: string, args: string[], step: string) {
  try {
    const result = await Command.create("exec-sh", [
      "-c",
      `${cmd} ${args.join(" ")}`,
    ]).execute();

    console.log(`${step} completed with output:`, result.stdout);

    if (result.code !== 0) {
      console.error(`Error in step: ${step}\n${result.stderr}`);
    }
  } catch (error) {
    console.error(`Failed to execute ${step}:`, error);
  }
}

// Function to check if a port is available
async function getUnusedPorts(): Promise<number[]> {
  const result = await Command.create("exec-sh", [
    "-c",
    "bash -c \"comm -23 <(seq 1024 65535 | sort -n) <(lsof -i -P -n | awk 'NR>1 {print $9}' | awk -F: '{print $NF}' | grep -E '^[0-9]+$' | sort -n)\"",
  ]).execute();
  return result.stdout
    .split("\n")
    .map(Number)
    .filter((n) => !isNaN(n));
}

async function setupBench(projectName: string, setProgressState: any) {
  const home = await homeDir(); // Get the home directory from Tauri API
  const baseDir = `${home}/benches`; // Correctly build the path
  const projectDir = `${baseDir}/${projectName}`;

  const sourceDockerCompose = "template-files/docker-compose.yaml";

  const unused_ports: number[] = await invoke("find_unused_ports", {
    startPort: 8000,
    numberOfPorts: 13,
  });

  console.log("Unused ports", unused_ports);

  const [frappePortStart, frappeAltPortStart, dbViewerPort] = [
    unused_ports[0],
    unused_ports[6],
    unused_ports[12],
  ];
  messageCallback(
    (message: string) => message + "<br/>Got available ports for services✅ Frappe Port: " + frappePortStart + " Frappe Alt Port: " + frappeAltPortStart + " DB Viewer Port: " + dbViewerPort
  );
  const frappePortEnd = frappePortStart + 5;
  const frappeAltPortEnd = frappeAltPortStart + 5;

  // Create source directory
  await mkdir(`${projectDir}/source`, { recursive: true });
  // Append the message to the callback
  messageCallback(
    (message: string) =>
      message + "<br/>created source directory at " + projectDir + "/source✅"
  );
  // Create logs directory
  await mkdir(`${projectDir}/logs`, { recursive: true });
  messageCallback(
    (message: string) =>
      message + "<br/>created logs directory at " + projectDir + "/logs✅"
  );

  // Create bench.log file
  await create(`${projectDir}/logs/bench.log`);
  messageCallback(
    (message: string) =>
      message +
      "<br/>created bench.log file at " +
      projectDir +
      "/logs/bench.log✅"
  );

  // Read the contents of the docker-compose file.
  const dockerCompose = await readTextFile(sourceDockerCompose, {
    baseDir: BaseDirectory.Resource,
  });
  // Update the contents of the docker-compose file.
  const updatedDockerCompose = dockerCompose.replace(
    /project_name/g,
    projectName
  );

  // Create the updated docker-compose file.
  await writeTextFile(
    `${projectDir}/docker-compose.yaml`,
    updatedDockerCompose
  );
  messageCallback(
    (message: string) =>
      message +
      "<br/>created updated docker-compose file at " +
      projectDir +
      `/docker-compose.yaml✅`
  );

  // Copy the installer script to the source directory
  await copyFile(
    "template-files/installer.py",
    `${projectDir}/source/installer.py`,
    { fromPathBaseDir: BaseDirectory.Resource }
  );
  messageCallback(
    (message: string) =>
      message +
      "<br/>copied installer script to source directory at " +
      projectDir +
      "/source/installer.py✅"
  );

  // Update the installer script file permissions
  await runCommand(
    "chmod",
    ["+x", `${projectDir}/source/installer.py`],
    "Making installer script executable"
  );

  const envVars = {
    FRAPPE_PORT_START: frappePortStart.toString(),
    FRAPPE_PORT_END: frappePortEnd.toString(),
    FRAPPE_ALT_PORT_START: frappeAltPortStart.toString(),
    FRAPPE_ALT_PORT_END: frappeAltPortEnd.toString(),
    DB_VIEWER_PORT: dbViewerPort.toString(),
  };

  const envString = Object.entries(envVars)
    .map(([key, value]) => `${key}=${value}`)
    .join(" ");

  await runCommand(
    `cd ${projectDir} && ${envString} docker-compose`,
    ["-f", `docker-compose.yaml`, "up", "-d"],
    "Starting Docker Compose"
  );
  messageCallback(
    (message: string) => message + "<br/>Started Docker Compose✅"
  );

  // Wait for container to start
  const frappeContainerName = `${projectName}-frappe-1`.toLowerCase();

  let isRunning = false;
  while (!isRunning) {
    const inspectResult = await Command.create("exec-sh", [
      "-c",
      `docker inspect -f '{{.State.Running}}' ${frappeContainerName}`,
    ]).execute();
    isRunning = inspectResult.stdout.trim() === "true";
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Get container ID
  const containerIdResult = await Command.create("exec-sh", [
    "-c",
    `docker ps -aqf "name=${frappeContainerName}"`,
  ]).execute();
  const containerId = containerIdResult.stdout.trim();

  // Run installer script inside the container
  await runCommand(
    "docker",
    ["exec", "-i", containerId, "./installer.py"],
    "Running installer script"
  );
  messageCallback(
    (message: string) => message + "<br/>Ran installer script✅"
  );
}

export { setupBench };
