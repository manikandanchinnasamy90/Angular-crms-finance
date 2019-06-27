import { ApiFormBaseComponent } from '../api-form-base/api-form-base.component';
import { ApiModelBase, ServiceResponse, BaseResponse } from '../../../resources/bank-api/bank-api.module';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { QueryParametersService } from '../../../shared/shared.module';
import { FormPropertiesService } from '../../services/form-properties.service';
import { Subscription } from 'rxjs';
import { OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { filter } from 'rxjs/operators';
import { CsvExportService } from '../../services/service-exports';

export class ApiSearchBaseComponent<TSearchForm
  extends ApiModelBase, TSearchResponse extends ApiModelBase>
  extends ApiFormBaseComponent<TSearchForm, TSearchResponse>
  implements OnDestroy, OnInit {

  private _routeChangeSubscription: Subscription;
  private _initializing = true;

  /**
   * @description Indicate of download is being aborted
   */
  public downloadAborting = false;

  /**
   * @description Progress of csv download
   */
  public exportDataProgress = 0;

  /**
   * @description The page title. Should be overridden by extension class
   */
  public title: string;

  /**
   * @description The first page number title. Can be overridden by extension class
   */
  public defaultPageNumber = 0;

  /**
   * @description Indicate whether the component should include paging
   */
  public includesPaging = true;

  /**
   * @description Indicate whether the csv download is being generated
   */
  public generatingDownload = false;

  /**
   * @description The name of the file that will be downloaded
   */
  public downloadFileName = 'file';

  /**
   * @description Whether the search results can be downloaded. If true a button will be added which
   * will call @see getExportData to get the data to include in the download file.
   */
  public canDownload = false;

  /**
   * @description The current page number being viewed
   */
  public get pageNumber(): number {
    return this.queryParameterService.currentSearchPage;
  }

  /**
   * @description Constructor. Subscribe to route change events for result page changes.
   * @param formPropertiesService Injected service
   * @param csvServiceService Injected service
   * @param queryParameterService Injected service
   * @param router Injected service
   * @param activatedRouter Injected service
   * @param modalService Injected service
   */
  constructor(
    _formPropertiesService: FormPropertiesService,
    private csvServiceService: CsvExportService,
    private queryParameterService: QueryParametersService,
    private router: Router,
    private activatedRouter: ActivatedRoute,
    private modalService: NgbModal) {
    super(_formPropertiesService);

    this._routeChangeSubscription = this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    ).subscribe(
      () => {
        if (this._initializing) {
          return;
        }
        this.submit();
      });
  }

  public ngOnInit() {
    super.ngOnInit();
    this._initializing = false;
  }
  /**
  * @description Execute the search and reset the page number if necessary
  */
  public executeSearch() {
    if (this.pageNumber === this.defaultPageNumber) {
      this.submit();
    } else {
      this.router.navigate([], {
        relativeTo: this.activatedRouter,
        queryParams: {
          pageNumber: this.defaultPageNumber
        }
      });
    }
  }

  public async getExportData<T extends ApiModelBase>(): Promise<ServiceResponse<Array<T>>> {
    throw new Error('Not Implemented');
  }

  public cancelDownload() {
    throw new Error('Not Implemented');
  }

  public async dataToCsv<T extends ApiModelBase>(data: Array<T>): Promise<Boolean> {
    return await this.csvServiceService.dataToCsv(data, this.downloadFileName);
  }

  public async onDownloadRequested<T extends ApiModelBase>(_: Event, modalContent: any): Promise<void> {
    this.downloadAborting = false;
    this.generatingDownload = true;
    this.loading = true;

    const modal = this.modalService.open(modalContent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false
    });

    const data = await this.getExportData<T>();
    if (!data.success) {
      this.error = data.error;
      if (this.error != null && typeof this.error.error !== 'string') {
        this.errorObject = new BaseResponse();
        this.errorObject.fromServerObject(this.error.error);
      }

      this.generatingDownload = false;
      this.loading = false;
      modal.close();
      return;
    }
    await this.dataToCsv<T>(data.data);
    this.generatingDownload = false;
    this.loading = false;
    modal.close();
  }

  /**
   * @description Load the previous result page from the API
   */
  public previousPage() {
    this.router.navigate([], {
      relativeTo: this.activatedRouter,
      queryParams: {
        pageNumber: this.pageNumber > this.defaultPageNumber ? this.pageNumber - 1 : this.defaultPageNumber
      }
    });
  }

  /**
   * @description Load the next page from the API
   */
  public nextPage() {
    this.router.navigate([], {
      relativeTo: this.activatedRouter,
      queryParams: {
        pageNumber: this.pageNumber + 1
      }
    });
  }

  /**
   * Angular life cycle method
   */
  ngOnDestroy(): void {
    if (this._routeChangeSubscription != null) {
      this._routeChangeSubscription.unsubscribe();
    }
  }
}
