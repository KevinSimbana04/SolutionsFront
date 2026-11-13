import { Outlet } from 'react-router-dom';
import AsideBar from './asideBar';
import TopBar from './topBar';

export default function DashboardLayout() {
    return (
        <div className="flex min-h-screen w-full bg-gray-50">
            <AsideBar />
            <div className="flex min-w-0 flex-1 flex-col">
                <TopBar />
                <main className="flex-1 p-6">
                    <div className="mx-auto w-full max-w-7xl space-y-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}