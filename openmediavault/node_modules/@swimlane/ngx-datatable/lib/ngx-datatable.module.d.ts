import { ModuleWithProviders } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "./components/footer/footer-template.directive";
import * as i2 from "./directives/visibility.directive";
import * as i3 from "./directives/draggable.directive";
import * as i4 from "./directives/resizeable.directive";
import * as i5 from "./directives/orderable.directive";
import * as i6 from "./directives/long-press.directive";
import * as i7 from "./components/body/scroller.component";
import * as i8 from "./components/datatable.component";
import * as i9 from "./components/columns/column.directive";
import * as i10 from "./components/header/header.component";
import * as i11 from "./components/header/header-cell.component";
import * as i12 from "./components/body/body.component";
import * as i13 from "./components/footer/footer.component";
import * as i14 from "./components/footer/pager.component";
import * as i15 from "./components/body/progress-bar.component";
import * as i16 from "./components/body/body-row.component";
import * as i17 from "./components/body/body-row-wrapper.component";
import * as i18 from "./components/row-detail/row-detail.directive";
import * as i19 from "./components/body/body-group-header.directive";
import * as i20 from "./components/row-detail/row-detail-template.directive";
import * as i21 from "./components/body/body-cell.component";
import * as i22 from "./components/body/selection.component";
import * as i23 from "./components/columns/column-header.directive";
import * as i24 from "./components/columns/column-cell.directive";
import * as i25 from "./components/columns/tree.directive";
import * as i26 from "./components/footer/footer.directive";
import * as i27 from "./components/body/body-group-header-template.directive";
import * as i28 from "./components/body/summary/summary-row.component";
import * as i29 from "@angular/common";
export declare class NgxDatatableModule {
    /**
     * Configure global configuration via INgxDatatableConfig
     * @param configuration
     */
    static forRoot(configuration: INgxDatatableConfig): ModuleWithProviders<NgxDatatableModule>;
    static ɵfac: i0.ɵɵFactoryDeclaration<NgxDatatableModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<NgxDatatableModule, [typeof i1.DataTableFooterTemplateDirective, typeof i2.VisibilityDirective, typeof i3.DraggableDirective, typeof i4.ResizeableDirective, typeof i5.OrderableDirective, typeof i6.LongPressDirective, typeof i7.ScrollerComponent, typeof i8.DatatableComponent, typeof i9.DataTableColumnDirective, typeof i10.DataTableHeaderComponent, typeof i11.DataTableHeaderCellComponent, typeof i12.DataTableBodyComponent, typeof i13.DataTableFooterComponent, typeof i14.DataTablePagerComponent, typeof i15.ProgressBarComponent, typeof i16.DataTableBodyRowComponent, typeof i17.DataTableRowWrapperComponent, typeof i18.DatatableRowDetailDirective, typeof i19.DatatableGroupHeaderDirective, typeof i20.DatatableRowDetailTemplateDirective, typeof i21.DataTableBodyCellComponent, typeof i22.DataTableSelectionComponent, typeof i23.DataTableColumnHeaderDirective, typeof i24.DataTableColumnCellDirective, typeof i25.DataTableColumnCellTreeToggle, typeof i26.DatatableFooterDirective, typeof i27.DatatableGroupHeaderTemplateDirective, typeof i28.DataTableSummaryRowComponent], [typeof i29.CommonModule], [typeof i8.DatatableComponent, typeof i18.DatatableRowDetailDirective, typeof i19.DatatableGroupHeaderDirective, typeof i20.DatatableRowDetailTemplateDirective, typeof i9.DataTableColumnDirective, typeof i23.DataTableColumnHeaderDirective, typeof i24.DataTableColumnCellDirective, typeof i25.DataTableColumnCellTreeToggle, typeof i1.DataTableFooterTemplateDirective, typeof i26.DatatableFooterDirective, typeof i14.DataTablePagerComponent, typeof i27.DatatableGroupHeaderTemplateDirective]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<NgxDatatableModule>;
}
/**
 * Interface definition for INgxDatatableConfig global configuration
 */
export interface INgxDatatableConfig {
    messages: {
        emptyMessage: string;
        totalMessage: string;
        selectedMessage: string;
    };
}
