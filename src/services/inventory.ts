import { axiosInstance, handleApiError } from "@/lib/apiService";

/**
 * ✅ Inventory Product Interface (Ensures All Data is Included)
 */
export interface InventoryProduct {
  id: number;
  store_id: number;
  product_id: number;
  price: number;
  stock_quantity: number;
  low_stock_threshold?: number;
  deleted_at?: string | null; // ✅ Check if product is archived
  product?: {
    id: number;
    name: string;
    sku: string;
    barcode?: string;
    qr_code?: string;
    category_id?: number;
    supplier_id?: number;
    category?: {
      id: number;
      name: string;
    };
    supplier?: {
      id: number;
      name: string;
    };
  };
}

/**
 * ✅ Fetch Inventory (Admins See All, Others See Only Their Store)
 */
export const getInventory = async (includeArchived = false): Promise<InventoryProduct[]> => {
  try {
    const role = sessionStorage.getItem("role");
    const storeId = sessionStorage.getItem("storeId");

    const params: Record<string, any> = { archived: includeArchived };

    // 🔹 Restrict Managers & Cashiers to their store's inventory
    if (role !== "admin" && storeId) {
      params.store_id = storeId;
    }

    const response = await axiosInstance.get(`/inventory`, { params });

    // ✅ Debugging API response
    console.log("📦 Inventory API Response:", response.data);

    return response.data.data || []; // ✅ Always return an array
  } catch (error) {
    console.error("❌ Inventory Fetch Error:", error);
    throw new Error(handleApiError(error));
  }
};

/**
 * ✅ Add a New Product (Admins Only)
 */
export const addProduct = async (productData: Omit<InventoryProduct, "id" | "product">): Promise<InventoryProduct> => {
  try {
    if (sessionStorage.getItem("role") !== "admin") throw new Error("❌ Unauthorized: Only admins can add products.");

    const response = await axiosInstance.post("/inventory/add", productData);
    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * ✅ Update a Product (Admins Only)
 */
export const updateProduct = async (productId: number, productData: Partial<Omit<InventoryProduct, "product">>): Promise<InventoryProduct> => {
  try {
    if (sessionStorage.getItem("role") !== "admin") throw new Error("❌ Unauthorized: Only admins can update products.");

    const response = await axiosInstance.put(`/inventory/update/${productId}`, productData);
    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * ✅ Manage Stock (Managers & Admins Can Adjust Stock)
 */
export const manageStock = async (
  storeProductId: number,
  stockData: { type: string; quantity: number; reason?: string }
): Promise<InventoryProduct> => {
  try {
    const role = sessionStorage.getItem("role");
    if (!["admin", "manager"].includes(role || "")) throw new Error("❌ Unauthorized: Only admins and managers can adjust stock.");

    const response = await axiosInstance.put(`/inventory/manage-stock/${storeProductId}`, stockData);
    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * ✅ Archive a Product (Admins Only)
 */
export const archiveProduct = async (storeProductId: number): Promise<void> => {
  try {
    if (sessionStorage.getItem("role") !== "admin") throw new Error("❌ Unauthorized: Only admins can archive products.");

    await axiosInstance.delete(`/inventory/archive/${storeProductId}`);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * ✅ Restore an Archived Product (Admins Only)
 */
export const restoreProduct = async (storeProductId: number): Promise<void> => {
  try {
    if (sessionStorage.getItem("role") !== "admin") throw new Error("❌ Unauthorized: Only admins can restore products.");

    await axiosInstance.put(`/inventory/restore/${storeProductId}`);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * ✅ Permanently Delete a Product (Admins Only)
 */
export const deleteProduct = async (storeProductId: number): Promise<void> => {
  try {
    if (sessionStorage.getItem("role") !== "admin") throw new Error("❌ Unauthorized: Only admins can delete products.");

    await axiosInstance.delete(`/inventory/delete/${storeProductId}`);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * ✅ Fetch Low-Stock Products (Per Store)
 */
export const getLowStockProducts = async (storeId?: number): Promise<InventoryProduct[]> => {
  try {
    const response = await axiosInstance.get(`/inventory/low-stock`, { params: { store_id: storeId } });
    return response.data.data || [];
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
