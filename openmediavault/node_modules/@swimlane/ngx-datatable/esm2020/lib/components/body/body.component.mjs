import { Component, Output, EventEmitter, Input, HostBinding, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { ScrollerComponent } from './scroller.component';
import { columnsByPin, columnGroupWidths } from '../../utils/column';
import { RowHeightCache } from '../../utils/row-height-cache';
import { translateXY } from '../../utils/translate';
import * as i0 from "@angular/core";
import * as i1 from "./progress-bar.component";
import * as i2 from "./selection.component";
import * as i3 from "./scroller.component";
import * as i4 from "./summary/summary-row.component";
import * as i5 from "./body-row-wrapper.component";
import * as i6 from "./body-row.component";
import * as i7 from "@angular/common";
export class DataTableBodyComponent {
    /**
     * Creates an instance of DataTableBodyComponent.
     */
    constructor(cd) {
        this.cd = cd;
        this.selected = [];
        this.scroll = new EventEmitter();
        this.page = new EventEmitter();
        this.activate = new EventEmitter();
        this.select = new EventEmitter();
        this.detailToggle = new EventEmitter();
        this.rowContextmenu = new EventEmitter(false);
        this.treeAction = new EventEmitter();
        this.rowHeightsCache = new RowHeightCache();
        this.temp = [];
        this.offsetY = 0;
        this.indexes = {};
        this.rowIndexes = new WeakMap();
        this.rowExpansions = [];
        /**
         * Get the height of the detail row.
         */
        this.getDetailRowHeight = (row, index) => {
            if (!this.rowDetail) {
                return 0;
            }
            const rowHeight = this.rowDetail.rowHeight;
            return typeof rowHeight === 'function' ? rowHeight(row, index) : rowHeight;
        };
        // declare fn here so we can get access to the `this` property
        this.rowTrackingFn = (index, row) => {
            const idx = this.getRowIndex(row);
            if (this.trackByProp) {
                return row[this.trackByProp];
            }
            else {
                return idx;
            }
        };
    }
    set pageSize(val) {
        this._pageSize = val;
        this.recalcLayout();
    }
    get pageSize() {
        return this._pageSize;
    }
    set rows(val) {
        this._rows = val;
        this.recalcLayout();
    }
    get rows() {
        return this._rows;
    }
    set columns(val) {
        this._columns = val;
        const colsByPin = columnsByPin(val);
        this.columnGroupWidths = columnGroupWidths(colsByPin, val);
    }
    get columns() {
        return this._columns;
    }
    set offset(val) {
        this._offset = val;
        if (!this.scrollbarV || (this.scrollbarV && !this.virtualization))
            this.recalcLayout();
    }
    get offset() {
        return this._offset;
    }
    set rowCount(val) {
        this._rowCount = val;
        this.recalcLayout();
    }
    get rowCount() {
        return this._rowCount;
    }
    get bodyWidth() {
        if (this.scrollbarH) {
            return this.innerWidth + 'px';
        }
        else {
            return '100%';
        }
    }
    set bodyHeight(val) {
        if (this.scrollbarV) {
            this._bodyHeight = val + 'px';
        }
        else {
            this._bodyHeight = 'auto';
        }
        this.recalcLayout();
    }
    get bodyHeight() {
        return this._bodyHeight;
    }
    /**
     * Returns if selection is enabled.
     */
    get selectEnabled() {
        return !!this.selectionType;
    }
    /**
     * Property that would calculate the height of scroll bar
     * based on the row heights cache for virtual scroll and virtualization. Other scenarios
     * calculate scroll height automatically (as height will be undefined).
     */
    get scrollHeight() {
        if (this.scrollbarV && this.virtualization && this.rowCount) {
            return this.rowHeightsCache.query(this.rowCount - 1);
        }
        // avoid TS7030: Not all code paths return a value.
        return undefined;
    }
    /**
     * Called after the constructor, initializing input properties
     */
    ngOnInit() {
        if (this.rowDetail) {
            this.listener = this.rowDetail.toggle.subscribe(({ type, value }) => {
                if (type === 'row') {
                    this.toggleRowExpansion(value);
                }
                if (type === 'all') {
                    this.toggleAllRows(value);
                }
                // Refresh rows after toggle
                // Fixes #883
                this.updateIndexes();
                this.updateRows();
                this.cd.markForCheck();
            });
        }
        if (this.groupHeader) {
            this.listener = this.groupHeader.toggle.subscribe(({ type, value }) => {
                if (type === 'group') {
                    this.toggleRowExpansion(value);
                }
                if (type === 'all') {
                    this.toggleAllRows(value);
                }
                // Refresh rows after toggle
                // Fixes #883
                this.updateIndexes();
                this.updateRows();
                this.cd.markForCheck();
            });
        }
    }
    /**
     * Called once, before the instance is destroyed.
     */
    ngOnDestroy() {
        if (this.rowDetail || this.groupHeader) {
            this.listener.unsubscribe();
        }
    }
    /**
     * Updates the Y offset given a new offset.
     */
    updateOffsetY(offset) {
        // scroller is missing on empty table
        if (!this.scroller) {
            return;
        }
        if (this.scrollbarV && this.virtualization && offset) {
            // First get the row Index that we need to move to.
            const rowIndex = this.pageSize * offset;
            offset = this.rowHeightsCache.query(rowIndex - 1);
        }
        else if (this.scrollbarV && !this.virtualization) {
            offset = 0;
        }
        this.scroller.setOffset(offset || 0);
    }
    /**
     * Body was scrolled, this is mainly useful for
     * when a user is server-side pagination via virtual scroll.
     */
    onBodyScroll(event) {
        const scrollYPos = event.scrollYPos;
        const scrollXPos = event.scrollXPos;
        // if scroll change, trigger update
        // this is mainly used for header cell positions
        if (this.offsetY !== scrollYPos || this.offsetX !== scrollXPos) {
            this.scroll.emit({
                offsetY: scrollYPos,
                offsetX: scrollXPos
            });
        }
        this.offsetY = scrollYPos;
        this.offsetX = scrollXPos;
        this.updateIndexes();
        this.updatePage(event.direction);
        this.updateRows();
    }
    /**
     * Updates the page given a direction.
     */
    updatePage(direction) {
        let offset = this.indexes.first / this.pageSize;
        if (direction === 'up') {
            offset = Math.ceil(offset);
        }
        else if (direction === 'down') {
            offset = Math.floor(offset);
        }
        if (direction !== undefined && !isNaN(offset)) {
            this.page.emit({ offset });
        }
    }
    /**
     * Updates the rows in the view port
     */
    updateRows() {
        const { first, last } = this.indexes;
        let rowIndex = first;
        let idx = 0;
        const temp = [];
        // if grouprowsby has been specified treat row paging
        // parameters as group paging parameters ie if limit 10 has been
        // specified treat it as 10 groups rather than 10 rows
        if (this.groupedRows) {
            let maxRowsPerGroup = 3;
            // if there is only one group set the maximum number of
            // rows per group the same as the total number of rows
            if (this.groupedRows.length === 1) {
                maxRowsPerGroup = this.groupedRows[0].value.length;
            }
            while (rowIndex < last && rowIndex < this.groupedRows.length) {
                // Add the groups into this page
                const group = this.groupedRows[rowIndex];
                this.rowIndexes.set(group, rowIndex);
                if (group.value) {
                    // add indexes for each group item
                    group.value.forEach((g, i) => {
                        const _idx = `${rowIndex}-${i}`;
                        this.rowIndexes.set(g, _idx);
                    });
                }
                temp[idx] = group;
                idx++;
                // Group index in this context
                rowIndex++;
            }
        }
        else {
            while (rowIndex < last && rowIndex < this.rowCount) {
                const row = this.rows[rowIndex];
                if (row) {
                    // add indexes for each row
                    this.rowIndexes.set(row, rowIndex);
                    temp[idx] = row;
                }
                idx++;
                rowIndex++;
            }
        }
        this.temp = temp;
    }
    /**
     * Get the row height
     */
    getRowHeight(row) {
        // if its a function return it
        if (typeof this.rowHeight === 'function') {
            return this.rowHeight(row);
        }
        return this.rowHeight;
    }
    /**
     * @param group the group with all rows
     */
    getGroupHeight(group) {
        let rowHeight = 0;
        if (group.value) {
            for (let index = 0; index < group.value.length; index++) {
                rowHeight += this.getRowAndDetailHeight(group.value[index]);
            }
        }
        return rowHeight;
    }
    /**
     * Calculate row height based on the expanded state of the row.
     */
    getRowAndDetailHeight(row) {
        let rowHeight = this.getRowHeight(row);
        const expanded = this.getRowExpanded(row);
        // Adding detail row height if its expanded.
        if (expanded) {
            rowHeight += this.getDetailRowHeight(row);
        }
        return rowHeight;
    }
    /**
     * Calculates the styles for the row so that the rows can be moved in 2D space
     * during virtual scroll inside the DOM.   In the below case the Y position is
     * manipulated.   As an example, if the height of row 0 is 30 px and row 1 is
     * 100 px then following styles are generated:
     *
     * transform: translate3d(0px, 0px, 0px);    ->  row0
     * transform: translate3d(0px, 30px, 0px);   ->  row1
     * transform: translate3d(0px, 130px, 0px);  ->  row2
     *
     * Row heights have to be calculated based on the row heights cache as we wont
     * be able to determine which row is of what height before hand.  In the above
     * case the positionY of the translate3d for row2 would be the sum of all the
     * heights of the rows before it (i.e. row0 and row1).
     *
     * @param rows the row that needs to be placed in the 2D space.
     * @returns the CSS3 style to be applied
     *
     * @memberOf DataTableBodyComponent
     */
    getRowsStyles(rows) {
        const styles = {};
        // only add styles for the group if there is a group
        if (this.groupedRows) {
            styles.width = this.columnGroupWidths.total;
        }
        if (this.scrollbarV && this.virtualization) {
            let idx = 0;
            if (this.groupedRows) {
                // Get the latest row rowindex in a group
                const row = rows[rows.length - 1];
                idx = row ? this.getRowIndex(row) : 0;
            }
            else {
                idx = this.getRowIndex(rows);
            }
            // const pos = idx * rowHeight;
            // The position of this row would be the sum of all row heights
            // until the previous row position.
            const pos = this.rowHeightsCache.query(idx - 1);
            translateXY(styles, 0, pos);
        }
        return styles;
    }
    /**
     * Calculate bottom summary row offset for scrollbar mode.
     * For more information about cache and offset calculation
     * see description for `getRowsStyles` method
     *
     * @returns the CSS3 style to be applied
     *
     * @memberOf DataTableBodyComponent
     */
    getBottomSummaryRowStyles() {
        if (!this.scrollbarV || !this.rows || !this.rows.length) {
            return null;
        }
        const styles = { position: 'absolute' };
        const pos = this.rowHeightsCache.query(this.rows.length - 1);
        translateXY(styles, 0, pos);
        return styles;
    }
    /**
     * Hides the loading indicator
     */
    hideIndicator() {
        setTimeout(() => (this.loadingIndicator = false), 500);
    }
    /**
     * Updates the index of the rows in the viewport
     */
    updateIndexes() {
        let first = 0;
        let last = 0;
        if (this.scrollbarV) {
            if (this.virtualization) {
                // Calculation of the first and last indexes will be based on where the
                // scrollY position would be at.  The last index would be the one
                // that shows up inside the view port the last.
                const height = parseInt(this.bodyHeight, 0);
                first = this.rowHeightsCache.getRowIndex(this.offsetY);
                last = this.rowHeightsCache.getRowIndex(height + this.offsetY) + 1;
            }
            else {
                // If virtual rows are not needed
                // We render all in one go
                first = 0;
                last = this.rowCount;
            }
        }
        else {
            // The server is handling paging and will pass an array that begins with the
            // element at a specified offset.  first should always be 0 with external paging.
            if (!this.externalPaging) {
                first = Math.max(this.offset * this.pageSize, 0);
            }
            last = Math.min(first + this.pageSize, this.rowCount);
        }
        this.indexes = { first, last };
    }
    /**
     * Refreshes the full Row Height cache.  Should be used
     * when the entire row array state has changed.
     */
    refreshRowHeightCache() {
        if (!this.scrollbarV || (this.scrollbarV && !this.virtualization)) {
            return;
        }
        // clear the previous row height cache if already present.
        // this is useful during sorts, filters where the state of the
        // rows array is changed.
        this.rowHeightsCache.clearCache();
        // Initialize the tree only if there are rows inside the tree.
        if (this.rows && this.rows.length) {
            const rowExpansions = new Set();
            for (const row of this.rows) {
                if (this.getRowExpanded(row)) {
                    rowExpansions.add(row);
                }
            }
            this.rowHeightsCache.initCache({
                rows: this.rows,
                rowHeight: this.rowHeight,
                detailRowHeight: this.getDetailRowHeight,
                externalVirtual: this.scrollbarV && this.externalPaging,
                rowCount: this.rowCount,
                rowIndexes: this.rowIndexes,
                rowExpansions
            });
        }
    }
    /**
     * Gets the index for the view port
     */
    getAdjustedViewPortIndex() {
        // Capture the row index of the first row that is visible on the viewport.
        // If the scroll bar is just below the row which is highlighted then make that as the
        // first index.
        const viewPortFirstRowIndex = this.indexes.first;
        if (this.scrollbarV && this.virtualization) {
            const offsetScroll = this.rowHeightsCache.query(viewPortFirstRowIndex - 1);
            return offsetScroll <= this.offsetY ? viewPortFirstRowIndex - 1 : viewPortFirstRowIndex;
        }
        return viewPortFirstRowIndex;
    }
    /**
     * Toggle the Expansion of the row i.e. if the row is expanded then it will
     * collapse and vice versa.   Note that the expanded status is stored as
     * a part of the row object itself as we have to preserve the expanded row
     * status in case of sorting and filtering of the row set.
     */
    toggleRowExpansion(row) {
        // Capture the row index of the first row that is visible on the viewport.
        const viewPortFirstRowIndex = this.getAdjustedViewPortIndex();
        const rowExpandedIdx = this.getRowExpandedIdx(row, this.rowExpansions);
        const expanded = rowExpandedIdx > -1;
        // If the detailRowHeight is auto --> only in case of non-virtualized scroll
        if (this.scrollbarV && this.virtualization) {
            const detailRowHeight = this.getDetailRowHeight(row) * (expanded ? -1 : 1);
            // const idx = this.rowIndexes.get(row) || 0;
            const idx = this.getRowIndex(row);
            this.rowHeightsCache.update(idx, detailRowHeight);
        }
        // Update the toggled row and update thive nevere heights in the cache.
        if (expanded) {
            this.rowExpansions.splice(rowExpandedIdx, 1);
        }
        else {
            this.rowExpansions.push(row);
        }
        this.detailToggle.emit({
            rows: [row],
            currentIndex: viewPortFirstRowIndex
        });
    }
    /**
     * Expand/Collapse all the rows no matter what their state is.
     */
    toggleAllRows(expanded) {
        // clear prev expansions
        this.rowExpansions = [];
        // Capture the row index of the first row that is visible on the viewport.
        const viewPortFirstRowIndex = this.getAdjustedViewPortIndex();
        if (expanded) {
            for (const row of this.rows) {
                this.rowExpansions.push(row);
            }
        }
        if (this.scrollbarV) {
            // Refresh the full row heights cache since every row was affected.
            this.recalcLayout();
        }
        // Emit all rows that have been expanded.
        this.detailToggle.emit({
            rows: this.rows,
            currentIndex: viewPortFirstRowIndex
        });
    }
    /**
     * Recalculates the table
     */
    recalcLayout() {
        this.refreshRowHeightCache();
        this.updateIndexes();
        this.updateRows();
    }
    /**
     * Tracks the column
     */
    columnTrackingFn(index, column) {
        return column.$$id;
    }
    /**
     * Gets the row pinning group styles
     */
    stylesByGroup(group) {
        const widths = this.columnGroupWidths;
        const offsetX = this.offsetX;
        const styles = {
            width: `${widths[group]}px`
        };
        if (group === 'left') {
            translateXY(styles, offsetX, 0);
        }
        else if (group === 'right') {
            const bodyWidth = parseInt(this.innerWidth + '', 0);
            const totalDiff = widths.total - bodyWidth;
            const offsetDiff = totalDiff - offsetX;
            const offset = offsetDiff * -1;
            translateXY(styles, offset, 0);
        }
        return styles;
    }
    /**
     * Returns if the row was expanded and set default row expansion when row expansion is empty
     */
    getRowExpanded(row) {
        if (this.rowExpansions.length === 0 && this.groupExpansionDefault) {
            for (const group of this.groupedRows) {
                this.rowExpansions.push(group);
            }
        }
        return this.getRowExpandedIdx(row, this.rowExpansions) > -1;
    }
    getRowExpandedIdx(row, expanded) {
        if (!expanded || !expanded.length)
            return -1;
        const rowId = this.rowIdentity(row);
        return expanded.findIndex(r => {
            const id = this.rowIdentity(r);
            return id === rowId;
        });
    }
    /**
     * Gets the row index given a row
     */
    getRowIndex(row) {
        return this.rowIndexes.get(row) || 0;
    }
    onTreeAction(row) {
        this.treeAction.emit({ row });
    }
}
DataTableBodyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.1.1", ngImport: i0, type: DataTableBodyComponent, deps: [{ token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
DataTableBodyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "13.1.1", type: DataTableBodyComponent, selector: "datatable-body", inputs: { scrollbarV: "scrollbarV", scrollbarH: "scrollbarH", loadingIndicator: "loadingIndicator", externalPaging: "externalPaging", rowHeight: "rowHeight", offsetX: "offsetX", emptyMessage: "emptyMessage", selectionType: "selectionType", selected: "selected", rowIdentity: "rowIdentity", rowDetail: "rowDetail", groupHeader: "groupHeader", selectCheck: "selectCheck", displayCheck: "displayCheck", trackByProp: "trackByProp", rowClass: "rowClass", groupedRows: "groupedRows", groupExpansionDefault: "groupExpansionDefault", innerWidth: "innerWidth", groupRowsBy: "groupRowsBy", virtualization: "virtualization", summaryRow: "summaryRow", summaryPosition: "summaryPosition", summaryHeight: "summaryHeight", pageSize: "pageSize", rows: "rows", columns: "columns", offset: "offset", rowCount: "rowCount", bodyHeight: "bodyHeight" }, outputs: { scroll: "scroll", page: "page", activate: "activate", select: "select", detailToggle: "detailToggle", rowContextmenu: "rowContextmenu", treeAction: "treeAction" }, host: { properties: { "style.width": "this.bodyWidth", "style.height": "this.bodyHeight" }, classAttribute: "datatable-body" }, viewQueries: [{ propertyName: "scroller", first: true, predicate: ScrollerComponent, descendants: true }], ngImport: i0, template: `
    <datatable-progress *ngIf="loadingIndicator"> </datatable-progress>
    <datatable-selection
      #selector
      [selected]="selected"
      [rows]="rows"
      [selectCheck]="selectCheck"
      [selectEnabled]="selectEnabled"
      [selectionType]="selectionType"
      [rowIdentity]="rowIdentity"
      (select)="select.emit($event)"
      (activate)="activate.emit($event)"
    >
      <datatable-scroller
        *ngIf="rows?.length"
        [scrollbarV]="scrollbarV"
        [scrollbarH]="scrollbarH"
        [scrollHeight]="scrollHeight"
        [scrollWidth]="columnGroupWidths?.total"
        (scroll)="onBodyScroll($event)"
      >
        <datatable-summary-row
          *ngIf="summaryRow && summaryPosition === 'top'"
          [rowHeight]="summaryHeight"
          [offsetX]="offsetX"
          [innerWidth]="innerWidth"
          [rows]="rows"
          [columns]="columns"
        >
        </datatable-summary-row>
        <datatable-row-wrapper
          [groupedRows]="groupedRows"
          *ngFor="let group of temp; let i = index; trackBy: rowTrackingFn"
          [innerWidth]="innerWidth"
          [ngStyle]="getRowsStyles(group)"
          [rowDetail]="rowDetail"
          [groupHeader]="groupHeader"
          [offsetX]="offsetX"
          [detailRowHeight]="getDetailRowHeight(group && group[i], i)"
          [row]="group"
          [expanded]="getRowExpanded(group)"
          [rowIndex]="getRowIndex(group && group[i])"
          (rowContextmenu)="rowContextmenu.emit($event)"
        >
          <datatable-body-row
            role="row"
            *ngIf="!groupedRows; else groupedRowsTemplate"
            tabindex="-1"
            [isSelected]="selector.getRowSelected(group)"
            [innerWidth]="innerWidth"
            [offsetX]="offsetX"
            [columns]="columns"
            [rowHeight]="getRowHeight(group)"
            [row]="group"
            [rowIndex]="getRowIndex(group)"
            [expanded]="getRowExpanded(group)"
            [rowClass]="rowClass"
            [displayCheck]="displayCheck"
            [treeStatus]="group && group.treeStatus"
            (treeAction)="onTreeAction(group)"
            (activate)="selector.onActivate($event, indexes.first + i)"
          >
          </datatable-body-row>
          <ng-template #groupedRowsTemplate>
            <datatable-body-row
              role="row"
              *ngFor="let row of group.value; let i = index; trackBy: rowTrackingFn"
              tabindex="-1"
              [isSelected]="selector.getRowSelected(row)"
              [innerWidth]="innerWidth"
              [offsetX]="offsetX"
              [columns]="columns"
              [rowHeight]="getRowHeight(row)"
              [row]="row"
              [group]="group.value"
              [rowIndex]="getRowIndex(row)"
              [expanded]="getRowExpanded(row)"
              [rowClass]="rowClass"
              (activate)="selector.onActivate($event, i)"
            >
            </datatable-body-row>
          </ng-template>
        </datatable-row-wrapper>
        <datatable-summary-row
          role="row"
          *ngIf="summaryRow && summaryPosition === 'bottom'"
          [ngStyle]="getBottomSummaryRowStyles()"
          [rowHeight]="summaryHeight"
          [offsetX]="offsetX"
          [innerWidth]="innerWidth"
          [rows]="rows"
          [columns]="columns"
        >
        </datatable-summary-row>
      </datatable-scroller>
      <div class="empty-row" *ngIf="!rows?.length && !loadingIndicator" [innerHTML]="emptyMessage"></div>
    </datatable-selection>
  `, isInline: true, components: [{ type: i1.ProgressBarComponent, selector: "datatable-progress" }, { type: i2.DataTableSelectionComponent, selector: "datatable-selection", inputs: ["rows", "selected", "selectEnabled", "selectionType", "rowIdentity", "selectCheck"], outputs: ["activate", "select"] }, { type: i3.ScrollerComponent, selector: "datatable-scroller", inputs: ["scrollbarV", "scrollbarH", "scrollHeight", "scrollWidth"], outputs: ["scroll"] }, { type: i4.DataTableSummaryRowComponent, selector: "datatable-summary-row", inputs: ["rows", "columns", "rowHeight", "offsetX", "innerWidth"] }, { type: i5.DataTableRowWrapperComponent, selector: "datatable-row-wrapper", inputs: ["innerWidth", "rowDetail", "groupHeader", "offsetX", "detailRowHeight", "row", "groupedRows", "rowIndex", "expanded"], outputs: ["rowContextmenu"] }, { type: i6.DataTableBodyRowComponent, selector: "datatable-body-row", inputs: ["columns", "innerWidth", "expanded", "rowClass", "row", "group", "isSelected", "rowIndex", "displayCheck", "treeStatus", "offsetX", "rowHeight"], outputs: ["activate", "treeAction"] }], directives: [{ type: i7.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { type: i7.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { type: i7.NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.1.1", ngImport: i0, type: DataTableBodyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'datatable-body',
                    template: `
    <datatable-progress *ngIf="loadingIndicator"> </datatable-progress>
    <datatable-selection
      #selector
      [selected]="selected"
      [rows]="rows"
      [selectCheck]="selectCheck"
      [selectEnabled]="selectEnabled"
      [selectionType]="selectionType"
      [rowIdentity]="rowIdentity"
      (select)="select.emit($event)"
      (activate)="activate.emit($event)"
    >
      <datatable-scroller
        *ngIf="rows?.length"
        [scrollbarV]="scrollbarV"
        [scrollbarH]="scrollbarH"
        [scrollHeight]="scrollHeight"
        [scrollWidth]="columnGroupWidths?.total"
        (scroll)="onBodyScroll($event)"
      >
        <datatable-summary-row
          *ngIf="summaryRow && summaryPosition === 'top'"
          [rowHeight]="summaryHeight"
          [offsetX]="offsetX"
          [innerWidth]="innerWidth"
          [rows]="rows"
          [columns]="columns"
        >
        </datatable-summary-row>
        <datatable-row-wrapper
          [groupedRows]="groupedRows"
          *ngFor="let group of temp; let i = index; trackBy: rowTrackingFn"
          [innerWidth]="innerWidth"
          [ngStyle]="getRowsStyles(group)"
          [rowDetail]="rowDetail"
          [groupHeader]="groupHeader"
          [offsetX]="offsetX"
          [detailRowHeight]="getDetailRowHeight(group && group[i], i)"
          [row]="group"
          [expanded]="getRowExpanded(group)"
          [rowIndex]="getRowIndex(group && group[i])"
          (rowContextmenu)="rowContextmenu.emit($event)"
        >
          <datatable-body-row
            role="row"
            *ngIf="!groupedRows; else groupedRowsTemplate"
            tabindex="-1"
            [isSelected]="selector.getRowSelected(group)"
            [innerWidth]="innerWidth"
            [offsetX]="offsetX"
            [columns]="columns"
            [rowHeight]="getRowHeight(group)"
            [row]="group"
            [rowIndex]="getRowIndex(group)"
            [expanded]="getRowExpanded(group)"
            [rowClass]="rowClass"
            [displayCheck]="displayCheck"
            [treeStatus]="group && group.treeStatus"
            (treeAction)="onTreeAction(group)"
            (activate)="selector.onActivate($event, indexes.first + i)"
          >
          </datatable-body-row>
          <ng-template #groupedRowsTemplate>
            <datatable-body-row
              role="row"
              *ngFor="let row of group.value; let i = index; trackBy: rowTrackingFn"
              tabindex="-1"
              [isSelected]="selector.getRowSelected(row)"
              [innerWidth]="innerWidth"
              [offsetX]="offsetX"
              [columns]="columns"
              [rowHeight]="getRowHeight(row)"
              [row]="row"
              [group]="group.value"
              [rowIndex]="getRowIndex(row)"
              [expanded]="getRowExpanded(row)"
              [rowClass]="rowClass"
              (activate)="selector.onActivate($event, i)"
            >
            </datatable-body-row>
          </ng-template>
        </datatable-row-wrapper>
        <datatable-summary-row
          role="row"
          *ngIf="summaryRow && summaryPosition === 'bottom'"
          [ngStyle]="getBottomSummaryRowStyles()"
          [rowHeight]="summaryHeight"
          [offsetX]="offsetX"
          [innerWidth]="innerWidth"
          [rows]="rows"
          [columns]="columns"
        >
        </datatable-summary-row>
      </datatable-scroller>
      <div class="empty-row" *ngIf="!rows?.length && !loadingIndicator" [innerHTML]="emptyMessage"></div>
    </datatable-selection>
  `,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    host: {
                        class: 'datatable-body'
                    }
                }]
        }], ctorParameters: function () { return [{ type: i0.ChangeDetectorRef }]; }, propDecorators: { scrollbarV: [{
                type: Input
            }], scrollbarH: [{
                type: Input
            }], loadingIndicator: [{
                type: Input
            }], externalPaging: [{
                type: Input
            }], rowHeight: [{
                type: Input
            }], offsetX: [{
                type: Input
            }], emptyMessage: [{
                type: Input
            }], selectionType: [{
                type: Input
            }], selected: [{
                type: Input
            }], rowIdentity: [{
                type: Input
            }], rowDetail: [{
                type: Input
            }], groupHeader: [{
                type: Input
            }], selectCheck: [{
                type: Input
            }], displayCheck: [{
                type: Input
            }], trackByProp: [{
                type: Input
            }], rowClass: [{
                type: Input
            }], groupedRows: [{
                type: Input
            }], groupExpansionDefault: [{
                type: Input
            }], innerWidth: [{
                type: Input
            }], groupRowsBy: [{
                type: Input
            }], virtualization: [{
                type: Input
            }], summaryRow: [{
                type: Input
            }], summaryPosition: [{
                type: Input
            }], summaryHeight: [{
                type: Input
            }], pageSize: [{
                type: Input
            }], rows: [{
                type: Input
            }], columns: [{
                type: Input
            }], offset: [{
                type: Input
            }], rowCount: [{
                type: Input
            }], bodyWidth: [{
                type: HostBinding,
                args: ['style.width']
            }], bodyHeight: [{
                type: Input
            }, {
                type: HostBinding,
                args: ['style.height']
            }], scroll: [{
                type: Output
            }], page: [{
                type: Output
            }], activate: [{
                type: Output
            }], select: [{
                type: Output
            }], detailToggle: [{
                type: Output
            }], rowContextmenu: [{
                type: Output
            }], treeAction: [{
                type: Output
            }], scroller: [{
                type: ViewChild,
                args: [ScrollerComponent]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9keS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9zd2ltbGFuZS9uZ3gtZGF0YXRhYmxlL3NyYy9saWIvY29tcG9uZW50cy9ib2R5L2JvZHkuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFDTCxTQUFTLEVBQ1QsTUFBTSxFQUNOLFlBQVksRUFDWixLQUFLLEVBQ0wsV0FBVyxFQUVYLFNBQVMsRUFHVCx1QkFBdUIsRUFDeEIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFFekQsT0FBTyxFQUFFLFlBQVksRUFBRSxpQkFBaUIsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQ3JFLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUM5RCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sdUJBQXVCLENBQUM7Ozs7Ozs7OztBQTJHcEQsTUFBTSxPQUFPLHNCQUFzQjtJQWlKakM7O09BRUc7SUFDSCxZQUFvQixFQUFxQjtRQUFyQixPQUFFLEdBQUYsRUFBRSxDQUFtQjtRQTNJaEMsYUFBUSxHQUFVLEVBQUUsQ0FBQztRQXdGcEIsV0FBTSxHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO1FBQy9DLFNBQUksR0FBc0IsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUM3QyxhQUFRLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7UUFDakQsV0FBTSxHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO1FBQy9DLGlCQUFZLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7UUFDckQsbUJBQWMsR0FBRyxJQUFJLFlBQVksQ0FBa0MsS0FBSyxDQUFDLENBQUM7UUFDMUUsZUFBVSxHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO1FBd0I3RCxvQkFBZSxHQUFtQixJQUFJLGNBQWMsRUFBRSxD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VUFBVTtzQkFBbkIsTUFBTTtnQkFFdUIsUUFBUTtzQkFBckMsU0FBUzt1QkFBQyxpQkFBaUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBDb21wb25lbnQsXG4gIE91dHB1dCxcbiAgRXZlbnRFbWl0dGVyLFxuICBJbnB1dCxcbiAgSG9zdEJpbmRpbmcsXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBWaWV3Q2hpbGQsXG4gIE9uSW5pdCxcbiAgT25EZXN0cm95LFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneVxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFNjcm9sbGVyQ29tcG9uZW50IH0gZnJvbSAnLi9zY3JvbGxlci5jb21wb25lbnQnO1xuaW1wb3J0IHsgU2VsZWN0aW9uVHlwZSB9IGZyb20gJy4uLy4uL3R5cGVzL3NlbGVjdGlvbi50eXBlJztcbmltcG9ydCB7IGNvbHVtbnNCeVBpbiwgY29sdW1uR3JvdXBXaWR0aHMgfSBmcm9tICcuLi8uLi91dGlscy9jb2x1bW4nO1xuaW1wb3J0IHsgUm93SGVpZ2h0Q2FjaGUgfSBmcm9tICcuLi8uLi91dGlscy9yb3ctaGVpZ2h0LWNhY2hlJztcbmltcG9ydCB7IHRyYW5zbGF0ZVhZIH0gZnJvbSAnLi4vLi4vdXRpbHMvdHJhbnNsYXRlJztcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnZGF0YXRhYmxlLWJvZHknLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxkYXRhdGFibGUtcHJvZ3Jlc3MgKm5nSWY9XCJsb2FkaW5nSW5kaWNhdG9yXCI+IDwvZGF0YXRhYmxlLXByb2dyZXNzPlxuICAgIDxkYXRhdGFibGUtc2VsZWN0aW9uXG4gICAgICAjc2VsZWN0b3JcbiAgICAgIFtzZWxlY3RlZF09XCJzZWxlY3RlZFwiXG4gICAgICBbcm93c109XCJyb3dzXCJcbiAgICAgIFtzZWxlY3RDaGVja109XCJzZWxlY3RDaGVja1wiXG4gICAgICBbc2VsZWN0RW5hYmxlZF09XCJzZWxlY3RFbmFibGVkXCJcbiAgICAgIFtzZWxlY3Rpb25UeXBlXT1cInNlbGVjdGlvblR5cGVcIlxuICAgICAgW3Jvd0lkZW50aXR5XT1cInJvd0lkZW50aXR5XCJcbiAgICAgIChzZWxlY3QpPVwic2VsZWN0LmVtaXQoJGV2ZW50KVwiXG4gICAgICAoYWN0aXZhdGUpPVwiYWN0aXZhdGUuZW1pdCgkZXZlbnQpXCJcbiAgICA+XG4gICAgICA8ZGF0YXRhYmxlLXNjcm9sbGVyXG4gICAgICAgICpuZ0lmPVwicm93cz8ubGVuZ3RoXCJcbiAgICAgICAgW3Njcm9sbGJhclZdPVwic2Nyb2xsYmFyVlwiXG4gICAgICAgIFtzY3JvbGxiYXJIXT1cInNjcm9sbGJhckhcIlxuICAgICAgICBbc2Nyb2xsSGVpZ2h0XT1cInNjcm9sbEhlaWdodFwiXG4gICAgICAgIFtzY3JvbGxXaWR0aF09XCJjb2x1bW5Hcm91cFdpZHRocz8udG90YWxcIlxuICAgICAgICAoc2Nyb2xsKT1cIm9uQm9keVNjcm9sbCgkZXZlbnQpXCJcbiAgICAgID5cbiAgICAgICAgPGRhdGF0YWJsZS1zdW1tYXJ5LXJvd1xuICAgICAgICAgICpuZ0lmPVwic3VtbWFyeVJvdyAmJiBzdW1tYXJ5UG9zaXRpb24gPT09ICd0b3AnXCJcbiAgICAgICAgICBbcm93SGVpZ2h0XT1cInN1bW1hcnlIZWlnaHRcIlxuICAgICAgICAgIFtvZmZzZXRYXT1cIm9mZnNldFhcIlxuICAgICAgICAgIFtpbm5lcldpZHRoXT1cImlubmVyV2lkdGhcIlxuICAgICAgICAgIFtyb3dzXT1cInJvd3NcIlxuICAgICAgICAgIFtjb2x1bW5zXT1cImNvbHVtbnNcIlxuICAgICAgICA+XG4gICAgICAgIDwvZGF0YXRhYmxlLXN1bW1hcnktcm93PlxuICAgICAgICA8ZGF0YXRhYmxlLXJvdy13cmFwcGVyXG4gICAgICAgICAgW2dyb3VwZWRSb3dzXT1cImdyb3VwZWRSb3dzXCJcbiAgICAgICAgICAqbmdGb3I9XCJsZXQgZ3JvdXAgb2YgdGVtcDsgbGV0IGkgPSBpbmRleDsgdHJhY2tCeTogcm93VHJhY2tpbmdGblwiXG4gICAgICAgICAgW2lubmVyV2lkdGhdPVwiaW5uZXJXaWR0aFwiXG4gICAgICAgICAgW25nU3R5bGVdPVwiZ2V0Um93c1N0eWxlcyhncm91cClcIlxuICAgICAgICAgIFtyb3dEZXRhaWxdPVwicm93RGV0YWlsXCJcbiAgICAgICAgICBbZ3JvdXBIZWFkZXJdPVwiZ3JvdXBIZWFkZXJcIlxuICAgICAgICAgIFtvZmZzZXRYXT1cIm9mZnNldFhcIlxuICAgICAgICAgIFtkZXRhaWxSb3dIZWlnaHRdPVwiZ2V0RGV0YWlsUm93SGVpZ2h0KGdyb3VwICYmIGdyb3VwW2ldLCBpKVwiXG4gICAgICAgICAgW3Jvd109XCJncm91cFwiXG4gICAgICAgICAgW2V4cGFuZGVkXT1cImdldFJvd0V4cGFuZGVkKGdyb3VwKVwiXG4gICAgICAgICAgW3Jvd0luZGV4XT1cImdldFJvd0luZGV4KGdyb3VwICYmIGdyb3VwW2ldKVwiXG4gICAgICAgICAgKHJvd0NvbnRleHRtZW51KT1cInJvd0NvbnRleHRtZW51LmVtaXQoJGV2ZW50KVwiXG4gICAgICAgID5cbiAgICAgICAgICA8ZGF0YXRhYmxlLWJvZHktcm93XG4gICAgICAgICAgICByb2xlPVwicm93XCJcbiAgICAgICAgICAgICpuZ0lmPVwiIWdyb3VwZWRSb3dzOyBlbHNlIGdyb3VwZWRSb3dzVGVtcGxhdGVcIlxuICAgICAgICAgICAgdGFiaW5kZXg9XCItMVwiXG4gICAgICAgICAgICBbaXNTZWxlY3RlZF09XCJzZWxlY3Rvci5nZXRSb3dTZWxlY3RlZChncm91cClcIlxuICAgICAgICAgICAgW2lubmVyV2lkdGhdPVwiaW5uZXJXaWR0aFwiXG4gICAgICAgICAgICBbb2Zmc2V0WF09XCJvZmZzZXRYXCJcbiAgICAgICAgICAgIFtjb2x1bW5zXT1cImNvbHVtbnNcIlxuICAgICAgICAgICAgW3Jvd0hlaWdodF09XCJnZXRSb3dIZWlnaHQoZ3JvdXApXCJcbiAgICAgICAgICAgIFtyb3ddPVwiZ3JvdXBcIlxuICAgICAgICAgICAgW3Jvd0luZGV4XT1cImdldFJvd0luZGV4KGdyb3VwKVwiXG4gICAgICAgICAgICBbZXhwYW5kZWRdPVwiZ2V0Um93RXhwYW5kZWQoZ3JvdXApXCJcbiAgICAgICAgICAgIFtyb3dDbGFzc109XCJyb3dDbGFzc1wiXG4gICAgICAgICAgICBbZGlzcGxheUNoZWNrXT1cImRpc3BsYXlDaGVja1wiXG4gICAgICAgICAgICBbdHJlZVN0YXR1c109XCJncm91cCAmJiBncm91cC50cmVlU3RhdHVzXCJcbiAgICAgICAgICAgICh0cmVlQWN0aW9uKT1cIm9uVHJlZUFjdGlvbihncm91cClcIlxuICAgICAgICAgICAgKGFjdGl2YXRlKT1cInNlbGVjdG9yLm9uQWN0aXZhdGUoJGV2ZW50LCBpbmRleGVzLmZpcnN0ICsgaSlcIlxuICAgICAgICAgID5cbiAgICAgICAgICA8L2RhdGF0YWJsZS1ib2R5LXJvdz5cbiAgICAgICAgICA8bmctdGVtcGxhdGUgI2dyb3VwZWRSb3dzVGVtcGxhdGU+XG4gICAgICAgICAgICA8ZGF0YXRhYmxlLWJvZHktcm93XG4gICAgICAgICAgICAgIHJvbGU9XCJyb3dcIlxuICAgICAgICAgICAgICAqbmdGb3I9XCJsZXQgcm93IG9mIGdyb3VwLnZhbHVlOyBsZXQgaSA9IGluZGV4OyB0cmFja0J5OiByb3dUcmFja2luZ0ZuXCJcbiAgICAgICAgICAgICAgdGFiaW5kZXg9XCItMVwiXG4gICAgICAgICAgICAgIFtpc1NlbGVjdGVkXT1cInNlbGVjdG9yLmdldFJvd1NlbGVjdGVkKHJvdylcIlxuICAgICAgICAgICAgICBbaW5uZXJXaWR0aF09XCJpbm5lcldpZHRoXCJcbiAgICAgICAgICAgICAgW29mZnNldFhdPVwib2Zmc2V0WFwiXG4gICAgICAgICAgICAgIFtjb2x1bW5zXT1cImNvbHVtbnNcIlxuICAgICAgICAgICAgICBbcm93SGVpZ2h0XT1cImdldFJvd0hlaWdodChyb3cpXCJcbiAgICAgICAgICAgICAgW3Jvd109XCJyb3dcIlxuICAgICAgICAgICAgICBbZ3JvdXBdPVwiZ3JvdXAudmFsdWVcIlxuICAgICAgICAgICAgICBbcm93SW5kZXhdPVwiZ2V0Um93SW5kZXgocm93KVwiXG4gICAgICAgICAgICAgIFtleHBhbmRlZF09XCJnZXRSb3dFeHBhbmRlZChyb3cpXCJcbiAgICAgICAgICAgICAgW3Jvd0NsYXNzXT1cInJvd0NsYXNzXCJcbiAgICAgICAgICAgICAgKGFjdGl2YXRlKT1cInNlbGVjdG9yLm9uQWN0aXZhdGUoJGV2ZW50LCBpKVwiXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICA8L2RhdGF0YWJsZS1ib2R5LXJvdz5cbiAgICAgICAgICA8L25nLXRlbXBsYXRlPlxuICAgICAgICA8L2RhdGF0YWJsZS1yb3ctd3JhcHBlcj5cbiAgICAgICAgPGRhdGF0YWJsZS1zdW1tYXJ5LXJvd1xuICAgICAgICAgIHJvbGU9XCJyb3dcIlxuICAgICAgICAgICpuZ0lmPVwic3VtbWFyeVJvdyAmJiBzdW1tYXJ5UG9zaXRpb24gPT09ICdib3R0b20nXCJcbiAgICAgICAgICBbbmdTdHlsZV09XCJnZXRCb3R0b21TdW1tYXJ5Um93U3R5bGVzKClcIlxuICAgICAgICAgIFtyb3dIZWlnaHRdPVwic3VtbWFyeUhlaWdodFwiXG4gICAgICAgICAgW29mZnNldFhdPVwib2Zmc2V0WFwiXG4gICAgICAgICAgW2lubmVyV2lkdGhdPVwiaW5uZXJXaWR0aFwiXG4gICAgICAgICAgW3Jvd3NdPVwicm93c1wiXG4gICAgICAgICAgW2NvbHVtbnNdPVwiY29sdW1uc1wiXG4gICAgICAgID5cbiAgICAgICAgPC9kYXRhdGFibGUtc3VtbWFyeS1yb3c+XG4gICAgICA8L2RhdGF0YWJsZS1zY3JvbGxlcj5cbiAgICAgIDxkaXYgY2xhc3M9XCJlbXB0eS1yb3dcIiAqbmdJZj1cIiFyb3dzPy5sZW5ndGggJiYgIWxvYWRpbmdJbmRpY2F0b3JcIiBbaW5uZXJIVE1MXT1cImVtcHR5TWVzc2FnZVwiPjwvZGl2PlxuICAgIDwvZGF0YXRhYmxlLXNlbGVjdGlvbj5cbiAgYCxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gIGhvc3Q6IHtcbiAgICBjbGFzczogJ2RhdGF0YWJsZS1ib2R5J1xuICB9XG59KVxuZXhwb3J0IGNsYXNzIERhdGFUYWJsZUJvZHlDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG4gIEBJbnB1dCgpIHNjcm9sbGJhclY6IGJvb2xlYW47XG4gIEBJbnB1dCgpIHNjcm9sbGJhckg6IGJvb2xlYW47XG4gIEBJbnB1dCgpIGxvYWRpbmdJbmRpY2F0b3I6IGJvb2xlYW47XG4gIEBJbnB1dCgpIGV4dGVybmFsUGFnaW5nOiBib29sZWFuO1xuICBASW5wdXQoKSByb3dIZWlnaHQ6IG51bWJlciB8ICdhdXRvJyB8ICgocm93PzogYW55KSA9PiBudW1iZXIpO1xuICBASW5wdXQoKSBvZmZzZXRYOiBudW1iZXI7XG4gIEBJbnB1dCgpIGVtcHR5TWVzc2FnZTogc3RyaW5nO1xuICBASW5wdXQoKSBzZWxlY3Rpb25UeXBlOiBTZWxlY3Rpb25UeXBlO1xuICBASW5wdXQoKSBzZWxlY3RlZDogYW55W10gPSBbXTtcbiAgQElucHV0KCkgcm93SWRlbnRpdHk6IGFueTtcbiAgQElucHV0KCkgcm93RGV0YWlsOiBhbnk7XG4gIEBJbnB1dCgpIGdyb3VwSGVhZGVyOiBhbnk7XG4gIEBJbnB1dCgpIHNlbGVjdENoZWNrOiBhbnk7XG4gIEBJbnB1dCgpIGRpc3BsYXlDaGVjazogYW55O1xuICBASW5wdXQoKSB0cmFja0J5UHJvcDogc3RyaW5nO1xuICBASW5wdXQoKSByb3dDbGFzczogYW55O1xuICBASW5wdXQoKSBncm91cGVkUm93czogYW55O1xuICBASW5wdXQoKSBncm91cEV4cGFuc2lvbkRlZmF1bHQ6IGJvb2xlYW47XG4gIEBJbnB1dCgpIGlubmVyV2lkdGg6IG51bWJlcjtcbiAgQElucHV0KCkgZ3JvdXBSb3dzQnk6IHN0cmluZztcbiAgQElucHV0KCkgdmlydHVhbGl6YXRpb246IGJvb2xlYW47XG4gIEBJbnB1dCgpIHN1bW1hcnlSb3c6IGJvb2xlYW47XG4gIEBJbnB1dCgpIHN1bW1hcnlQb3NpdGlvbjogc3RyaW5nO1xuICBASW5wdXQoKSBzdW1tYXJ5SGVpZ2h0OiBudW1iZXI7XG5cbiAgQElucHV0KCkgc2V0IHBhZ2VTaXplKHZhbDogbnVtYmVyKSB7XG4gICAgdGhpcy5fcGFnZVNpemUgPSB2YWw7XG4gICAgdGhpcy5yZWNhbGNMYXlvdXQoKTtcbiAgfVxuXG4gIGdldCBwYWdlU2l6ZSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9wYWdlU2l6ZTtcbiAgfVxuXG4gIEBJbnB1dCgpIHNldCByb3dzKHZhbDogYW55W10pIHtcbiAgICB0aGlzLl9yb3dzID0gdmFsO1xuICAgIHRoaXMucmVjYWxjTGF5b3V0KCk7XG4gIH1cblxuICBnZXQgcm93cygpOiBhbnlbXSB7XG4gICAgcmV0dXJuIHRoaXMuX3Jvd3M7XG4gIH1cblxuICBASW5wdXQoKSBzZXQgY29sdW1ucyh2YWw6IGFueVtdKSB7XG4gICAgdGhpcy5fY29sdW1ucyA9IHZhbDtcbiAgICBjb25zdCBjb2xzQnlQaW4gPSBjb2x1bW5zQnlQaW4odmFsKTtcbiAgICB0aGlzLmNvbHVtbkdyb3VwV2lkdGhzID0gY29sdW1uR3JvdXBXaWR0aHMoY29sc0J5UGluLCB2YWwpO1xuICB9XG5cbiAgZ2V0IGNvbHVtbnMoKTogYW55W10ge1xuICAgIHJldHVybiB0aGlzLl9jb2x1bW5zO1xuICB9XG5cbiAgQElucHV0KCkgc2V0IG9mZnNldCh2YWw6IG51bWJlcikge1xuICAgIHRoaXMuX29mZnNldCA9IHZhbDtcbiAgICBpZiAoIXRoaXMuc2Nyb2xsYmFyViB8fCAodGhpcy5zY3JvbGxiYXJWICYmICF0aGlzLnZpcnR1YWxpemF0aW9uKSkgdGhpcy5yZWNhbGNMYXlvdXQoKTtcbiAgfVxuXG4gIGdldCBvZmZzZXQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fb2Zmc2V0O1xuICB9XG5cbiAgQElucHV0KCkgc2V0IHJvd0NvdW50KHZhbDogbnVtYmVyKSB7XG4gICAgdGhpcy5fcm93Q291bnQgPSB2YWw7XG4gICAgdGhpcy5yZWNhbGNMYXlvdXQoKTtcbiAgfVxuXG4gIGdldCByb3dDb3VudCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9yb3dDb3VudDtcbiAgfVxuXG4gIEBIb3N0QmluZGluZygnc3R5bGUud2lkdGgnKVxuICBnZXQgYm9keVdpZHRoKCk6IHN0cmluZyB7XG4gICAgaWYgKHRoaXMuc2Nyb2xsYmFySCkge1xuICAgICAgcmV0dXJuIHRoaXMuaW5uZXJXaWR0aCArICdweCc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAnMTAwJSc7XG4gICAgfVxuICB9XG5cbiAgQElucHV0KClcbiAgQEhvc3RCaW5kaW5nKCdzdHlsZS5oZWlnaHQnKVxuICBzZXQgYm9keUhlaWdodCh2YWwpIHtcbiAgICBpZiAodGhpcy5zY3JvbGxiYXJWKSB7XG4gICAgICB0aGlzLl9ib2R5SGVpZ2h0ID0gdmFsICsgJ3B4JztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fYm9keUhlaWdodCA9ICdhdXRvJztcbiAgICB9XG5cbiAgICB0aGlzLnJlY2FsY0xheW91dCgpO1xuICB9XG5cbiAgZ2V0IGJvZHlIZWlnaHQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2JvZHlIZWlnaHQ7XG4gIH1cblxuICBAT3V0cHV0KCkgc2Nyb2xsOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgQE91dHB1dCgpIHBhZ2U6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICBAT3V0cHV0KCkgYWN0aXZhdGU6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICBAT3V0cHV0KCkgc2VsZWN0OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgQE91dHB1dCgpIGRldGFpbFRvZ2dsZTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIEBPdXRwdXQoKSByb3dDb250ZXh0bWVudSA9IG5ldyBFdmVudEVtaXR0ZXI8eyBldmVudDogTW91c2VFdmVudDsgcm93OiBhbnkgfT4oZmFsc2UpO1xuICBAT3V0cHV0KCkgdHJlZUFjdGlvbjogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgQFZpZXdDaGlsZChTY3JvbGxlckNvbXBvbmVudCkgc2Nyb2xsZXI6IFNjcm9sbGVyQ29tcG9uZW50O1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGlmIHNlbGVjdGlvbiBpcyBlbmFibGVkLlxuICAgKi9cbiAgZ2V0IHNlbGVjdEVuYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEhdGhpcy5zZWxlY3Rpb25UeXBlO1xuICB9XG5cbiAgLyoqXG4gICAqIFByb3BlcnR5IHRoYXQgd291bGQgY2FsY3VsYXRlIHRoZSBoZWlnaHQgb2Ygc2Nyb2xsIGJhclxuICAgKiBiYXNlZCBvbiB0aGUgcm93IGhlaWdodHMgY2FjaGUgZm9yIHZpcnR1YWwgc2Nyb2xsIGFuZCB2aXJ0dWFsaXphdGlvbi4gT3RoZXIgc2NlbmFyaW9zXG4gICAqIGNhbGN1bGF0ZSBzY3JvbGwgaGVpZ2h0IGF1dG9tYXRpY2FsbHkgKGFzIGhlaWdodCB3aWxsIGJlIHVuZGVmaW5lZCkuXG4gICAqL1xuICBnZXQgc2Nyb2xsSGVpZ2h0KCk6IG51bWJlciB8IHVuZGVmaW5lZCB7XG4gICAgaWYgKHRoaXMuc2Nyb2xsYmFyViAmJiB0aGlzLnZpcnR1YWxpemF0aW9uICYmIHRoaXMucm93Q291bnQpIHtcbiAgICAgIHJldHVybiB0aGlzLnJvd0hlaWdodHNDYWNoZS5xdWVyeSh0aGlzLnJvd0NvdW50IC0gMSk7XG4gICAgfVxuICAgIC8vIGF2b2lkIFRTNzAzMDogTm90IGFsbCBjb2RlIHBhdGhzIHJldHVybiBhIHZhbHVlLlxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICByb3dIZWlnaHRzQ2FjaGU6IFJvd0hlaWdodENhY2hlID0gbmV3IFJvd0hlaWdodENhY2hlKCk7XG4gIHRlbXA6IGFueVtdID0gW107XG4gIG9mZnNldFkgPSAwO1xuICBpbmRleGVzOiBhbnkgPSB7fTtcbiAgY29sdW1uR3JvdXBXaWR0aHM6IGFueTtcbiAgY29sdW1uR3JvdXBXaWR0aHNXaXRob3V0R3JvdXA6IGFueTtcbiAgcm93VHJhY2tpbmdGbjogYW55O1xuICBsaXN0ZW5lcjogYW55O1xuICByb3dJbmRleGVzOiBhbnkgPSBuZXcgV2Vha01hcDxhbnksIHN0cmluZz4oKTtcbiAgcm93RXhwYW5zaW9uczogYW55W10gPSBbXTtcblxuICBfcm93czogYW55W107XG4gIF9ib2R5SGVpZ2h0OiBhbnk7XG4gIF9jb2x1bW5zOiBhbnlbXTtcbiAgX3Jvd0NvdW50OiBudW1iZXI7XG4gIF9vZmZzZXQ6IG51bWJlcjtcbiAgX3BhZ2VTaXplOiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgRGF0YVRhYmxlQm9keUNvbXBvbmVudC5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgY2Q6IENoYW5nZURldGVjdG9yUmVmKSB7XG4gICAgLy8gZGVjbGFyZSBmbiBoZXJlIHNvIHdlIGNhbiBnZXQgYWNjZXNzIHRvIHRoZSBgdGhpc2AgcHJvcGVydHlcbiAgICB0aGlzLnJvd1RyYWNraW5nRm4gPSAoaW5kZXg6IG51bWJlciwgcm93OiBhbnkpOiBhbnkgPT4ge1xuICAgICAgY29uc3QgaWR4ID0gdGhpcy5nZXRSb3dJbmRleChyb3cpO1xuICAgICAgaWYgKHRoaXMudHJhY2tCeVByb3ApIHtcbiAgICAgICAgcmV0dXJuIHJvd1t0aGlzLnRyYWNrQnlQcm9wXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBpZHg7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgYWZ0ZXIgdGhlIGNvbnN0cnVjdG9yLCBpbml0aWFsaXppbmcgaW5wdXQgcHJvcGVydGllc1xuICAgKi9cbiAgbmdPbkluaXQoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMucm93RGV0YWlsKSB7XG4gICAgICB0aGlzLmxpc3RlbmVyID0gdGhpcy5yb3dEZXRhaWwudG9nZ2xlLnN1YnNjcmliZSgoeyB0eXBlLCB2YWx1ZSB9OiB7IHR5cGU6IHN0cmluZzsgdmFsdWU6IGFueSB9KSA9PiB7XG4gICAgICAgIGlmICh0eXBlID09PSAncm93Jykge1xuICAgICAgICAgIHRoaXMudG9nZ2xlUm93RXhwYW5zaW9uKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZSA9PT0gJ2FsbCcpIHtcbiAgICAgICAgICB0aGlzLnRvZ2dsZUFsbFJvd3ModmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVmcmVzaCByb3dzIGFmdGVyIHRvZ2dsZVxuICAgICAgICAvLyBGaXhlcyAjODgzXG4gICAgICAgIHRoaXMudXBkYXRlSW5kZXhlcygpO1xuICAgICAgICB0aGlzLnVwZGF0ZVJvd3MoKTtcbiAgICAgICAgdGhpcy5jZC5tYXJrRm9yQ2hlY2soKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmdyb3VwSGVhZGVyKSB7XG4gICAgICB0aGlzLmxpc3RlbmVyID0gdGhpcy5ncm91cEhlYWRlci50b2dnbGUuc3Vic2NyaWJlKCh7IHR5cGUsIHZhbHVlIH06IHsgdHlwZTogc3RyaW5nOyB2YWx1ZTogYW55IH0pID0+IHtcbiAgICAgICAgaWYgKHR5cGUgPT09ICdncm91cCcpIHtcbiAgICAgICAgICB0aGlzLnRvZ2dsZVJvd0V4cGFuc2lvbih2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGUgPT09ICdhbGwnKSB7XG4gICAgICAgICAgdGhpcy50b2dnbGVBbGxSb3dzKHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlZnJlc2ggcm93cyBhZnRlciB0b2dnbGVcbiAgICAgICAgLy8gRml4ZXMgIzg4M1xuICAgICAgICB0aGlzLnVwZGF0ZUluZGV4ZXMoKTtcbiAgICAgICAgdGhpcy51cGRhdGVSb3dzKCk7XG4gICAgICAgIHRoaXMuY2QubWFya0ZvckNoZWNrKCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIG9uY2UsIGJlZm9yZSB0aGUgaW5zdGFuY2UgaXMgZGVzdHJveWVkLlxuICAgKi9cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgaWYgKHRoaXMucm93RGV0YWlsIHx8IHRoaXMuZ3JvdXBIZWFkZXIpIHtcbiAgICAgIHRoaXMubGlzdGVuZXIudW5zdWJzY3JpYmUoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgWSBvZmZzZXQgZ2l2ZW4gYSBuZXcgb2Zmc2V0LlxuICAgKi9cbiAgdXBkYXRlT2Zmc2V0WShvZmZzZXQ/OiBudW1iZXIpOiB2b2lkIHtcbiAgICAvLyBzY3JvbGxlciBpcyBtaXNzaW5nIG9uIGVtcHR5IHRhYmxlXG4gICAgaWYgKCF0aGlzLnNjcm9sbGVyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc2Nyb2xsYmFyViAmJiB0aGlzLnZpcnR1YWxpemF0aW9uICYmIG9mZnNldCkge1xuICAgICAgLy8gRmlyc3QgZ2V0IHRoZSByb3cgSW5kZXggdGhhdCB3ZSBuZWVkIHRvIG1vdmUgdG8uXG4gICAgICBjb25zdCByb3dJbmRleCA9IHRoaXMucGFnZVNpemUgKiBvZmZzZXQ7XG4gICAgICBvZmZzZXQgPSB0aGlzLnJvd0hlaWdodHNDYWNoZS5xdWVyeShyb3dJbmRleCAtIDEpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5zY3JvbGxiYXJWICYmICF0aGlzLnZpcnR1YWxpemF0aW9uKSB7XG4gICAgICBvZmZzZXQgPSAwO1xuICAgIH1cblxuICAgIHRoaXMuc2Nyb2xsZXIuc2V0T2Zmc2V0KG9mZnNldCB8fCAwKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCb2R5IHdhcyBzY3JvbGxlZCwgdGhpcyBpcyBtYWlubHkgdXNlZnVsIGZvclxuICAgKiB3aGVuIGEgdXNlciBpcyBzZXJ2ZXItc2lkZSBwYWdpbmF0aW9uIHZpYSB2aXJ0dWFsIHNjcm9sbC5cbiAgICovXG4gIG9uQm9keVNjcm9sbChldmVudDogYW55KTogdm9pZCB7XG4gICAgY29uc3Qgc2Nyb2xsWVBvczogbnVtYmVyID0gZXZlbnQuc2Nyb2xsWVBvcztcbiAgICBjb25zdCBzY3JvbGxYUG9zOiBudW1iZXIgPSBldmVudC5zY3JvbGxYUG9zO1xuXG4gICAgLy8gaWYgc2Nyb2xsIGNoYW5nZSwgdHJpZ2dlciB1cGRhdGVcbiAgICAvLyB0aGlzIGlzIG1haW5seSB1c2VkIGZvciBoZWFkZXIgY2VsbCBwb3NpdGlvbnNcbiAgICBpZiAodGhpcy5vZmZzZXRZICE9PSBzY3JvbGxZUG9zIHx8IHRoaXMub2Zmc2V0WCAhPT0gc2Nyb2xsWFBvcykge1xuICAgICAgdGhpcy5zY3JvbGwuZW1pdCh7XG4gICAgICAgIG9mZnNldFk6IHNjcm9sbFlQb3MsXG4gICAgICAgIG9mZnNldFg6IHNjcm9sbFhQb3NcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHRoaXMub2Zmc2V0WSA9IHNjcm9sbFlQb3M7XG4gICAgdGhpcy5vZmZzZXRYID0gc2Nyb2xsWFBvcztcblxuICAgIHRoaXMudXBkYXRlSW5kZXhlcygpO1xuICAgIHRoaXMudXBkYXRlUGFnZShldmVudC5kaXJlY3Rpb24pO1xuICAgIHRoaXMudXBkYXRlUm93cygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIHBhZ2UgZ2l2ZW4gYSBkaXJlY3Rpb24uXG4gICAqL1xuICB1cGRhdGVQYWdlKGRpcmVjdGlvbjogc3RyaW5nKTogdm9pZCB7XG4gICAgbGV0IG9mZnNldCA9IHRoaXMuaW5kZXhlcy5maXJzdCAvIHRoaXMucGFnZVNpemU7XG5cbiAgICBpZiAoZGlyZWN0aW9uID09PSAndXAnKSB7XG4gICAgICBvZmZzZXQgPSBNYXRoLmNlaWwob2Zmc2V0KTtcbiAgICB9IGVsc2UgaWYgKGRpcmVjdGlvbiA9PT0gJ2Rvd24nKSB7XG4gICAgICBvZmZzZXQgPSBNYXRoLmZsb29yKG9mZnNldCk7XG4gICAgfVxuXG4gICAgaWYgKGRpcmVjdGlvbiAhPT0gdW5kZWZpbmVkICYmICFpc05hTihvZmZzZXQpKSB7XG4gICAgICB0aGlzLnBhZ2UuZW1pdCh7IG9mZnNldCB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgcm93cyBpbiB0aGUgdmlldyBwb3J0XG4gICAqL1xuICB1cGRhdGVSb3dzKCk6IHZvaWQge1xuICAgIGNvbnN0IHsgZmlyc3QsIGxhc3QgfSA9IHRoaXMuaW5kZXhlcztcbiAgICBsZXQgcm93SW5kZXggPSBmaXJzdDtcbiAgICBsZXQgaWR4ID0gMDtcbiAgICBjb25zdCB0ZW1wOiBhbnlbXSA9IFtdO1xuXG4gICAgLy8gaWYgZ3JvdXByb3dzYnkgaGFzIGJlZW4gc3BlY2lmaWVkIHRyZWF0IHJvdyBwYWdpbmdcbiAgICAvLyBwYXJhbWV0ZXJzIGFzIGdyb3VwIHBhZ2luZyBwYXJhbWV0ZXJzIGllIGlmIGxpbWl0IDEwIGhhcyBiZWVuXG4gICAgLy8gc3BlY2lmaWVkIHRyZWF0IGl0IGFzIDEwIGdyb3VwcyByYXRoZXIgdGhhbiAxMCByb3dzXG4gICAgaWYgKHRoaXMuZ3JvdXBlZFJvd3MpIHtcbiAgICAgIGxldCBtYXhSb3dzUGVyR3JvdXAgPSAzO1xuICAgICAgLy8gaWYgdGhlcmUgaXMgb25seSBvbmUgZ3JvdXAgc2V0IHRoZSBtYXhpbXVtIG51bWJlciBvZlxuICAgICAgLy8gcm93cyBwZXIgZ3JvdXAgdGhlIHNhbWUgYXMgdGhlIHRvdGFsIG51bWJlciBvZiByb3dzXG4gICAgICBpZiAodGhpcy5ncm91cGVkUm93cy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgbWF4Um93c1Blckdyb3VwID0gdGhpcy5ncm91cGVkUm93c1swXS52YWx1ZS5sZW5ndGg7XG4gICAgICB9XG5cbiAgICAgIHdoaWxlIChyb3dJbmRleCA8IGxhc3QgJiYgcm93SW5kZXggPCB0aGlzLmdyb3VwZWRSb3dzLmxlbmd0aCkge1xuICAgICAgICAvLyBBZGQgdGhlIGdyb3VwcyBpbnRvIHRoaXMgcGFnZVxuICAgICAgICBjb25zdCBncm91cCA9IHRoaXMuZ3JvdXBlZFJvd3Nbcm93SW5kZXhdO1xuICAgICAgICB0aGlzLnJvd0luZGV4ZXMuc2V0KGdyb3VwLCByb3dJbmRleCk7XG5cbiAgICAgICAgaWYgKGdyb3VwLnZhbHVlKSB7XG4gICAgICAgICAgLy8gYWRkIGluZGV4ZXMgZm9yIGVhY2ggZ3JvdXAgaXRlbVxuICAgICAgICAgIGdyb3VwLnZhbHVlLmZvckVhY2goKGc6IGFueSwgaTogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBfaWR4ID0gYCR7cm93SW5kZXh9LSR7aX1gO1xuICAgICAgICAgICAgdGhpcy5yb3dJbmRleGVzLnNldChnLCBfaWR4KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB0ZW1wW2lkeF0gPSBncm91cDtcbiAgICAgICAgaWR4Kys7XG5cbiAgICAgICAgLy8gR3JvdXAgaW5kZXggaW4gdGhpcyBjb250ZXh0XG4gICAgICAgIHJvd0luZGV4Kys7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHdoaWxlIChyb3dJbmRleCA8IGxhc3QgJiYgcm93SW5kZXggPCB0aGlzLnJvd0NvdW50KSB7XG4gICAgICAgIGNvbnN0IHJvdyA9IHRoaXMucm93c1tyb3dJbmRleF07XG5cbiAgICAgICAgaWYgKHJvdykge1xuICAgICAgICAgIC8vIGFkZCBpbmRleGVzIGZvciBlYWNoIHJvd1xuICAgICAgICAgIHRoaXMucm93SW5kZXhlcy5zZXQocm93LCByb3dJbmRleCk7XG4gICAgICAgICAgdGVtcFtpZHhdID0gcm93O1xuICAgICAgICB9XG5cbiAgICAgICAgaWR4Kys7XG4gICAgICAgIHJvd0luZGV4Kys7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy50ZW1wID0gdGVtcDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHJvdyBoZWlnaHRcbiAgICovXG4gIGdldFJvd0hlaWdodChyb3c6IGFueSk6IG51bWJlciB7XG4gICAgLy8gaWYgaXRzIGEgZnVuY3Rpb24gcmV0dXJuIGl0XG4gICAgaWYgKHR5cGVvZiB0aGlzLnJvd0hlaWdodCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHRoaXMucm93SGVpZ2h0KHJvdyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMucm93SGVpZ2h0IGFzIG51bWJlcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0gZ3JvdXAgdGhlIGdyb3VwIHdpdGggYWxsIHJvd3NcbiAgICovXG4gIGdldEdyb3VwSGVpZ2h0KGdyb3VwOiBhbnkpOiBudW1iZXIge1xuICAgIGxldCByb3dIZWlnaHQgPSAwO1xuXG4gICAgaWYgKGdyb3VwLnZhbHVlKSB7XG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgZ3JvdXAudmFsdWUubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIHJvd0hlaWdodCArPSB0aGlzLmdldFJvd0FuZERldGFpbEhlaWdodChncm91cC52YWx1ZVtpbmRleF0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByb3dIZWlnaHQ7XG4gIH1cblxuICAvKipcbiAgICogQ2FsY3VsYXRlIHJvdyBoZWlnaHQgYmFzZWQgb24gdGhlIGV4cGFuZGVkIHN0YXRlIG9mIHRoZSByb3cuXG4gICAqL1xuICBnZXRSb3dBbmREZXRhaWxIZWlnaHQocm93OiBhbnkpOiBudW1iZXIge1xuICAgIGxldCByb3dIZWlnaHQgPSB0aGlzLmdldFJvd0hlaWdodChyb3cpO1xuICAgIGNvbnN0IGV4cGFuZGVkID0gdGhpcy5nZXRSb3dFeHBhbmRlZChyb3cpO1xuXG4gICAgLy8gQWRkaW5nIGRldGFpbCByb3cgaGVpZ2h0IGlmIGl0cyBleHBhbmRlZC5cbiAgICBpZiAoZXhwYW5kZWQpIHtcbiAgICAgIHJvd0hlaWdodCArPSB0aGlzLmdldERldGFpbFJvd0hlaWdodChyb3cpO1xuICAgIH1cblxuICAgIHJldHVybiByb3dIZWlnaHQ7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBoZWlnaHQgb2YgdGhlIGRldGFpbCByb3cuXG4gICAqL1xuICBnZXREZXRhaWxSb3dIZWlnaHQgPSAocm93PzogYW55LCBpbmRleD86IGFueSk6IG51bWJlciA9PiB7XG4gICAgaWYgKCF0aGlzLnJvd0RldGFpbCkge1xuICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIGNvbnN0IHJvd0hlaWdodCA9IHRoaXMucm93RGV0YWlsLnJvd0hlaWdodDtcbiAgICByZXR1cm4gdHlwZW9mIHJvd0hlaWdodCA9PT0gJ2Z1bmN0aW9uJyA/IHJvd0hlaWdodChyb3csIGluZGV4KSA6IChyb3dIZWlnaHQgYXMgbnVtYmVyKTtcbiAgfTtcblxuICAvKipcbiAgICogQ2FsY3VsYXRlcyB0aGUgc3R5bGVzIGZvciB0aGUgcm93IHNvIHRoYXQgdGhlIHJvd3MgY2FuIGJlIG1vdmVkIGluIDJEIHNwYWNlXG4gICAqIGR1cmluZyB2aXJ0dWFsIHNjcm9sbCBpbnNpZGUgdGhlIERPTS4gICBJbiB0aGUgYmVsb3cgY2FzZSB0aGUgWSBwb3NpdGlvbiBpc1xuICAgKiBtYW5pcHVsYXRlZC4gICBBcyBhbiBleGFtcGxlLCBpZiB0aGUgaGVpZ2h0IG9mIHJvdyAwIGlzIDMwIHB4IGFuZCByb3cgMSBpc1xuICAgKiAxMDAgcHggdGhlbiBmb2xsb3dpbmcgc3R5bGVzIGFyZSBnZW5lcmF0ZWQ6XG4gICAqXG4gICAqIHRyYW5zZm9ybTogdHJhbnNsYXRlM2QoMHB4LCAwcHgsIDBweCk7ICAgIC0+ICByb3cwXG4gICAqIHRyYW5zZm9ybTogdHJhbnNsYXRlM2QoMHB4LCAzMHB4LCAwcHgpOyAgIC0+ICByb3cxXG4gICAqIHRyYW5zZm9ybTogdHJhbnNsYXRlM2QoMHB4LCAxMzBweCwgMHB4KTsgIC0+ICByb3cyXG4gICAqXG4gICAqIFJvdyBoZWlnaHRzIGhhdmUgdG8gYmUgY2FsY3VsYXRlZCBiYXNlZCBvbiB0aGUgcm93IGhlaWdodHMgY2FjaGUgYXMgd2Ugd29udFxuICAgKiBiZSBhYmxlIHRvIGRldGVybWluZSB3aGljaCByb3cgaXMgb2Ygd2hhdCBoZWlnaHQgYmVmb3JlIGhhbmQuICBJbiB0aGUgYWJvdmVcbiAgICogY2FzZSB0aGUgcG9zaXRpb25ZIG9mIHRoZSB0cmFuc2xhdGUzZCBmb3Igcm93MiB3b3VsZCBiZSB0aGUgc3VtIG9mIGFsbCB0aGVcbiAgICogaGVpZ2h0cyBvZiB0aGUgcm93cyBiZWZvcmUgaXQgKGkuZS4gcm93MCBhbmQgcm93MSkuXG4gICAqXG4gICAqIEBwYXJhbSByb3dzIHRoZSByb3cgdGhhdCBuZWVkcyB0byBiZSBwbGFjZWQgaW4gdGhlIDJEIHNwYWNlLlxuICAgKiBAcmV0dXJucyB0aGUgQ1NTMyBzdHlsZSB0byBiZSBhcHBsaWVkXG4gICAqXG4gICAqIEBtZW1iZXJPZiBEYXRhVGFibGVCb2R5Q29tcG9uZW50XG4gICAqL1xuICBnZXRSb3dzU3R5bGVzKHJvd3M6IGFueSk6IGFueSB7XG4gICAgY29uc3Qgc3R5bGVzOiBhbnkgPSB7fTtcblxuICAgIC8vIG9ubHkgYWRkIHN0eWxlcyBmb3IgdGhlIGdyb3VwIGlmIHRoZXJlIGlzIGEgZ3JvdXBcbiAgICBpZiAodGhpcy5ncm91cGVkUm93cykge1xuICAgICAgc3R5bGVzLndpZHRoID0gdGhpcy5jb2x1bW5Hcm91cFdpZHRocy50b3RhbDtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zY3JvbGxiYXJWICYmIHRoaXMudmlydHVhbGl6YXRpb24pIHtcbiAgICAgIGxldCBpZHggPSAwO1xuXG4gICAgICBpZiAodGhpcy5ncm91cGVkUm93cykge1xuICAgICAgICAvLyBHZXQgdGhlIGxhdGVzdCByb3cgcm93aW5kZXggaW4gYSBncm91cFxuICAgICAgICBjb25zdCByb3cgPSByb3dzW3Jvd3MubGVuZ3RoIC0gMV07XG4gICAgICAgIGlkeCA9IHJvdyA/IHRoaXMuZ2V0Um93SW5kZXgocm93KSA6IDA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZHggPSB0aGlzLmdldFJvd0luZGV4KHJvd3MpO1xuICAgICAgfVxuXG4gICAgICAvLyBjb25zdCBwb3MgPSBpZHggKiByb3dIZWlnaHQ7XG4gICAgICAvLyBUaGUgcG9zaXRpb24gb2YgdGhpcyByb3cgd291bGQgYmUgdGhlIHN1bSBvZiBhbGwgcm93IGhlaWdodHNcbiAgICAgIC8vIHVudGlsIHRoZSBwcmV2aW91cyByb3cgcG9zaXRpb24uXG4gICAgICBjb25zdCBwb3MgPSB0aGlzLnJvd0hlaWdodHNDYWNoZS5xdWVyeShpZHggLSAxKTtcblxuICAgICAgdHJhbnNsYXRlWFkoc3R5bGVzLCAwLCBwb3MpO1xuICAgIH1cblxuICAgIHJldHVybiBzdHlsZXM7XG4gIH1cblxuICAvKipcbiAgICogQ2FsY3VsYXRlIGJvdHRvbSBzdW1tYXJ5IHJvdyBvZmZzZXQgZm9yIHNjcm9sbGJhciBtb2RlLlxuICAgKiBGb3IgbW9yZSBpbmZvcm1hdGlvbiBhYm91dCBjYWNoZSBhbmQgb2Zmc2V0IGNhbGN1bGF0aW9uXG4gICAqIHNlZSBkZXNjcmlwdGlvbiBmb3IgYGdldFJvd3NTdHlsZXNgIG1ldGhvZFxuICAgKlxuICAgKiBAcmV0dXJucyB0aGUgQ1NTMyBzdHlsZSB0byBiZSBhcHBsaWVkXG4gICAqXG4gICAqIEBtZW1iZXJPZiBEYXRhVGFibGVCb2R5Q29tcG9uZW50XG4gICAqL1xuICBnZXRCb3R0b21TdW1tYXJ5Um93U3R5bGVzKCk6IGFueSB7XG4gICAgaWYgKCF0aGlzLnNjcm9sbGJhclYgfHwgIXRoaXMucm93cyB8fCAhdGhpcy5yb3dzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3Qgc3R5bGVzID0geyBwb3NpdGlvbjogJ2Fic29sdXRlJyB9O1xuICAgIGNvbnN0IHBvcyA9IHRoaXMucm93SGVpZ2h0c0NhY2hlLnF1ZXJ5KHRoaXMucm93cy5sZW5ndGggLSAxKTtcblxuICAgIHRyYW5zbGF0ZVhZKHN0eWxlcywgMCwgcG9zKTtcblxuICAgIHJldHVybiBzdHlsZXM7XG4gIH1cblxuICAvKipcbiAgICogSGlkZXMgdGhlIGxvYWRpbmcgaW5kaWNhdG9yXG4gICAqL1xuICBoaWRlSW5kaWNhdG9yKCk6IHZvaWQge1xuICAgIHNldFRpbWVvdXQoKCkgPT4gKHRoaXMubG9hZGluZ0luZGljYXRvciA9IGZhbHNlKSwgNTAwKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBpbmRleCBvZiB0aGUgcm93cyBpbiB0aGUgdmlld3BvcnRcbiAgICovXG4gIHVwZGF0ZUluZGV4ZXMoKTogdm9pZCB7XG4gICAgbGV0IGZpcnN0ID0gMDtcbiAgICBsZXQgbGFzdCA9IDA7XG5cbiAgICBpZiAodGhpcy5zY3JvbGxiYXJWKSB7XG4gICAgICBpZiAodGhpcy52aXJ0dWFsaXphdGlvbikge1xuICAgICAgICAvLyBDYWxjdWxhdGlvbiBvZiB0aGUgZmlyc3QgYW5kIGxhc3QgaW5kZXhlcyB3aWxsIGJlIGJhc2VkIG9uIHdoZXJlIHRoZVxuICAgICAgICAvLyBzY3JvbGxZIHBvc2l0aW9uIHdvdWxkIGJlIGF0LiAgVGhlIGxhc3QgaW5kZXggd291bGQgYmUgdGhlIG9uZVxuICAgICAgICAvLyB0aGF0IHNob3dzIHVwIGluc2lkZSB0aGUgdmlldyBwb3J0IHRoZSBsYXN0LlxuICAgICAgICBjb25zdCBoZWlnaHQgPSBwYXJzZUludCh0aGlzLmJvZHlIZWlnaHQsIDApO1xuICAgICAgICBmaXJzdCA9IHRoaXMucm93SGVpZ2h0c0NhY2hlLmdldFJvd0luZGV4KHRoaXMub2Zmc2V0WSk7XG4gICAgICAgIGxhc3QgPSB0aGlzLnJvd0hlaWdodHNDYWNoZS5nZXRSb3dJbmRleChoZWlnaHQgKyB0aGlzLm9mZnNldFkpICsgMTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIElmIHZpcnR1YWwgcm93cyBhcmUgbm90IG5lZWRlZFxuICAgICAgICAvLyBXZSByZW5kZXIgYWxsIGluIG9uZSBnb1xuICAgICAgICBmaXJzdCA9IDA7XG4gICAgICAgIGxhc3QgPSB0aGlzLnJvd0NvdW50O1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUaGUgc2VydmVyIGlzIGhhbmRsaW5nIHBhZ2luZyBhbmQgd2lsbCBwYXNzIGFuIGFycmF5IHRoYXQgYmVnaW5zIHdpdGggdGhlXG4gICAgICAvLyBlbGVtZW50IGF0IGEgc3BlY2lmaWVkIG9mZnNldC4gIGZpcnN0IHNob3VsZCBhbHdheXMgYmUgMCB3aXRoIGV4dGVybmFsIHBhZ2luZy5cbiAgICAgIGlmICghdGhpcy5leHRlcm5hbFBhZ2luZykge1xuICAgICAgICBmaXJzdCA9IE1hdGgubWF4KHRoaXMub2Zmc2V0ICogdGhpcy5wYWdlU2l6ZSwgMCk7XG4gICAgICB9XG4gICAgICBsYXN0ID0gTWF0aC5taW4oZmlyc3QgKyB0aGlzLnBhZ2VTaXplLCB0aGlzLnJvd0NvdW50KTtcbiAgICB9XG5cbiAgICB0aGlzLmluZGV4ZXMgPSB7IGZpcnN0LCBsYXN0IH07XG4gIH1cblxuICAvKipcbiAgICogUmVmcmVzaGVzIHRoZSBmdWxsIFJvdyBIZWlnaHQgY2FjaGUuICBTaG91bGQgYmUgdXNlZFxuICAgKiB3aGVuIHRoZSBlbnRpcmUgcm93IGFycmF5IHN0YXRlIGhhcyBjaGFuZ2VkLlxuICAgKi9cbiAgcmVmcmVzaFJvd0hlaWdodENhY2hlKCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5zY3JvbGxiYXJWIHx8ICh0aGlzLnNjcm9sbGJhclYgJiYgIXRoaXMudmlydHVhbGl6YXRpb24pKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gY2xlYXIgdGhlIHByZXZpb3VzIHJvdyBoZWlnaHQgY2FjaGUgaWYgYWxyZWFkeSBwcmVzZW50LlxuICAgIC8vIHRoaXMgaXMgdXNlZnVsIGR1cmluZyBzb3J0cywgZmlsdGVycyB3aGVyZSB0aGUgc3RhdGUgb2YgdGhlXG4gICAgLy8gcm93cyBhcnJheSBpcyBjaGFuZ2VkLlxuICAgIHRoaXMucm93SGVpZ2h0c0NhY2hlLmNsZWFyQ2FjaGUoKTtcblxuICAgIC8vIEluaXRpYWxpemUgdGhlIHRyZWUgb25seSBpZiB0aGVyZSBhcmUgcm93cyBpbnNpZGUgdGhlIHRyZWUuXG4gICAgaWYgKHRoaXMucm93cyAmJiB0aGlzLnJvd3MubGVuZ3RoKSB7XG4gICAgICBjb25zdCByb3dFeHBhbnNpb25zID0gbmV3IFNldCgpO1xuICAgICAgZm9yIChjb25zdCByb3cgb2YgdGhpcy5yb3dzKSB7XG4gICAgICAgIGlmICh0aGlzLmdldFJvd0V4cGFuZGVkKHJvdykpIHtcbiAgICAgICAgICByb3dFeHBhbnNpb25zLmFkZChyb3cpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMucm93SGVpZ2h0c0NhY2hlLmluaXRDYWNoZSh7XG4gICAgICAgIHJvd3M6IHRoaXMucm93cyxcbiAgICAgICAgcm93SGVpZ2h0OiB0aGlzLnJvd0hlaWdodCxcbiAgICAgICAgZGV0YWlsUm93SGVpZ2h0OiB0aGlzLmdldERldGFpbFJvd0hlaWdodCxcbiAgICAgICAgZXh0ZXJuYWxWaXJ0dWFsOiB0aGlzLnNjcm9sbGJhclYgJiYgdGhpcy5leHRlcm5hbFBhZ2luZyxcbiAgICAgICAgcm93Q291bnQ6IHRoaXMucm93Q291bnQsXG4gICAgICAgIHJvd0luZGV4ZXM6IHRoaXMucm93SW5kZXhlcyxcbiAgICAgICAgcm93RXhwYW5zaW9uc1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGluZGV4IGZvciB0aGUgdmlldyBwb3J0XG4gICAqL1xuICBnZXRBZGp1c3RlZFZpZXdQb3J0SW5kZXgoKTogbnVtYmVyIHtcbiAgICAvLyBDYXB0dXJlIHRoZSByb3cgaW5kZXggb2YgdGhlIGZpcnN0IHJvdyB0aGF0IGlzIHZpc2libGUgb24gdGhlIHZpZXdwb3J0LlxuICAgIC8vIElmIHRoZSBzY3JvbGwgYmFyIGlzIGp1c3QgYmVsb3cgdGhlIHJvdyB3aGljaCBpcyBoaWdobGlnaHRlZCB0aGVuIG1ha2UgdGhhdCBhcyB0aGVcbiAgICAvLyBmaXJzdCBpbmRleC5cbiAgICBjb25zdCB2aWV3UG9ydEZpcnN0Um93SW5kZXggPSB0aGlzLmluZGV4ZXMuZmlyc3Q7XG5cbiAgICBpZiAodGhpcy5zY3JvbGxiYXJWICYmIHRoaXMudmlydHVhbGl6YXRpb24pIHtcbiAgICAgIGNvbnN0IG9mZnNldFNjcm9sbCA9IHRoaXMucm93SGVpZ2h0c0NhY2hlLnF1ZXJ5KHZpZXdQb3J0Rmlyc3RSb3dJbmRleCAtIDEpO1xuICAgICAgcmV0dXJuIG9mZnNldFNjcm9sbCA8PSB0aGlzLm9mZnNldFkgPyB2aWV3UG9ydEZpcnN0Um93SW5kZXggLSAxIDogdmlld1BvcnRGaXJzdFJvd0luZGV4O1xuICAgIH1cblxuICAgIHJldHVybiB2aWV3UG9ydEZpcnN0Um93SW5kZXg7XG4gIH1cblxuICAvKipcbiAgICogVG9nZ2xlIHRoZSBFeHBhbnNpb24gb2YgdGhlIHJvdyBpLmUuIGlmIHRoZSByb3cgaXMgZXhwYW5kZWQgdGhlbiBpdCB3aWxsXG4gICAqIGNvbGxhcHNlIGFuZCB2aWNlIHZlcnNhLiAgIE5vdGUgdGhhdCB0aGUgZXhwYW5kZWQgc3RhdHVzIGlzIHN0b3JlZCBhc1xuICAgKiBhIHBhcnQgb2YgdGhlIHJvdyBvYmplY3QgaXRzZWxmIGFzIHdlIGhhdmUgdG8gcHJlc2VydmUgdGhlIGV4cGFuZGVkIHJvd1xuICAgKiBzdGF0dXMgaW4gY2FzZSBvZiBzb3J0aW5nIGFuZCBmaWx0ZXJpbmcgb2YgdGhlIHJvdyBzZXQuXG4gICAqL1xuICB0b2dnbGVSb3dFeHBhbnNpb24ocm93OiBhbnkpOiB2b2lkIHtcbiAgICAvLyBDYXB0dXJlIHRoZSByb3cgaW5kZXggb2YgdGhlIGZpcnN0IHJvdyB0aGF0IGlzIHZpc2libGUgb24gdGhlIHZpZXdwb3J0LlxuICAgIGNvbnN0IHZpZXdQb3J0Rmlyc3RSb3dJbmRleCA9IHRoaXMuZ2V0QWRqdXN0ZWRWaWV3UG9ydEluZGV4KCk7XG4gICAgY29uc3Qgcm93RXhwYW5kZWRJZHggPSB0aGlzLmdldFJvd0V4cGFuZGVkSWR4KHJvdywgdGhpcy5yb3dFeHBhbnNpb25zKTtcbiAgICBjb25zdCBleHBhbmRlZCA9IHJvd0V4cGFuZGVkSWR4ID4gLTE7XG5cbiAgICAvLyBJZiB0aGUgZGV0YWlsUm93SGVpZ2h0IGlzIGF1dG8gLS0+IG9ubHkgaW4gY2FzZSBvZiBub24tdmlydHVhbGl6ZWQgc2Nyb2xsXG4gICAgaWYgKHRoaXMuc2Nyb2xsYmFyViAmJiB0aGlzLnZpcnR1YWxpemF0aW9uKSB7XG4gICAgICBjb25zdCBkZXRhaWxSb3dIZWlnaHQgPSB0aGlzLmdldERldGFpbFJvd0hlaWdodChyb3cpICogKGV4cGFuZGVkID8gLTEgOiAxKTtcbiAgICAgIC8vIGNvbnN0IGlkeCA9IHRoaXMucm93SW5kZXhlcy5nZXQocm93KSB8fCAwO1xuICAgICAgY29uc3QgaWR4ID0gdGhpcy5nZXRSb3dJbmRleChyb3cpO1xuICAgICAgdGhpcy5yb3dIZWlnaHRzQ2FjaGUudXBkYXRlKGlkeCwgZGV0YWlsUm93SGVpZ2h0KTtcbiAgICB9XG5cbiAgICAvLyBVcGRhdGUgdGhlIHRvZ2dsZWQgcm93IGFuZCB1cGRhdGUgdGhpdmUgbmV2ZXJlIGhlaWdodHMgaW4gdGhlIGNhY2hlLlxuICAgIGlmIChleHBhbmRlZCkge1xuICAgICAgdGhpcy5yb3dFeHBhbnNpb25zLnNwbGljZShyb3dFeHBhbmRlZElkeCwgMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucm93RXhwYW5zaW9ucy5wdXNoKHJvdyk7XG4gICAgfVxuXG4gICAgdGhpcy5kZXRhaWxUb2dnbGUuZW1pdCh7XG4gICAgICByb3dzOiBbcm93XSxcbiAgICAgIGN1cnJlbnRJbmRleDogdmlld1BvcnRGaXJzdFJvd0luZGV4XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRXhwYW5kL0NvbGxhcHNlIGFsbCB0aGUgcm93cyBubyBtYXR0ZXIgd2hhdCB0aGVpciBzdGF0ZSBpcy5cbiAgICovXG4gIHRvZ2dsZUFsbFJvd3MoZXhwYW5kZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAvLyBjbGVhciBwcmV2IGV4cGFuc2lvbnNcbiAgICB0aGlzLnJvd0V4cGFuc2lvbnMgPSBbXTtcblxuICAgIC8vIENhcHR1cmUgdGhlIHJvdyBpbmRleCBvZiB0aGUgZmlyc3Qgcm93IHRoYXQgaXMgdmlzaWJsZSBvbiB0aGUgdmlld3BvcnQuXG4gICAgY29uc3Qgdmlld1BvcnRGaXJzdFJvd0luZGV4ID0gdGhpcy5nZXRBZGp1c3RlZFZpZXdQb3J0SW5kZXgoKTtcblxuICAgIGlmIChleHBhbmRlZCkge1xuICAgICAgZm9yIChjb25zdCByb3cgb2YgdGhpcy5yb3dzKSB7XG4gICAgICAgIHRoaXMucm93RXhwYW5zaW9ucy5wdXNoKHJvdyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc2Nyb2xsYmFyVikge1xuICAgICAgLy8gUmVmcmVzaCB0aGUgZnVsbCByb3cgaGVpZ2h0cyBjYWNoZSBzaW5jZSBldmVyeSByb3cgd2FzIGFmZmVjdGVkLlxuICAgICAgdGhpcy5yZWNhbGNMYXlvdXQoKTtcbiAgICB9XG5cbiAgICAvLyBFbWl0IGFsbCByb3dzIHRoYXQgaGF2ZSBiZWVuIGV4cGFuZGVkLlxuICAgIHRoaXMuZGV0YWlsVG9nZ2xlLmVtaXQoe1xuICAgICAgcm93czogdGhpcy5yb3dzLFxuICAgICAgY3VycmVudEluZGV4OiB2aWV3UG9ydEZpcnN0Um93SW5kZXhcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWNhbGN1bGF0ZXMgdGhlIHRhYmxlXG4gICAqL1xuICByZWNhbGNMYXlvdXQoKTogdm9pZCB7XG4gICAgdGhpcy5yZWZyZXNoUm93SGVpZ2h0Q2FjaGUoKTtcbiAgICB0aGlzLnVwZGF0ZUluZGV4ZXMoKTtcbiAgICB0aGlzLnVwZGF0ZVJvd3MoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmFja3MgdGhlIGNvbHVtblxuICAgKi9cbiAgY29sdW1uVHJhY2tpbmdGbihpbmRleDogbnVtYmVyLCBjb2x1bW46IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIGNvbHVtbi4kJGlkO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIHJvdyBwaW5uaW5nIGdyb3VwIHN0eWxlc1xuICAgKi9cbiAgc3R5bGVzQnlHcm91cChncm91cDogc3RyaW5nKSB7XG4gICAgY29uc3Qgd2lkdGhzID0gdGhpcy5jb2x1bW5Hcm91cFdpZHRocztcbiAgICBjb25zdCBvZmZzZXRYID0gdGhpcy5vZmZzZXRYO1xuXG4gICAgY29uc3Qgc3R5bGVzID0ge1xuICAgICAgd2lkdGg6IGAke3dpZHRoc1tncm91cF19cHhgXG4gICAgfTtcblxuICAgIGlmIChncm91cCA9PT0gJ2xlZnQnKSB7XG4gICAgICB0cmFuc2xhdGVYWShzdHlsZXMsIG9mZnNldFgsIDApO1xuICAgIH0gZWxzZSBpZiAoZ3JvdXAgPT09ICdyaWdodCcpIHtcbiAgICAgIGNvbnN0IGJvZHlXaWR0aCA9IHBhcnNlSW50KHRoaXMuaW5uZXJXaWR0aCArICcnLCAwKTtcbiAgICAgIGNvbnN0IHRvdGFsRGlmZiA9IHdpZHRocy50b3RhbCAtIGJvZHlXaWR0aDtcbiAgICAgIGNvbnN0IG9mZnNldERpZmYgPSB0b3RhbERpZmYgLSBvZmZzZXRYO1xuICAgICAgY29uc3Qgb2Zmc2V0ID0gb2Zmc2V0RGlmZiAqIC0xO1xuICAgICAgdHJhbnNsYXRlWFkoc3R5bGVzLCBvZmZzZXQsIDApO1xuICAgIH1cblxuICAgIHJldHVybiBzdHlsZXM7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBpZiB0aGUgcm93IHdhcyBleHBhbmRlZCBhbmQgc2V0IGRlZmF1bHQgcm93IGV4cGFuc2lvbiB3aGVuIHJvdyBleHBhbnNpb24gaXMgZW1wdHlcbiAgICovXG4gIGdldFJvd0V4cGFuZGVkKHJvdzogYW55KTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMucm93RXhwYW5zaW9ucy5sZW5ndGggPT09IDAgJiYgdGhpcy5ncm91cEV4cGFuc2lvbkRlZmF1bHQpIHtcbiAgICAgIGZvciAoY29uc3QgZ3JvdXAgb2YgdGhpcy5ncm91cGVkUm93cykge1xuICAgICAgICB0aGlzLnJvd0V4cGFuc2lvbnMucHVzaChncm91cCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuZ2V0Um93RXhwYW5kZWRJZHgocm93LCB0aGlzLnJvd0V4cGFuc2lvbnMpID4gLTE7XG4gIH1cblxuICBnZXRSb3dFeHBhbmRlZElkeChyb3c6IGFueSwgZXhwYW5kZWQ6IGFueVtdKTogbnVtYmVyIHtcbiAgICBpZiAoIWV4cGFuZGVkIHx8ICFleHBhbmRlZC5sZW5ndGgpIHJldHVybiAtMTtcblxuICAgIGNvbnN0IHJvd0lkID0gdGhpcy5yb3dJZGVudGl0eShyb3cpO1xuICAgIHJldHVybiBleHBhbmRlZC5maW5kSW5kZXgociA9PiB7XG4gICAgICBjb25zdCBpZCA9IHRoaXMucm93SWRlbnRpdHkocik7XG4gICAgICByZXR1cm4gaWQgPT09IHJvd0lkO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIHJvdyBpbmRleCBnaXZlbiBhIHJvd1xuICAgKi9cbiAgZ2V0Um93SW5kZXgocm93OiBhbnkpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnJvd0luZGV4ZXMuZ2V0KHJvdykgfHwgMDtcbiAgfVxuXG4gIG9uVHJlZUFjdGlvbihyb3c6IGFueSkge1xuICAgIHRoaXMudHJlZUFjdGlvbi5lbWl0KHsgcm93IH0pO1xuICB9XG59XG4iXX0=