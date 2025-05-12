import axiosInstance from '../axios-config';
import { Category } from '@/types';

export const categoryAPI = {
  // Get categories for a specific workspace
  getCategories: async (workspaceId: string) => {
    try {
      const response = await axiosInstance.get(`/categories/${workspaceId}`);
      return { data: { categories: response.data.data } };
    } catch (error) {
      throw error;
    }
  },

  // Create a new category in a workspace
  createCategory: async (
    workspaceId: string,
    categoryData: Omit<Category, 'id'>
  ) => {
    try {
      const response = await axiosInstance.post(
        `/categories/${workspaceId}`,
        categoryData
      );
      return {
        data: { category: response.data.data, message: response.data.message },
      };
    } catch (error) {
      throw error;
    }
  },

  // Update an existing category
  updateCategory: async (
    workspaceId: string,
    categoryId: string,
    categoryData: Partial<Category>
  ) => {
    try {
      const response = await axiosInstance.put(
        `/categories/${workspaceId}/${categoryId}`,
        categoryData
      );
      return {
        data: { category: response.data.data, message: response.data.message },
      };
    } catch (error) {
      throw error;
    }
  },

  // Delete a category
  deleteCategory: async (workspaceId: string, categoryId: string) => {
    try {
      await axiosInstance.delete(`/categories/${workspaceId}/${categoryId}`);
      return { data: { success: true } };
    } catch (error) {
      throw error;
    }
  },
};
