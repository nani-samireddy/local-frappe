import { Database, Edit2, PlusCircle } from "lucide-react";

export const BenchList = () => {
    return (
        <div className="flex flex-col w-full space-y-4">
        <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Bench List</h2>
            <button className="flex items-center space-x-2 text-sm text-gray-500">
            <PlusCircle className="w-4 h-4" />
            <span>Add Bench</span>
            </button>
        </div>
        <div className="flex flex-col w-full space-y-4">
            <div className="flex items-center justify-between p-4 bg-white rounded-md shadow-sm">
            <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-md">
                <Database className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                <h3 className="text-sm font-semibold text-gray-800">Bench 1</h3>
                <p className="text-xs text-gray-500">3 Sites, 2 Apps</p>
                </div>
            </div>
            <button className="flex items-center space-x-2 text-sm text-gray-500">
                <Edit2 className="w-4 h-4" />
                <span>Edit</span>
            </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-white rounded-md shadow-sm">
            <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-md">
                <Database className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                <h3 className="text-sm font-semibold text-gray-800">Bench 2</h3>
                <p className="text-xs text-gray-500">2 Sites, 1 App</p>
                </div>
            </div>
            <button className="flex items-center space-x-2 text-sm text-gray-500">
                <Edit2 className="w-4 h-4" />
                <span>Edit</span>
            </button>
            </div>
        </div>
        </div>
    );
};
