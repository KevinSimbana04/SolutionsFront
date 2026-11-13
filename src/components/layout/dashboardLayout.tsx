import { Outlet } from 'react-router-dom';
import AsideBar from './asideBar';
import TopBar from './topBar';

export default function DashboardLayout() {
    return (
        <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
            <AsideBar />
            <div className="flex-1 flex flex-col min-w-0 h-full">
                <TopBar />
                <main className="flex-1 p-6 overflow-y-auto">

                    <div className="mx-auto w-full max-w-7xl space-y-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}