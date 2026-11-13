import { useState } from "react";
import EmpleadoForm from "../../features/employee/components/employeeForm";
import EmpleadoTable from "../../features/employee/components/employeTable";

export default function AdminUser() {
    const [refreshKey, setRefreshKey] = useState(0);

    return (
        <div className="w-full space-y-8">
            <EmpleadoForm onCreated={() => setRefreshKey((key) => key + 1)} />
            <EmpleadoTable refreshKey={refreshKey} />
        </div>
    );
}