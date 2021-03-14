import { IsEnum, IsNotEmpty, IsNumber } from "class-validator";
import { TransactionType } from "src/enums/transaction-type.enum";

export class TransactionRQ {
  @IsNotEmpty()
  @IsNumber()
  public amount: number;

  @IsNotEmpty()
  @IsEnum(TransactionType)
  public type: TransactionType;
}