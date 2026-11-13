import { useState } from "react";
import ClienteForm from "../../features/customer/components/customerForm";
import ClienteTable from "../../features/customer/components/customerTable";

export default function AdminisCustomerPage() {
    const [refreshKey, setRefreshKey] = useState(0);

    return (
        <div className="w-full space-y-8">
            <ClienteForm onCreated={() => setRefreshKey((key) => key + 1)} />
            <ClienteTable refreshKey={refreshKey} />
        </div>
    );
}