export class OrderEntity {
  id: string;
  createdAt: NativeDate;
  updatedAt: NativeDate;
  product?: string;
  amount?: number;
  codeUrl?: string;
  status?: string;
}
