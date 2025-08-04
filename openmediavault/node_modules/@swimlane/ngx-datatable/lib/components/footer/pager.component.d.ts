import { EventEmitter } from '@angular/core';
import * as i0 from "@angular/core";
export declare class DataTablePagerComponent {
    pagerLeftArrowIcon: string;
    pagerRightArrowIcon: string;
    pagerPreviousIcon: string;
    pagerNextIcon: string;
    set size(val: number);
    get size(): number;
    set count(val: number);
    get count(): number;
    set page(val: number);
    get page(): number;
    get totalPages(): number;
    change: EventEmitter<any>;
    _count: number;
    _page: number;
    _size: number;
    pages: any;
    canPrevious(): boolean;
    canNext(): boolean;
    prevPage(): void;
    nextPage(): void;
    selectPage(page: number): void;
    calcPages(page?: number): any[];
    static ɵfac: i0.ɵɵFactoryDeclaration<DataTablePagerComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<DataTablePagerComponent, "datatable-pager", never, { "pagerLeftArrowIcon": "pagerLeftArrowIcon"; "pagerRightArrowIcon": "pagerRightArrowIcon"; "pagerPreviousIcon": "pagerPreviousIcon"; "pagerNextIcon": "pagerNextIcon"; "size": "size"; "count": "count"; "page": "page"; }, { "change": "change"; }, never, never>;
}
