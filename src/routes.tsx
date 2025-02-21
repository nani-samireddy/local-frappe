import { BrowserRouter, Routes, Route } from "react-router";
import Layout from "./components/layout";
import { BenchList } from "./dashboard/bench-list";
import { Settings } from "./dashboard/settings";
import { Models } from "./dashboard/models";

export const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />} >
                    <Route index path="benches" element={<BenchList />} />
                    <Route path="models" element={<Models />} />
                    <Route path="settings" element={<Settings />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}