import { homeDir } from "@tauri-apps/api/path";
import { readDir, readTextFile } from "@tauri-apps/plugin-fs";
import { BenchInformation } from "./types";
import { runCommand } from "./setup-bench";

/**
 * Get the list of folders in a directory
 *
 * @param path Path to the directory
 * @returns List of folders in the directory
 */
export const getSubFoldersList = async (path: string) => {
  const folders = await readDir(path);
  return folders
    .filter((folder) => folder.isDirectory)
    .map((folder) => `${path}/${folder.name}`);
};

/**
 * Get the default benches directory
 *
 * @returns Default benches directory
 */
export const getDefaultBenchDir = async () => {
  const home = await homeDir();
  return `${home}/benches`;
};

/**
 * Get the list of sites in a bench
 *
 * @param bench Bench name
 * @returns List of sites in the bench
 */
export const getSitesInBench = async (bench: string) => {
  // Get all the subdirectories in the sites directory of which contains `site_config.json`
  const path = `${bench}/source/frappe-bench/sites`;
  // find sites -mindepth 1 -maxdepth 1 -type d -exec test -f {}/site_config.json \; -print
  //`find sites -mindepth 1 -maxdepth 1 -type d -name '*' | while read dir; do [ -f "$dir/site_config.json" ] && echo "$dir"; done`,

  return await runCommand(
    "find",
    [
      path,
      `-mindepth 1 -maxdepth 1 -type d -name '*' | while read dir; do [ -f "$dir/site_config.json" ] && echo "$dir"; done`,
    ],
    "Get sites in bench"
  ).then(
    (result) => result && result.stdout.split("\n").filter((site) => site)
  );
};

/**
 * Get the list of apps in a bench
 *
 * @param bench Bench name
 * @returns List of apps in the bench
 */
export const getAppsInBench = async (bench: string) => {
  return await getSubFoldersList(`${bench}/source/frappe-bench/apps`);
};

/**
 * Get the information about a bench
 *
 * @param bench_path Path to the bench
 * @returns Information about the bench
 */
export const getBenchInformation = async (bench_path: string) => {
  const composeFile = await readTextFile(`${bench_path}/docker-compose.yaml`);
  const frappeVersion = composeFile.match(/image: frappe\/frappe:(.*)/)?.[1];
  const mariadbVersion = composeFile.match(/image: mariadb:(.*)/)?.[1];
  const whoDBVersion = composeFile.match(/image: wholetale\/wholedb:(.*)/)?.[1];
  const redisCacheVersion = composeFile.match(/image: redis:(.*)/)?.[1];
  const redisQueueVersion = composeFile.match(/image: redis:(.*)/)?.[1];
  
  const sites = await getSitesInBench(bench_path);
  const apps = await getAppsInBench(bench_path);
  console;
  return {
    name: bench_path.split("/").pop(),
    sites,
    apps,
    config: {
      frappeVersion,
      mariadbVersion,
      whoDBVersion,
      benchPath: bench_path,
      redisCacheVersion,
      redisQueueVersion,
    },
  } as BenchInformation;
};

/**
 * Get the information about all the benches
 *
 * @param baseDirectories List of base directories
 * @returns Information about all the benches
 */
export const getBenchesInformation = async (
  baseDirectories: string[] = []
) => {
  // If there are no base directories, then search in the default benches directory.
  if (baseDirectories.length === 0) {
    baseDirectories.push(await getDefaultBenchDir());
  }
  const allBenches = await Promise.all(baseDirectories.map(getSubFoldersList));

  return await Promise.all(allBenches.flat().map(getBenchInformation));
};
