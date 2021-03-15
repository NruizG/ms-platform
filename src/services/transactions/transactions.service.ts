import { BadRequestException, HttpService, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RequestQueryBuilder } from '@nestjsx/crud-request';
import { Transaction } from 'src/models/transaction.model';
import { ParserService } from '../parser/parser.service';

@Injectable()
export class TransactionsService {
  public path: string;

  constructor(
    private http: HttpService,
    private configService: ConfigService,
    private parser: ParserService
  ) {
    this.path = this.configService.get('MS_DATA');
  }

  public async createTransaction(transaction: Partial<Transaction>): Promise<Transaction> {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.path}/transactions`, transaction).subscribe(response => {
        resolve(new Transaction(response.data));
      }, err => {
        throw new BadRequestException(err);
      });
    });
  }

  public async getHistory(customerDni: string): Promise<Transaction[]> {
    return new Promise((resolve, reject) => {
      const query = RequestQueryBuilder.create()
      .setJoin({ field: 'customer' })
      .setJoin({ field: 'transactions' })
      .sortBy({ field: 'transactions.createdAt', order: 'DESC'})
      .setFilter({ field: 'customer.dni', operator: '$eq', value: customerDni});
      this.http.get(`${this.path}/accounts?${this.parser.parse(query)}`)
        .subscribe(response => {
          if (!response.data.length) throw new NotFoundException();
          resolve(response.data[0].transactions.map(transaction => new Transaction(transaction)));
        }, error => {
          throw new BadRequestException();
        });
    });
  }
}
