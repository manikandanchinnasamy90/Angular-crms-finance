import { HttpErrorResponse } from '@angular/common/http';

/**
 * @description Expected response for all APIs
 */
export interface ServiceResponse<TObject> {

  /**
   * @description Whether the call was a success or failure
   */
  success: boolean;

  /**
   * @description If not success, the error message, else null
   */
  error: HttpErrorResponse | null;

  /**
   *  @description If success, the returned data, else null
   */
  data: TObject | null;
}
