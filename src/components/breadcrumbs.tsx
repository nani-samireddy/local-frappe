import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "./ui/sidebar";
import { Link, useLocation } from "react-router";

export const BreadCrumbs = () => {
	const location = useLocation();
	const pathnames = location.pathname.split("/").filter((x) => x);
	// Add home at the start
	return (
		<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
			<div className="flex items-center gap-2">
				<SidebarTrigger className="-ml-1" />
				<Separator
					orientation="vertical"
					className="mr-2 data-[orientation=vertical]:h-4"
				/>
				<Breadcrumb>
					<BreadcrumbList>
						{
							pathnames.map((breadcrumb, index) => {
								// If this is even index add a separator
								return (
									<div key={index} className="flex items-center">
										{index % 2 === 0 && <BreadcrumbSeparator key={index} />}
										<BreadcrumbItem key={index}>
											{/* If this is last item make it a BreadCrumbPage */}
											{index === pathnames.length - 1 ? (
												<BreadcrumbPage>
													{breadcrumb}
												</BreadcrumbPage>
											) : (
												<span className="capitalize">
													<Link to={`/${breadcrumb}`}>
														{breadcrumb}
													</Link>
												</span>
											)}
										</BreadcrumbItem>
									</div>
								);
							})
						}
					</BreadcrumbList>
				</Breadcrumb>
			</div>
		</header>
	);
};
