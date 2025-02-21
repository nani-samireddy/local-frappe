import { homeDir } from "@tauri-apps/api/path";
import { readDir } from "@tauri-apps/plugin-fs";
import { BenchInformation } from "./types";

/**
 * Get the list of folders in a directory
 *
 * @param path Path to the directory
 * @returns List of folders in the directory
 */
export const get_folders_list = async (path: string) => {
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
export const get_default_benches_dir = async () => {
  const home = await homeDir();
  return `${home}/benches`;
};

/**
 * Get the list of sites in a bench
 *
 * @param bench Bench name
 * @returns List of sites in the bench
 */
export const get_sites_in_bench = async (bench: string) => {
  return await get_folders_list(`${bench}/source/frappe-bench/sites`);
};

/**
 * Get the list of apps in a bench
 *
 * @param bench Bench name
 * @returns List of apps in the bench
 */
export const get_apps_in_bench = async (bench: string) => {
  return await get_folders_list(`${bench}/source/frappe-bench/apps`);
};

/**
 * Get the information about a bench
 *
 * @param bench_path Path to the bench
 * @returns Information about the bench
 */
export const get_bench_information = async (bench_path: string) => {
  const sites = await get_sites_in_bench(bench_path);
  const apps = await get_apps_in_bench(bench_path);

  return {
    name: bench_path.split("/").pop(),
    sites,
    apps,
  } as BenchInformation;
};

/**
 * Get the information about all the benches
 *
 * @param baseDirectories List of base directories
 * @returns Information about all the benches
 */
export const get_benches_information = async (baseDirectories: string[]) => {
  const allBenches = await Promise.all(baseDirectories.map(get_folders_list));

  return await Promise.all(allBenches.flat().map(get_bench_information));
};
