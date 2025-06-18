// import { useState } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import axios from "axios";
// import { z } from "zod";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Loader2, CheckCircle, Trash2, Edit2 } from "lucide-react";

// // Define API endpoints
// const API_BASE = "/api/inventory";
// const endpoints = {
//   fetchProducts: `${API_BASE}/products`,
//   createProduct: `${API_BASE}/products/create`,
//   updateProduct: `${API_BASE}/products/update`,
//   deleteProduct: `${API_BASE}/products/delete`,
// };

// // Zod schema for product form validation
// const productSchema = z.object({
//   name: z.string().min(1, "Name is required"),
//   sku: z.string().min(1, "SKU is required"),
//   quantity: z.number().min(0, "Quantity must be at least 0"),
//   threshold: z.number().min(0, "Threshold must be at least 0"),
//   description: z.string().optional(),
// });

// export default function InventoryDashboard() {
//   const queryClient = useQueryClient();
//   const [editingProduct, setEditingProduct] = useState(null);

//   // Fetch products
//   const { data: products, isLoading } = useQuery(["products"], async () => {
//     const response = await axios.get(endpoints.fetchProducts);
//     return response.data;
//   });

//   // Create product mutation
//   const createProductMutation = useMutation(
//     async (newProduct) => {
//       await axios.post(endpoints.createProduct, newProduct);
//     },
//     {
//       onSuccess: () => queryClient.invalidateQueries(["products"]),
//     }
//   );

//   // Update product mutation
//   const updateProductMutation = useMutation(
//     async (updatedProduct) => {
//       await axios.put(endpoints.updateProduct, updatedProduct);
//     },
//     {
//       onSuccess: () => queryClient.invalidateQueries(["products"]),
//     }
//   );

//   // Delete product mutation
//   const deleteProductMutation = useMutation(
//     async (productId) => {
//       await axios.delete(`${endpoints.deleteProduct}/${productId}`);
//     },
//     {
//       onSuccess: () => queryClient.invalidateQueries(["products"]),
//     }
//   );

//   // Form setup
//   const {
//     register,
//     handleSubmit,
//     reset,
//     formState: { errors },
//   } = useForm({
//     resolver: zodResolver(productSchema),
//   });

//   const onSubmit = (data) => {
//     if (editingProduct) {
//       updateProductMutation.mutate({ ...data, id: editingProduct.id });
//     } else {
//       createProductMutation.mutate(data);
//     }
//     reset();
//     setEditingProduct(null);
//   };

//   return (
//     <div className="flex bg-white dark:bg-[#111827] min-h-screen">
//       {/* Sidebar */}
//       <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-[#1E1E1E] shadow">
//         <nav className="flex flex-col space-y-4 p-4">
//           <a href="#" className="text-[#A17E25] dark:text-[#D4AF37] font-bold">
//             Inventory Dashboard
//           </a>
//         </nav>
//       </aside>

//       {/* Main Content */}
//       <main className="flex-1 p-6 overflow-auto">
//         <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
//           Inventory Management
//         </h1>

//         {/* Product Table */}
//         <div className="bg-white dark:bg-[#1E293B] rounded-lg shadow p-4 mb-6">
//           {isLoading ? (
//             <div className="flex items-center justify-center">
//               <Loader2 className="h-6 w-6 animate-spin text-[#A17E25] dark:text-[#D4AF37]" />
//             </div>
//           ) : (
//             <table className="min-w-full divide-y divide-gray-300 dark:divide-[#374151]">
//               <thead className="bg-gray-50 dark:bg-[#1E293B]">
//                 <tr>
//                   <th className="px-4 py-2 text-left text-sm font-medium text-gray-800 dark:text-gray-200">
//                     Name
//                   </th>
//                   <th className="px-4 py-2 text-left text-sm font-medium text-gray-800 dark:text-gray-200">
//                     SKU
//                   </th>
//                   <th className="px-4 py-2 text-left text-sm font-medium text-gray-800 dark:text-gray-200">
//                     Quantity
//                   </th>
//                   <th className="px-4 py-2 text-left text-sm font-medium text-gray-800 dark:text-gray-200">
//                     Threshold
//                   </th>
//                   <th className="px-4 py-2 text-left text-sm font-medium text-gray-800 dark:text-gray-200">
//                     Status
//                   </th>
//                   <th className="px-4 py-2 text-left text-sm font-medium text-gray-800 dark:text-gray-200">
//                     Description
//                   </th>
//                   <th className="px-4 py-2 text-left text-sm font-medium text-gray-800 dark:text-gray-200">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200 dark:divide-[#374151]">
//                 {products.map((product) => (
//                   <tr
//                     key={product.id}
//                     className={`${product.quantity < product.threshold
//                       ? "bg-red-50 dark:bg-[#3E3E3E]"
//                       : ""
//                       }`}
//                   >
//                     <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">
//                       {product.name}
//                     </td>
//                     <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">
//                       {product.sku}
//                     </td>
//                     <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">
//                       {product.quantity}
//                     </td>
//                     <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">
//                       {product.threshold}
//                     </td>
//                     <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">
//                       {product.quantity < product.threshold ? (
//                         <span className="text-[#E53E3E] dark:text-[#FC8181]">
//                           Low stock
//                         </span>
//                       ) : (
//                         "In stock"
//                       )}
//                     </td>
//                     <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">
//                       {product.description || "N/A"}
//                     </td>
//                     <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 flex space-x-2">
//                       <button
//                         onClick={() => setEditingProduct(product)}
//                         className="text-[#A17E25] dark:text-[#D4AF37]"
//                       >
//                         <Edit2 className="w-5 h-5" />
//                       </button>
//                       <button
//                         onClick={() => deleteProductMutation.mutate(product.id)}
//                         className="text-[#E53E3E] dark:text-[#FC8181]"
//                       >
//                         <Trash2 className="w-5 h-5" />
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           )}
//         </div>

