export interface Transaction {
  id: number;
  account_id: number;
  amount: number;
  type: 'deposit' | 'withdraw';
  description?: string;
  created_at: string;
}
