import { TransactionType } from "src/enums/transaction-type.enum";

export class Transaction {
  readonly id?: number;
  readonly amount: number;
  readonly type: TransactionType;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}