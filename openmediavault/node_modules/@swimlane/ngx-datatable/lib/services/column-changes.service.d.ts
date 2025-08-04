import { Observable } from 'rxjs';
import * as i0 from "@angular/core";
/**
 * service to make DatatableComponent aware of changes to
 * input bindings of DataTableColumnDirective
 */
export declare class ColumnChangesService {
    private columnInputChanges;
    get columnInputChanges$(): Observable<void>;
    onInputChange(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<ColumnChangesService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<ColumnChangesService>;
}
