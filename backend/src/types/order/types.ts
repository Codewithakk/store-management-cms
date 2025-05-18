export type OrderAddress = {
  id: string
  address: string
  street: string | null
  city: string
  region: string
  postalCode: string
  country: string
  isDeleted: boolean
}
export type OrderPreviewItem = {
  variantId: string;
  quantity: number;
}
