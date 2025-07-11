import { getBenchesInformation } from "@/actions/helper-functions";
import { BenchInformation } from "@/actions/types";
import { CreateBenchDialog } from "@/components/actions/create-bench-dialog";
import { BreadCrumbs } from "@/components/breadcrumbs";
import { BenchDetails, listBenches } from "@/lib/bench";
import { getBenchMetadata } from "@/lib/storage/registry";
import { Database, MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";

export const BenchList = () => {
	const [benches, setBenches] = useState<BenchDetails[]>([]);
	useEffect(() => {
		const get_benches = async () => {
			const benchesInfo = await listBenches();
			// const benchesInfo = await getBenchMetadata();
			setBenches(benchesInfo);
			// Log the fetched benches for debugging
			console.log("Fetched benches:", benchesInfo);
		};
		get_benches();

		return () => {
			setBenches([]);
		};
	}, []);
	return (
		<div className="flex flex-col w-full space-y-4">
			<BreadCrumbs />
			<div className="flex flex-col flex-1 ">
				<div className="flex items-center justify-between p-4 rounded-md">
					<h2 className=" font-semibold text-gray-800">Bench List</h2>
					<CreateBenchDialog />
				</div>

				<div className="flex flex-row items-center gap-4 w-full p-4">
					{
						benches.map((bench) => (
							<Link key={bench.name} to={`/benches/${bench.name}/bench-config`}>
								<div className="flex items-center gap-4 justify-between p-4 bg-white rounded-md shadow-sm hover:scale-105 transition-transform duration-300 ease-in-out hover:shadow-lg cursor-pointer">
									<div className="flex items-center space-x-4">
										<div className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-md">
											<Database className="w-4 h-4 text-gray-500" />
										</div>
										<div>
											<h3 className="text-sm font-semibold text-gray-800">{bench.name}</h3>
											<p className="text-xs text-gray-500">{bench.sites.length} Sites, {bench.apps.length} Apps</p>
										</div>
									</div>
									<button className="flex items-center space-x-2 text-sm text-gray-500">
										<MoreHorizontal className="w-4 h-4" />
									</button>
								</div>
							</Link>
						))
					}
				</div>
			</div>
		</div>
	);
};
