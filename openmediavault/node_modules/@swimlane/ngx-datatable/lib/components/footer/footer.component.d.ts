import { EventEmitter } from '@angular/core';
import { DatatableFooterDirective } from './footer.directive';
import * as i0 from "@angular/core";
export declare class DataTableFooterComponent {
    footerHeight: number;
    rowCount: number;
    pageSize: number;
    offset: number;
    pagerLeftArrowIcon: string;
    pagerRightArrowIcon: string;
    pagerPreviousIcon: string;
    pagerNextIcon: string;
    totalMessage: string;
    footerTemplate: DatatableFooterDirective;
    selectedCount: number;
    selectedMessage: string | boolean;
    page: EventEmitter<any>;
    get isVisible(): boolean;
    get curPage(): number;
    static ɵfac: i0.ɵɵFactoryDeclaration<DataTableFooterComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<DataTableFooterComponent, "datatable-footer", never, { "footerHeight": "footerHeight"; "rowCount": "rowCount"; "pageSize": "pageSize"; "offset": "offset"; "pagerLeftArrowIcon": "pagerLeftArrowIcon"; "pagerRightArrowIcon": "pagerRightArrowIcon"; "pagerPreviousIcon": "pagerPreviousIcon"; "pagerNextIcon": "pagerNextIcon"; "totalMessage": "totalMessage"; "footerTemplate": "footerTemplate"; "selectedCount": "selectedCount"; "selectedMessage": "selectedMessage"; }, { "page": "page"; }, never, never>;
}
