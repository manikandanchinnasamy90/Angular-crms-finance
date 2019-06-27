import { Component, OnInit, ElementRef } from '@angular/core';
import * as xlsx from 'xlsx';
import {
  CorporatePlusMultipleOnceOffPaymentsRequest,
  FinanceApiService,
  CorporatePlusMultipleOnceOffPaymentsItem
} from '../../resources/bank-api/bank-api.module';
import { ModelHelper, DisplayOptions } from '../../display-decorators/display-decorators.module';
import { Result, GetBankCodesResponse, GetAccountTypesResponse } from '../../resources/reference-api/reference-api.module';
import { CorporatePlusMultipleOnceOffPaymentsResults } from '../models/corporate-plus-multiple-once-off-payments-results';
import { ReferenceDataService } from '../../resources/reference-api/services/reference-data.service';
import { CorporatePaymentExcelItem } from '../models/corporate-payment-excel-item';
import { CsvExportService } from '../../display-helpers/display-helpers.module';
import { CorporatePlusMultipleOnceOffPaymentsItemResults } from '../models/corporate-plus-multiple-once-off-payments-item-results';

@Component({
  selector: 'app-corporate-multi-payment-excel',
  templateUrl: './corporate-multi-payment-excel.component.html',
  styleUrls: ['./corporate-multi-payment-excel.component.scss']
})
export class CorporateMultiPaymentExcelComponent implements OnInit {
  public error: String = '';
  public data = new CorporatePlusMultipleOnceOffPaymentsRequest();
  public results: CorporatePlusMultipleOnceOffPaymentsResults;
  public loadingFile = false;
  public callingApi = false;
  public doc = document;
  public importIsValid: boolean;
  public invalidRows: Array<number> = [];
  public importResultsMetaData: DisplayOptions;

  public get totalPaymentAmount(): number {
    return this.data.listOfPayments.map(i => i.amount).reduce((total, num) => {
      let toAdd = num;
      if (isNaN(num)) {
        toAdd = 0;
      }
      return total + toAdd;
    });
  }

  private template = {
    columnCount: 10,
    columnsNames: {
      'fromAccount': 0,
      'toAccountNumber': 1,
      'toBank': 2,
      'toBranchCode': 3,
      'toAccountName': 4,
      'toAccountType': 5,
      'amount': 6,
      'notificationType': 7,
      'fromReference': 8,
      'toReference': 9,
    }
  };

  constructor(
    private financeApiService: FinanceApiService,
    private elem: ElementRef,
    private referenceDataService: ReferenceDataService,
    private csvServiceService: CsvExportService,
  ) { }

  ngOnInit() {
    this.importResultsMetaData = ModelHelper.GetDisplayProperties(this.data)[0];
  }

  public openFile(event: Event) {
    this.loadingFile = true;
    const input = event.target as HTMLInputElement;

    const files = input.files;
    if (files == null || !files || files.length === 0) {
      this.error = 'No file uploaded';
      this.loadingFile = false;
      input.value = input.defaultValue;
      return;
    }

    const file = files[0];
    const fileReader = new FileReader();
    fileReader.onload = async () => {
      try {
        const excelFile = xlsx.read(fileReader.result, { type: 'binary', cellDates: true, cellStyles: true });
        const excelData = this.getExcelData(excelFile);
        const convertedData = [];

        const item = new CorporatePaymentExcelItem();
        const propertyNames = Object.getOwnPropertyNames(item);
        for (let rowIndex = 1; rowIndex < excelData.length; rowIndex++) {
          const paymentInfoRow = excelData[rowIndex];

          const paymentInfoObject = new CorporatePaymentExcelItem();
          propertyNames.forEach((property) => {
            paymentInfoObject[property] = paymentInfoRow[this.template.columnsNames[property]];
          });

          const payment = new CorporatePlusMultipleOnceOffPaymentsItem();
          payment.fromServerObject(paymentInfoObject);
          payment.toAccountTypeCode = await this.getAccountType(paymentInfoObject.toAccountType);
          payment.toBankCode = await this.getBankCode(paymentInfoObject.toBank);
          convertedData.push(payment);
        }
        this.data.listOfPayments = convertedData;
      } catch (error) {
        console.error(error);
        this.error = 'File is not a valid excel file';
        this.data.listOfPayments = [];
      }
      this.loadingFile = false;

      setTimeout(() => {
        const invalidCells = (this.elem.nativeElement as HTMLElement).querySelectorAll('td.array-table-invalid');
        this.invalidRows = [];
        for (let i = 0; i < invalidCells.length; i++) {
          const cell = invalidCells[i];
          if (cell.parentElement != null && (cell.parentElement as HTMLTableRowElement).rowIndex != null) {
            this.invalidRows.push((cell.parentElement as HTMLTableRowElement).rowIndex);
          }
        }

        this.invalidRows = this.invalidRows.filter((v, i, a) => a.indexOf(v) === i);
        this.importIsValid = invalidCells.length === 0;
      });
    };
    fileReader.readAsBinaryString(file);
  }

