import { BrowserRouter, Routes, Route } from "react-router";
import Layout from "@/components/layout";
import { BenchList } from "@/dashboard/bench-list";
import { Settings } from "@/dashboard/settings";
import { Models } from "@/dashboard/models";
import { SingleBench } from "@/dashboard/bench/single-bench";
import { BenchConfig } from "@/dashboard/bench/bench-config";
import { BenchSites } from "@/dashboard/bench/bench-sites";
import { BenchApps } from "@/dashboard/bench/bench-apps";

export const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />} >
                    <Route index path="benches" element={<BenchList />} />
                    <Route path="/benches/:bench" element={<SingleBench />}>
                        <Route path="bench-config" element={<BenchConfig />} />
                        <Route path="sites" element={<BenchSites />} />
                        <Route path="apps" element={<BenchApps />} />
                    </Route>
                    <Route path="models" element={<Models />} />
                    <Route path="settings" element={<Settings />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
