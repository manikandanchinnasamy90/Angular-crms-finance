import { DateTimePipe } from './dateTime.pipe';

describe('DateTunePipe', () => {
  it('create an instance', () => {
    const pipe = new DateTimePipe();
    expect(pipe).toBeTruthy();
  });

  it('should convert date strings', () => {
    const pipe = new DateTimePipe();
    const result = pipe.transform('20190105 190214');
    expect(result).toEqual('05 Jan 2019, 19:02:14');
  });

  it('should handle empty values', () => {
    const pipe = new DateTimePipe();
    const result = pipe.transform('');
    expect(result).toEqual('');
  });
  it('should handle null  values', () => {
    const pipe = new DateTimePipe();
    const result = pipe.transform(null);
    expect(result).toEqual('');
  });
});
