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

export async function runCommand(cmd: string, args: string[], step: string) {
  try {
    const result = await Command.create("exec-sh", [
      "-c",
      `${cmd} ${args.join(" ")}`,
    ]).execute();
    if (!result.code) {
      console.error(`Error in step: ${step}\n${result.stderr}`);
    }
    return result;
  } catch (error) {
    console.error(`Failed to execute ${step}:`, error);
  }
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

  const [frappePortStart, frappeAltPortStart, dbViewerPort] = [
    unused_ports[0],
    unused_ports[6],
    unused_ports[12],
  ];
  setProgressState(
    (message: string) =>
      message +
      "<br/>Got available ports for services✅ Frappe Port: " +
      frappePortStart +
      " Frappe Alt Port: " +
      frappeAltPortStart +
      " DB Viewer Port: " +
      dbViewerPort
  );
  const frappePortEnd = frappePortStart + 5;
  const frappeAltPortEnd = frappeAltPortStart + 5;

  // Create source directory
  await mkdir(`${projectDir}/source`, { recursive: true });
  // Append the message to the callback
  setProgressState(
    (message: string) =>
      message + "<br/>created source directory at " + projectDir + "/source✅"
  );
  // Create logs directory
  await mkdir(`${projectDir}/logs`, { recursive: true });
  setProgressState(
    (message: string) =>
      message + "<br/>created logs directory at " + projectDir + "/logs✅"
  );

  // Create bench.log file
  await create(`${projectDir}/logs/bench.log`);
  setProgressState(
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
  setProgressState(
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
  setProgressState(
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
  setProgressState(
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
  setProgressState(
    (message: string) => message + "<br/>Ran installer script✅"
  );
}

export { setupBench };
