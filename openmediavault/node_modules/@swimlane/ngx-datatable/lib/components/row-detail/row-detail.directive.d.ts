import { EventEmitter, TemplateRef } from '@angular/core';
import * as i0 from "@angular/core";
export declare class DatatableRowDetailDirective {
    /**
     * The detail row height is required especially
     * when virtual scroll is enabled.
     */
    rowHeight: number | ((row?: any, index?: number) => number);
    _templateInput: TemplateRef<any>;
    _templateQuery: TemplateRef<any>;
    get template(): TemplateRef<any>;
    /**
     * Row detail row visbility was toggled.
     */
    toggle: EventEmitter<any>;
    /**
     * Toggle the expansion of the row
     */
    toggleExpandRow(row: any): void;
    /**
     * API method to expand all the rows.
     */
    expandAllRows(): void;
    /**
     * API method to collapse all the rows.
     */
    collapseAllRows(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<DatatableRowDetailDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DatatableRowDetailDirective, "ngx-datatable-row-detail", never, { "rowHeight": "rowHeight"; "_templateInput": "template"; }, { "toggle": "toggle"; }, ["_templateQuery"]>;
}
