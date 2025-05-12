import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../axios-config";

// Types
interface StaffMember {
  id: string;
  firstName: string;
  email: string;
  // other staff properties
}

interface ApiResponse<T> {
  data: T;
  error?: string;
}

export const staffAPI = {
  // Get all staff for a workspace
  getAllStaff: async (workspaceId: string): Promise<ApiResponse<StaffMember[]>> => {
    try {
      console.log("Fetching staff members for workspace ID:", workspaceId);
      const response = await axiosInstance.get(`/orders/workspaces/${workspaceId}/staff`);
      return { data: response.data.data };
    } catch (error: any) {
      return {
        data: [],
        error: error.message || "Failed to fetch staff members"
      };
    }
  },

  // // Assign staff to order
  // assignStaffToOrder: async (
  //   workspaceId: string, 
  //   orderId: string,
  //   staffId: string
  // ): Promise<{ success: boolean; message?: string }> => {
  //   try {
  //     const response = await axiosInstance.post(
  //       `/orders/workspaces/${workspaceId}/orders/${orderId}/assign`, 
  //       { staffId }
  //     );
  //     return { success: true, ...response.data };
  //   } catch (error: any) {
  //     return {
  //       success: false,
  //       message: error.response?.data?.message || "Failed to assign staff"
  //     };
  //   }
  // }
};

// React Query hook
export const useStaffMembers = (workspaceId: string) => {
  return useQuery({
    queryKey: ['staff', workspaceId],
    queryFn: () => staffAPI.getAllStaff(workspaceId),
    select: (response) => response.data,
    enabled: !!workspaceId,
  });
};