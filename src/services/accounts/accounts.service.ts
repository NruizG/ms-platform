import { BadRequestException, HttpService, Injectable, MethodNotAllowedException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RequestQueryBuilder } from '@nestjsx/crud-request';
import { rejects } from 'node:assert';
import { AccountRS } from 'src/dto/account-rs.dto';
import { PatchAccountDto } from 'src/dto/patch-account.dto';
import { TransactionRQ } from 'src/dto/transaction-rq.dto';
import { TransferRS } from 'src/dto/transfer-rs.dto';
import { TransactionType } from 'src/enums/transaction-type.enum';
import { Transaction } from 'src/models/transaction.model';
import { ParserService } from '../parser/parser.service';
import { TransactionsService } from '../transactions/transactions.service';

@Injectable()
export class AccountsService {
  private path: string;

  constructor(
    private configService: ConfigService,
    private parser: ParserService,
    private http: HttpService,
    private transactionService: TransactionsService
  ) {
    this.path = this.configService.get('MS_DATA');
  }

  public async transferFounds(
    customerDni: string,
    destinationDni: string,
    transaction: TransactionRQ
  ): Promise<Transaction> {
    // Validate sufficient balance
    const transferor = await this.getAccount(customerDni);
    if (transferor.balance <= transaction.amount) throw new MethodNotAllowedException('INSUFFICIENT_FUNDS');

    // Checks valid destinationAccount
    const transferee = await this.getAccount(destinationDni);

    // Subtract amount of origin account
    await this.patchAccount(transferor.id, new PatchAccountDto({
      balance: (transferor.balance - transaction.amount)
    }));
    // Create transaction

    const originTransaction = await this.transactionService.createTransaction({
      amount: transaction.amount,
      type: TransactionType.TRANSFEROUT,
      account: transferor.id
    });

    // Add amount to destination account
    await this.patchAccount(transferee.id, new PatchAccountDto({
      balance: (transferee.balance + transaction.amount)
    }));

    // Create transaction
    await this.transactionService.createTransaction({
      amount: transaction.amount,
      type: TransactionType.TRANSFERIN,
      account: transferee.id
    }) ;

    return originTransaction;
  }

  public async getAccount(customerDni: string): Promise<AccountRS> {
    return new Promise<AccountRS>((resolve, rejects) => {
      const query = RequestQueryBuilder.create()
        .setJoin({ field: 'customer'})
        .setFilter({ field: 'customer.dni', operator: '$eq', value: customerDni });
      this.http.get(`${this.path}/accounts?${this.parser.parse(query)}`)
        .subscribe(response => {
          if (response.data.length) {
            resolve(new AccountRS(response.data[0]));
          } else {
            rejects(new NotFoundException('NON-EXISTENT_ACCOUNT'));
          }
        }, error => {
          rejects(new BadRequestException());
        })
    })
  }

  public async patchAccount(accountId: number, payload: PatchAccountDto): Promise<AccountRS> {
    return new Promise<AccountRS>((resolve, rejects) => {
      this.http.patch(`${this.path}/accounts/${accountId}`, payload)
        .subscribe(response => {
          resolve(new AccountRS(response.data[0]));
        }, error => {
          rejects(new BadRequestException());
        })
    })
  }

  public async withdraw(
    customerDni: string,
    transaction: Transaction
  ): Promise<Transaction> {
    // Validate sufficient balance
    const account = await this.getAccount(customerDni);
    if (account.balance <= transaction.amount) throw new MethodNotAllowedException('INSUFFICIENT_FUNDS');
    
    // Substract balance
    await this.patchAccount(account.id, new PatchAccountDto({
      balance: (account.balance - transaction.amount)
    }));

    // Create transaction
    return await this.transactionService.createTransaction({
      amount: transaction.amount,
      type: TransactionType.WITHDRAW,
      account: account.id
    });
  }

  public async loadBalance(
    customerDni: string,
    transaction: Transaction
  ): Promise<Transaction> {
    const account = await this.getAccount(customerDni);

    // Substract balance
    await this.patchAccount(account.id, new PatchAccountDto({
      balance: (account.balance + transaction.amount)
    }));

    // Create transaction
    return await this.transactionService.createTransaction({
      amount: transaction.amount,
      type: TransactionType.DEPOSIT,
      account: account.id
    });
  }
}
