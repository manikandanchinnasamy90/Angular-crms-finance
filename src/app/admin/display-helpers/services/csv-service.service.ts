import { Injectable } from '@angular/core';
import { ModelHelper } from '../../display-decorators/display-decorators.module';
import { ApiModelBase } from '../../resources/bank-api/bank-api.module';
import { DataFormats } from '../../display-decorators/models/data-formats.enum';
import { DatePipe } from '../pipes/date.pipe';
import { DateTimePipe } from '../pipes/dateTime.pipe';
import { parse } from 'json2csv';
import { FormPropertiesService } from './form-properties.service';

@Injectable({
  providedIn: 'root'
})
export class CsvExportService {

  constructor(private formPropertiesService: FormPropertiesService) {

  }

  public async dataToCsv<T extends ApiModelBase>(data: Array<T>, fileName: string): Promise<Boolean> {
    try {
      let formattedData: any[] = data;
      // format data
      if (data.length > 0) {
        const displayProperties = ModelHelper.GetDisplayProperties(data[0]);

        formattedData = await Promise.all(await data.map(async (dataItem) => {
          const formattedItem = {};
          for (let i = 0; i < displayProperties.length; i++) {
            const prop = displayProperties[i];
            if (prop.templateOptions.format === DataFormats.date) {
              formattedItem[prop.key] = DatePipe.toDateString(dataItem[prop.key]);
            } else if (prop.templateOptions.format === DataFormats.dateTime) {
              formattedItem[prop.key] = DateTimePipe.toDateTimeString(dataItem[prop.key], ' ');
            } else if (prop.referenceDataApi) {
              formattedItem[prop.key] = dataItem[prop.key];
              const options = await this.formPropertiesService.getFieldReferenceData(prop, null);

              const optionItem = options.filter(o => o[prop.templateOptions.valueProp] === dataItem[prop.key]);
              if (optionItem.length > 0) {
                formattedItem[prop.key] += ' - ' + optionItem[0][prop.templateOptions.labelProp];
              }
            } else {
              formattedItem[prop.key] = dataItem[prop.key];
            }
          }

          return formattedItem;
        }));
      }

      const csv = parse(formattedData, { delimiter: ';' });
      const anchor = document.createElement('a');
      anchor.href = encodeURI('data:application/csv;charset=utf-8,' + csv);
      anchor.setAttribute('download', `${fileName}.csv`);
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }
}
