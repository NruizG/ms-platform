export class AccountRS {
  public id: number;
  public number: number;
  public balance: number;

  constructor(data?: any) {
    if(data) {
      this.id = data.id;
      this.number = data.number;
      this.balance = data.balance;
    }
  }
}