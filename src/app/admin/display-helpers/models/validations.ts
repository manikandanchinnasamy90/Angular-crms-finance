import { FormControl } from '@angular/forms';

export interface Validations {
    [key: string]: { expression: (control: FormControl) => boolean, message: string, errorPath: string };
}
