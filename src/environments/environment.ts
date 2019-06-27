export const environment = {
  production: false,
  accountContext: 'api/1.0.0/hbAccounts',
  customersContext: 'api/1.0.0/hbCustomers',
  referenceDataContext: 'api/1.0.0/hbReferenceData',
  paymentsContext: 'api/1.0.0/hbPayments',
  userContext: 'api/1.0.0/hbUsers',
  cardContext: 'api/1.0.0/hbCards',
  apiUrl: 'https://apim-qa.nvizible.co.za',
  authToken: 'cVY3MzBibUdHbTJtM0I5UlJyeDYxVmJkS0x3YTpiVlZ4Qm5UZWg2WDF6aDFfdWZnX05lR0cxQzBh',
  refreshTokenExpiry: 4.5, // minutes after normal token
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
import 'zone.js/dist/zone-error';  // Included with Angular CLI.
