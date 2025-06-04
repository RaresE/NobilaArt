import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const AdminOrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axios.get(`http://localhost:5000/api/admin/orders/${id}`);
        setOrder(response.data);
      } catch (err) {
        setError("Comanda nu a fost găsită!");
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <div className="p-8">Se încarcă...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!order) return <div className="p-8">Comanda nu a fost găsită!</div>;

  // Extrage detalii adresă de livrare
  let shipping = order.shippingAddress;
  if (typeof shipping === 'string') {
    try {
      shipping = shipping ? JSON.parse(shipping) : {};
    } catch {
      shipping = {};
    }
  }
  // Fallback la user.address dacă nu există shippingAddress
  const userAddress = order.user?.address || "";
  const userPhone = order.user?.phone || "";

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Detalii comandă <span className="text-blue-600">#{order.id}</span></h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div>
          <p className="mb-2"><span className="font-semibold">Status:</span> <span className="capitalize">{order.status}</span></p>
          <p className="mb-2"><span className="font-semibold">Total:</span> <span className="text-green-700 font-bold">{order.total} lei</span></p>
          <p className="mb-2"><span className="font-semibold">Metodă plată:</span> {order.paymentMethod}</p>
          <p className="mb-2"><span className="font-semibold">Livrare:</span> {order.deliveryMethod}</p>
        </div>
        <div>
          <p className="mb-2 font-semibold">Adresă livrare:</p>
          <div className="text-gray-700 text-sm">
            <div><span className="font-medium">Nume:</span> {shipping?.name || userAddress || "-"}</div>
            <div><span className="font-medium">Stradă:</span> {shipping?.address || userAddress || "-"}</div>
            <div><span className="font-medium">Oraș:</span> {shipping?.city || "-"}</div>
            <div><span className="font-medium">Județ:</span> {shipping?.state || "-"}</div>
            <div><span className="font-medium">Cod poștal:</span> {shipping?.zipCode || "-"}</div>
            <div><span className="font-medium">Telefon:</span> {shipping?.phone || userPhone || "-"}</div>
          </div>
        </div>
      </div>
      <h2 className="text-xl font-semibold mb-4">Produse:</h2>
      <ul className="divide-y divide-gray-200">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-center py-4">
            <img
              src={item.product.imageUrl || `https://via.placeholder.com/64?text=${item.product.name}`}
              alt={item.product.name}
              className="w-20 h-20 object-cover rounded mr-4 border"
            />
            <div className="flex-1">
              <div className="font-medium text-lg">{item.product.name}</div>
              <div className="text-gray-600">Cantitate: <span className="font-semibold">{item.quantity}</span></div>
              <div className="text-gray-600">Preț: <span className="font-semibold">{item.price} lei</span></div>
              {item.customizations && (
                <div className="text-xs text-gray-500 mt-1">
                  {item.customizations.color && <span>Culoare: {item.customizations.color} </span>}
                  {item.customizations.materialName && <span>Material: {item.customizations.materialName}</span>}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminOrderDetail; 