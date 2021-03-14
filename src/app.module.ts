import { HttpModule, Module } from '@nestjs/common';
import { AccountsService } from './services/accounts/accounts.service';
import { TransactionsService } from './services/transactions/transactions.service';
import { TransactionsController } from './controllers/transactions/transactions.controller';
import { AccountsController } from './controllers/accounts/accounts.controller';
import { CustomersController } from './controllers/customers/customers.controller';
import { ConfigService } from '@nestjs/config';
import { ParserService } from './services/parser/parser.service';

@Module({
  imports: [
    HttpModule
  ],
  controllers: [
    TransactionsController,
    AccountsController,
    CustomersController
  ],
  providers: [
    AccountsService,
    TransactionsService,
    ConfigService,
    ParserService
  ],
})
export class AppModule {}
