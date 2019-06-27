import { DatePipe } from './date.pipe';

describe('DatePipe', () => {
  it('create an instance', () => {
    const pipe = new DatePipe();
    expect(pipe).toBeTruthy();
  });

  it('should convert date strings', () => {
    const pipe = new DatePipe();
    const result = pipe.transform('20190105');
    expect(result).toEqual('05 Jan 2019');
  });

  it('should handle empty values', () => {
    const pipe = new DatePipe();
    const result = pipe.transform('');
    expect(result).toEqual('');
  });
  it('should handle null  values', () => {
    const pipe = new DatePipe();
    const result = pipe.transform(null);
    expect(result).toEqual('');
  });
});