//         {/* Product Form */}
//         <div className="bg-white dark:bg-[#1E293B] rounded-lg shadow p-4">
//           <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
//             {editingProduct ? "Edit Product" : "Add Product"}
//           </h2>
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//             <div>
//               <label
//                 htmlFor="name"
//                 className="block text-sm font-medium text-gray-800 dark:text-gray-200"
//               >
//                 Name
//               </label>
//               <input
//                 id="name"
//                 {...register("name")}
//                 defaultValue={editingProduct?.name || ""}
//                 className="w-full px-4 py-2 border border-gray-300 dark:border-[#374151] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A17E25] dark:focus:ring-[#D4AF37] bg-transparent text-gray-800 dark:text-gray-200 placeholder:text-gray-500 dark:placeholder:text-gray-400"
//               />
//               {errors.name && (
//                 <p className="mt-1 text-[12px] text-[#E53E3E] dark:text-[#FC8181]">
//                   {errors.name.message}
//                 </p>
//               )}
//             </div>
//             <div>
//               <label
//                 htmlFor="sku"
//                 className="block text-sm font-medium text-gray-800 dark:text-gray-200"
//               >
//                 SKU
//               </label>
//               <input
//                 id="sku"
//                 {...register("sku")}
//                 defaultValue={editingProduct?.sku || ""}
//                 className="w-full px-4 py-2 border border-gray-300 dark:border-[#374151] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A17E25] dark:focus:ring-[#D4AF37] bg-transparent text-gray-800 dark:text-gray-200 placeholder:text-gray-500 dark:placeholder:text-gray-400"
//               />
//               {errors.sku && (
//                 <p className="mt-1 text-[12px] text-[#E53E3E] dark:text-[#FC8181]">
//                   {errors.sku.message}
//                 </p>
//               )}
//             </div>
//             <div>
//               <label
//                 htmlFor="quantity"
//                 className="block text-sm font-medium text-gray-800 dark:text-gray-200"
//               >
//                 Quantity
//               </label>
//               <input
//                 id="quantity"
//                 type="number"
//                 {...register("quantity")}
//                 defaultValue={editingProduct?.quantity || ""}
//                 className="w-full px-4 py-2 border border-gray-300 dark:border-[#374151] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A17E25] dark:focus:ring-[#D4AF37] bg-transparent text-gray-800 dark:text-gray-200 placeholder:text-gray-500 dark:placeholder:text-gray-400"
//               />
//               {errors.quantity && (
//                 <p className="mt-1 text-[12px] text-[#E53E3E] dark:text-[#FC8181]">
//                   {errors.quantity.message}
//                 </p>
//               )}
//             </div>
//             <div>
//               <label
//                 htmlFor="threshold"
//                 className="block text-sm font-medium text-gray-800 dark:text-gray-200"
//               >
//                 Threshold
//               </label>
//               <input
//                 id="threshold"
//                 type="number"
//                 {...register("threshold")}
//                 defaultValue={editingProduct?.threshold || ""}
//                 className="w-full px-4 py-2 border border-gray-300 dark:border-[#374151] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A17E25] dark:focus:ring-[#D4AF37] bg-transparent text-gray-800 dark:text-gray-200 placeholder:text-gray-500 dark:placeholder:text-gray-400"
//               />
//               {errors.threshold && (
//                 <p className="mt-1 text-[12px] text-[#E53E3E] dark:text-[#FC8181]">
//                   {errors.threshold.message}
//                 </p>
//               )}
//             </div>
//             <div>
//               <label
//                 htmlFor="description"
//                 className="block text-sm font-medium text-gray-800 dark:text-gray-200"
//               >
//                 Description
//               </label>
//               <textarea
//                 id="description"
//                 {...register("description")}
//                 defaultValue={editingProduct?.description || ""}
//                 className="w-full px-4 py-2 border border-gray-300 dark:border-[#374151] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A17E25] dark:focus:ring-[#D4AF37] bg-transparent text-gray-800 dark:text-gray-200 placeholder:text-gray-500 dark:placeholder:text-gray-400"
//               />
//               {errors.description && (
//                 <p className="mt-1 text-[12px] text-[#E53E3E] dark:text-[#FC8181]">
//                   {errors.description.message}
//                 </p>
//               )}
//             </div>
//             <button
//               type="submit"
//               className="w-full bg-[#A17E25] hover:bg-[#8C6A1A] dark:bg-[#D4AF37] dark:hover:bg-[#BFA132] text-white rounded-lg py-2 disabled:opacity-50"
//             >
//               {editingProduct ? "Update Product" : "Add Product"}
//             </button>
//           </form>
//         </div>
//       </main>
//     </div>
//   );
// }