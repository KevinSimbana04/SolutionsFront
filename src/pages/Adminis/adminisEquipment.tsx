import { useState } from "react";
import EquipoForm from "../../features/equipment/components/equipmentForm";
import EquipoTable from "../../features/equipment/components/equipmentTable";

export default function AdminisEquipmentPage() {
    const [refreshKey, setRefreshKey] = useState(0);

    return (
        <div className="w-full space-y-8">
            <EquipoForm onCreated={() => setRefreshKey((key) => key + 1)} />
            <EquipoTable refreshKey={refreshKey} />
        </div>
    );
}