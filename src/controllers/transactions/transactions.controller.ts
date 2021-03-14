import { Controller, Get, UsePipes, ValidationPipe, Headers } from '@nestjs/common';
import { Transaction } from 'src/models/transaction.model';
import { TransactionsService } from 'src/services/transactions/transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private transactionService: TransactionsService) {}

  @Get('history')
  @UsePipes(ValidationPipe)
  public validateToken(
    @Headers('accountNumber') account: number
  ): Promise<Transaction[]> {
    return this.transactionService.getHistory(account);
  }
}