  public getExcelData(file: xlsx.WorkBook): Array<Array<string>> {
    const data = [];
    if (file.SheetNames.length <= 0) {
      return data;
    }

    const sheetName = file.SheetNames[0];
    const sheet = file.Sheets[sheetName];

    let row = 0;

    let rowHasValue = false;
    do {
      const rowData = [];
      rowHasValue = false;
      for (let col = 0; col < this.template.columnCount; col++) {
        const cellToCheck = this.indexToCellName(col, row);
        const cell = sheet[cellToCheck];
        rowHasValue = rowHasValue || cell != null;
        rowData.push(cell != null ? cell.v : null);
      }
      if (rowHasValue) {
        data.push(rowData);
        row++;
      }
    } while (rowHasValue && row < 1048576);

    return data;
  }

  private indexToCellName(col: number, row: number): string {
    let columnString: string;
    if (col > 26) {
      columnString = 'Z';
      console.warn('Does not support sheets larger than 26 columns');
    } else {
      const startCharCode = 'A'.charCodeAt(0);
      columnString = String.fromCharCode(startCharCode + col);
    }

    return `${columnString}${row + 1}`;
  }

  public async processPayments() {
    if (this.totalPaymentAmount > 5000) {
      return;
    }
    this.callingApi = true;

    this.results = new CorporatePlusMultipleOnceOffPaymentsResults();
    this.results.fromServerObject(this.data);

    // make sure the type is correct so that the export has all the columns
    this.results.listOfPayments = this.results.listOfPayments.map(paymentRequest => {
      const paymentResult = new CorporatePlusMultipleOnceOffPaymentsItemResults();
      paymentResult.fromServerObject(paymentRequest);
      return paymentResult;
    });

    // page by 20
    const pageSize = 20;
    const pages = Math.ceil(this.data.listOfPayments.length / pageSize);
    for (let i = 0; i < pages; i++) {
      // build request
      const request = new CorporatePlusMultipleOnceOffPaymentsRequest();
      request.listOfPayments = this.data.listOfPayments.slice(i * pageSize, (i + 1) * pageSize);

      // call api
      const pageResult = await this.financeApiService.corporatePlusMultiPayments(request);

      // handle response
      if (pageResult.success === false) {
        request.listOfPayments.forEach((_, index) => {
          const errorDescription =
            (
              pageResult.error.error != null &&
              pageResult.error.error.result != null &&
              (pageResult.error.error.result as Result).responseDescription
            ) || pageResult.error.message;

          this.results.listOfPayments[i * pageSize + index].success = 'Failed';

          this.results.listOfPayments[i * pageSize + index].message = errorDescription;

          this.results.listOfPayments[i * pageSize + index].transactionId = -1;
        });
      } else {
        pageResult.data.paymentResponseList.forEach((r, index) => {
          this.results.listOfPayments[i * pageSize + index].success = r.responseCode === 0 ? 'Success' : 'Failed';
          this.results.listOfPayments[i * pageSize + index].message = `${r.responseCode} - ${r.responseDescription}`;
          this.results.listOfPayments[i * pageSize + index].transactionId = r.transactionID;
        });
      }
    }

    this.callingApi = false;
  }


  private async getBankCode(bankName: string): Promise<string> {
    const bankCodes = await this.referenceDataService.getAll<GetBankCodesResponse>({
      endpoint: 'bankCodes',
      type: GetBankCodesResponse
    });

    if (bankCodes != null && bankCodes.data != null && bankCodes.data.bankCodes != null) {
      const matches = bankCodes.data.bankCodes.filter((b) => b.bankDescription === bankName);
      if (matches.length > 0) {
        return matches[0].bankCode;
      }
    }
    return null;
  }
  private async getAccountType(accountTypeName: string): Promise<number> {
    const bankCodes = await this.referenceDataService.getAll<GetAccountTypesResponse>({
      endpoint: 'accountTypeCodes',
      type: GetAccountTypesResponse
    });

    if (bankCodes != null && bankCodes.data != null && bankCodes.data.accountTypes != null) {
      const matches = bankCodes.data.accountTypes.filter((b) => b.accountTypeDescription === accountTypeName);
      if (matches.length > 0) {
        return matches[0].accountTypeCode;
      }
    }
    return null;
  }

  public downloadResults() {
    this.csvServiceService.dataToCsv(this.results.listOfPayments, 'bulk-payment-results');
  }
}
