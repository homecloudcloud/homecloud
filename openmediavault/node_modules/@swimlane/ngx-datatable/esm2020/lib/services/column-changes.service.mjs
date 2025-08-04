import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import * as i0 from "@angular/core";
/**
 * service to make DatatableComponent aware of changes to
 * input bindings of DataTableColumnDirective
 */
export class ColumnChangesService {
    constructor() {
        this.columnInputChanges = new Subject();
    }
    get columnInputChanges$() {
        return this.columnInputChanges.asObservable();
    }
    onInputChange() {
        this.columnInputChanges.next();
    }
}
ColumnChangesService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.1.1", ngImport: i0, type: ColumnChangesService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
ColumnChangesService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.1.1", ngImport: i0, type: ColumnChangesService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.1.1", ngImport: i0, type: ColumnChangesService, decorators: [{
            type: Injectable
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uLWNoYW5nZXMuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3N3aW1sYW5lL25neC1kYXRhdGFibGUvc3JjL2xpYi9zZXJ2aWNlcy9jb2x1bW4tY2hhbmdlcy5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFM0MsT0FBTyxFQUFjLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQzs7QUFFM0M7OztHQUdHO0FBRUgsTUFBTSxPQUFPLG9CQUFvQjtJQURqQztRQUVVLHVCQUFrQixHQUFHLElBQUksT0FBTyxFQUFRLENBQUM7S0FTbEQ7SUFQQyxJQUFJLG1CQUFtQjtRQUNyQixPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUNoRCxDQUFDO0lBRUQsYUFBYTtRQUNYLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNqQyxDQUFDOztpSEFUVSxvQkFBb0I7cUhBQXBCLG9CQUFvQjsyRkFBcEIsb0JBQW9CO2tCQURoQyxVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBTdWJqZWN0IH0gZnJvbSAncnhqcyc7XG5cbi8qKlxuICogc2VydmljZSB0byBtYWtlIERhdGF0YWJsZUNvbXBvbmVudCBhd2FyZSBvZiBjaGFuZ2VzIHRvXG4gKiBpbnB1dCBiaW5kaW5ncyBvZiBEYXRhVGFibGVDb2x1bW5EaXJlY3RpdmVcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIENvbHVtbkNoYW5nZXNTZXJ2aWNlIHtcbiAgcHJpdmF0ZSBjb2x1bW5JbnB1dENoYW5nZXMgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIGdldCBjb2x1bW5JbnB1dENoYW5nZXMkKCk6IE9ic2VydmFibGU8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLmNvbHVtbklucHV0Q2hhbmdlcy5hc09ic2VydmFibGUoKTtcbiAgfVxuXG4gIG9uSW5wdXRDaGFuZ2UoKTogdm9pZCB7XG4gICAgdGhpcy5jb2x1bW5JbnB1dENoYW5nZXMubmV4dCgpO1xuICB9XG59XG4iXX0=