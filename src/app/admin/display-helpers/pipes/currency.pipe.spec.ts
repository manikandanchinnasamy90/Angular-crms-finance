import { CurrencyPipe } from './currency.pipe.';


describe('DatePipe', () => {
  it('create an instance', () => {
    const pipe = new CurrencyPipe();
    expect(pipe).toBeTruthy();
  });

  it('should convert number values', () => {
    const pipe = new CurrencyPipe();
    const result = pipe.transform(123);
    expect(result).toEqual('R 123.00');
  });

  it('should handle decimals', () => {
    const pipe = new CurrencyPipe();
    const result = pipe.transform(123.129);
    expect(result).toEqual('R 123.13');
  });

  it('should handle null values', () => {
    const pipe = new CurrencyPipe();
    const result = pipe.transform(null);
    expect(result).toEqual('');
  });

  it('should handle string values', () => {
    const pipe = new CurrencyPipe();
    const result = pipe.transform('72' as any);
    expect(result).toEqual('R 72.00');
  });

  it('should handle not number values', () => {
    const pipe = new CurrencyPipe();
    const result = pipe.transform('72asd' as any);
    expect(result).toEqual('Not a number');
  });

  it('should handle negative values', () => {
    const pipe = new CurrencyPipe();
    const result = pipe.transform(-123.22);
    expect(result).toEqual('R -123.22');
  });
});
