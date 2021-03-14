import { Body, Controller, Post, UsePipes, ValidationPipe, Headers, Param } from '@nestjs/common';
import { TransactionRQ } from 'src/dto/transaction-rq.dto';
import { Transaction } from 'src/models/transaction.model';
import { AccountsService } from 'src/services/accounts/accounts.service';

@Controller('accounts')
export class AccountsController {
  constructor(private accountService: AccountsService) { }

  @Post(':number/transfer')
  @UsePipes(ValidationPipe)
  public login(
    @Headers('accountNumber') originAccount: number,
    @Param('number') destinationAccount,
    @Body() transaction: TransactionRQ
  ): Promise<Transaction> {
    return this.accountService.transferFounds(originAccount, destinationAccount,
      transaction);
  }

  @Post('/withdraw')
  @UsePipes(ValidationPipe)
  public withdraw(
    @Headers('accountNumber') acount: number,
    @Body() transaction: TransactionRQ
  ): Promise<Transaction> {
    return this.accountService.withdraw(acount, transaction);
  }

  @Post('/deposit')
  @UsePipes(ValidationPipe)
  public loadBalance(
    @Headers('accountNumber') acount: number,
    @Body() transaction: TransactionRQ
  ): Promise<Transaction> {
    return this.accountService.loadBalance(acount, transaction);
  }
}
