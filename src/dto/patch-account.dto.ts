export class PatchAccountDto {
  public balance: number;

  constructor(data?: any) {
    this.balance = data.balance;
  }
}