import ClientOrderList from "@/features/orders/components/customerOrder/clientOrderList";

export default function CustomerHome() {
    return (
        <div className="w-full space-y-8">
            <ClientOrderList />
        </div>
    );
}