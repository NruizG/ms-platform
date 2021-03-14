import { Module } from '@nestjs/common';
import { AccountsService } from './services/accounts/accounts.service';
import { TransactionsService } from './services/transactions/transactions.service';
import { TransactionsController } from './controllers/transactions/transactions.controller';
import { AccountsController } from './controllers/accounts/accounts.controller';
import { CustomersController } from './controllers/customers/customers.controller';

@Module({
  imports: [],
  controllers: [
    TransactionsController,
    AccountsController,
    CustomersController
  ],
  providers: [
    AccountsService,
    TransactionsService
  ],
})
export class AppModule {}
