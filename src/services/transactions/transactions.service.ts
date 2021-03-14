import { BadRequestException, HttpService, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transaction } from 'src/models/transaction.model';

@Injectable()
export class TransactionsService {
  public path: string;

  constructor(
    private http: HttpService,
    private configService: ConfigService
  ) {
    this.path = this.configService.get('MS_DATA');
  }

  public async createTransaction(transaction: Partial<Transaction>): Promise<Transaction> {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.path}/transactions`, transaction).subscribe(response => {
        resolve(new Transaction(response.data));
      }, err => {
        console.log(err)
        throw new BadRequestException();
      });
    });
  }
}
