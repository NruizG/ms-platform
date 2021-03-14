import { TransactionRQ } from "./transaction-rq.dto";

export class TransferRS extends TransactionRQ {
  public account: number;

  constructor(data?: any) {
    super();
    this.account = data.account;
  }
}