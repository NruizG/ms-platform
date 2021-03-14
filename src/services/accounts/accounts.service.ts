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
    originAccount: number,
    destinationAccount:number,
    transaction: TransactionRQ
  ): Promise<Transaction> {
    // Validate sufficient balance
    const transferor = await this.getAccount(originAccount);
    if (transferor.balance <= transaction.amount) throw new MethodNotAllowedException('INSUFFICIENT_FUNDS');
    // Checks valid destinationAccount
    const transferee = await this.getAccount(destinationAccount);

    // Subtract amount of origin account

    await this.patchAccount(transferor.id, new PatchAccountDto({
      balance: (transferor.balance - transaction.amount)
    }));
    // Create transaction

    const originTransaction = await this.transactionService.createTransaction({
      amount: transaction.amount,
      type: TransactionType.TRANSFEROUT,
      account: transferor.id
    }) ;
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

  public async getAccount(accountNumber: number): Promise<AccountRS> {
    return new Promise<AccountRS>(resolve => {
      const query = RequestQueryBuilder.create()
        .setFilter({ field: 'number', operator: '$eq', value: accountNumber });
      this.http.get(`${this.path}/accounts?${this.parser.parse(query)}`)
        .subscribe(response => {
          if (response.data.length) {
            resolve(new AccountRS(response.data[0]));
          } else {
            throw new NotFoundException('NON-EXISTENT_ACCOUNT');
          }
        }, error => {
          throw new BadRequestException();
        })
    })
  }

  public async patchAccount(accountId: number, payload: PatchAccountDto): Promise<AccountRS> {
    return new Promise<AccountRS>(resolve => {
      this.http.patch(`${this.path}/accounts/${accountId}`, payload)
        .subscribe(response => {
          resolve(new AccountRS(response.data[0]));
        }, error => {
          throw new BadRequestException();
        })
    })
  }
}
