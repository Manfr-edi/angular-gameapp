import { AngularFirestore } from "@angular/fire/firestore";
import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from "@angular/forms";
import { from, Observable } from "rxjs";
import { debounceTime, map } from "rxjs/operators";
import { UserCollectionService } from "./services/user-collection.service";
import { UtilService } from "./services/util.service";

export class CustomValidators {
    /*
        Questo validators verifica viene applicato ai form group e controlla che i due controlli presentati in ingresso
        abbiano lo stesso valore. Se uno dei parametri non è valido restituisce null.
    */
    static matchValidator(control1: string, control2: string) : ValidationErrors | null {
        return (control: AbstractControl): ValidationErrors | null => {
            let c1 = control.get(control1);
            let c2 = control.get(control2);
            return ((!c1 || !c2) || (c1.value === c2.value)) ? null : { match: false };
        };
    }

    /*
    Questo validators verifica che il controllo sul quale viene applicato presenti al massimo due cifre decimali.
    Restituisce nessun errore nel caso il controllo abbia valore nullo.
*/
    static max2DecimalValidator(): ValidatorFn {
        //"[0-9]?[0-9]?[0-9]?[0-9](\.)?(?(1)[0-9][0-9]?|$)"
        return (control: AbstractControl): ValidationErrors | null => {

            //Controllo che ci siano massimo due cifre decimali
            let s = String(control.value);
            let arr = s.split('.');
            let arr1 = s.split(',');

            //Se ho un numero decimale
            if (arr.length == 2 && (arr[1].length > 2 || arr[1].length == 0)) //Se ho piu di due cifre decimali oppure nessuna ma ho il punto
                return { price: { value: true } }

            if (arr1.length == 2 && (arr1[1].length > 2 || arr1[1].length == 0)) //Se ho piu di due cifre decimali oppure nessuna ma ho il punto
                return { price: { value: true } }
            return null;
        };
    }

    /*
        Questo validators asincrono verifica che il controllo sul quale viene applicato non presenti un valore 
        che corrisponde di già ad un username presente nel db corrente.
    */
    static existingUsernameValidator(util: UtilService): AsyncValidatorFn {
        return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
            return from(util.searchUser(control.value).get()).pipe(
                debounceTime(500), map(
                    res => {
                        return (res && !res.empty) ? { 'usernameExists': true } : null;
                    }
                )
            );
            
        };
    }

    /*
        Questo validators asincrono verifica che il controllo sul quale viene applicato non presenti un valore 
        che corrisponde di già ad un'email presente nel db corrente.
    */
        static existingEmailValidator(util: UtilService): AsyncValidatorFn {
            return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
                return from(util.searchUserByEmail(control.value).get()).pipe(
                    debounceTime(500), map(
                        res => {
                            return (res && !res.empty) ? { 'emailExists': true } : null;
                        }
                    )
                );
                
            };
        }
}
