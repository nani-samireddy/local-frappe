import { BreadCrumbs } from "@/components/breadcrumbs";
import { Link, Outlet, useParams } from "react-router";

export const SingleBench = () => {
	const benchName = useParams().bench;
	return (
		<div className="flex flex-col w-full space-y-4">
			<BreadCrumbs />
			<div className="flex flex-col w-full">
				<h1 className="text-4xl font-bold pb-4">{benchName}</h1>
				<div className="flex flex-row gap-4 items-center">
					<Link to="bench-config" className="text-blue-500">Bench Config</Link>
					<Link to="sites" className="text-blue-500">Sites</Link>
					<Link to="apps" className="text-blue-500">Apps</Link>
				</div>
				<Outlet />
			</div>
		</div>
	);
};
