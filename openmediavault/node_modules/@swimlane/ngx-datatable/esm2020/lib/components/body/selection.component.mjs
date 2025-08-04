import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { SelectionType } from '../../types/selection.type';
import { selectRowsBetween, selectRows } from '../../utils/selection';
import { Keys } from '../../utils/keys';
import * as i0 from "@angular/core";
export class DataTableSelectionComponent {
    constructor() {
        this.activate = new EventEmitter();
        this.select = new EventEmitter();
    }
    selectRow(event, index, row) {
        if (!this.selectEnabled)
            return;
        const chkbox = this.selectionType === SelectionType.checkbox;
        const multi = this.selectionType === SelectionType.multi;
        const multiClick = this.selectionType === SelectionType.multiClick;
        let selected = [];
        if (multi || chkbox || multiClick) {
            if (event.shiftKey) {
                selected = selectRowsBetween([], this.rows, index, this.prevIndex, this.getRowSelectedIdx.bind(this));
            }
            else if (event.ctrlKey || event.metaKey || multiClick || chkbox) {
                selected = selectRows([...this.selected], row, this.getRowSelectedIdx.bind(this));
            }
            else {
                selected = selectRows([], row, this.getRowSelectedIdx.bind(this));
            }
        }
        else {
            selected = selectRows([], row, this.getRowSelectedIdx.bind(this));
        }
        if (typeof this.selectCheck === 'function') {
            selected = selected.filter(this.selectCheck.bind(this));
        }
        this.selected.splice(0, this.selected.length);
        this.selected.push(...selected);
        this.prevIndex = index;
        this.select.emit({
            selected
        });
    }
    onActivate(model, index) {
        const { type, event, row } = model;
        const chkbox = this.selectionType === SelectionType.checkbox;
        const select = (!chkbox && (type === 'click' || type === 'dblclick')) || (chkbox && type === 'checkbox');
        if (select) {
            this.selectRow(event, index, row);
        }
        else if (type === 'keydown') {
            if (event.keyCode === Keys.return) {
                this.selectRow(event, index, row);
            }
            else {
                this.onKeyboardFocus(model);
            }
        }
        this.activate.emit(model);
    }
    onKeyboardFocus(model) {
        const { keyCode } = model.event;
        const shouldFocus = keyCode === Keys.up || keyCode === Keys.down || keyCode === Keys.right || keyCode === Keys.left;
        if (shouldFocus) {
            const isCellSelection = this.selectionType === SelectionType.cell;
            if (!model.cellElement || !isCellSelection) {
                this.focusRow(model.rowElement, keyCode);
            }
            else if (isCellSelection) {
                this.focusCell(model.cellElement, model.rowElement, keyCode, model.cellIndex);
            }
        }
    }
    focusRow(rowElement, keyCode) {
        const nextRowElement = this.getPrevNextRow(rowElement, keyCode);
        if (nextRowElement)
            nextRowElement.focus();
    }
    getPrevNextRow(rowElement, keyCode) {
        const parentElement = rowElement.parentElement;
        if (parentElement) {
            let focusElement;
            if (keyCode === Keys.up) {
                focusElement = parentElement.previousElementSibling;
            }
            else if (keyCode === Keys.down) {
                focusElement = parentElement.nextElementSibling;
            }
            if (focusElement && focusElement.children.length) {
                return focusElement.children[0];
            }
        }
    }
    focusCell(cellElement, rowElement, keyCode, cellIndex) {
        let nextCellElement;
        if (keyCode === Keys.left) {
            nextCellElement = cellElement.previousElementSibling;
        }
        else if (keyCode === Keys.right) {
            nextCellElement = cellElement.nextElementSibling;
        }
        else if (keyCode === Keys.up || keyCode === Keys.down) {
            const nextRowElement = this.getPrevNextRow(rowElement, keyCode);
            if (nextRowElement) {
                const children = nextRowElement.getElementsByClassName('datatable-body-cell');
                if (children.length)
                    nextCellElement = children[cellIndex];
            }
        }
        if (nextCellElement)
            nextCellElement.focus();
    }
    getRowSelected(row) {
        return this.getRowSelectedIdx(row, this.selected) > -1;
    }
    getRowSelectedIdx(row, selected) {
        if (!selected || !selected.length)
            return -1;
        const rowId = this.rowIdentity(row);
        return selected.findIndex(r => {
            const id = this.rowIdentity(r);
            return id === rowId;
        });
    }
}
DataTableSelectionComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.1.1", ngImport: i0, type: DataTableSelectionComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
DataTableSelectionComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "13.1.1", type: DataTableSelectionComponent, selector: "datatable-selection", inputs: { rows: "rows", selected: "selected", selectEnabled: "selectEnabled", selectionType: "selectionType", rowIdentity: "rowIdentity", selectCheck: "selectCheck" }, outputs: { activate: "activate", select: "select" }, ngImport: i0, template: ` <ng-content></ng-content> `, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.1.1", ngImport: i0, type: DataTableSelectionComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'datatable-selection',
                    template: ` <ng-content></ng-content> `,
                    changeDetection: ChangeDetectionStrategy.OnPush
                }]
        }], propDecorators: { rows: [{
                type: Input
            }], selected: [{
                type: Input
            }], selectEnabled: [{
                type: Input
            }], selectionType: [{
                type: Input
            }], rowIdentity: [{
                type: Input
            }], selectCheck: [{
                type: Input
            }], activate: [{
                type: Output
            }], select: [{
                type: Output
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0aW9uLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3N3aW1sYW5lL25neC1kYXRhdGFibGUvc3JjL2xpYi9jb21wb25lbnRzL2JvZHkvc2VsZWN0aW9uLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLHVCQUF1QixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ2hHLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMzRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsVUFBVSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDdEUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLGtCQUFrQixDQUFDOztBQWdCeEMsTUFBTSxPQUFPLDJCQUEyQjtJQUx4QztRQWFZLGFBQVEsR0FBc0IsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUNqRCxXQUFNLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7S0EySDFEO0lBdkhDLFNBQVMsQ0FBQyxLQUFpQyxFQUFFLEtBQWEsRUFBRSxHQUFRO1FBQ2xFLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYTtZQUFFLE9BQU87UUFFaEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEsS0FBSyxhQUFhLENBQUMsUUFBUSxDQUFDO1FBQzdELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxhQUFhLEtBQUssYUFBYSxDQUFDLEtBQUssQ0FBQztRQUN6RCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsYUFBYSxLQUFLLGFBQWEsQ0FBQyxVQUFVLENBQUM7UUFDbkUsSUFBSSxRQUFRLEdBQVUsRUFBRSxDQUFDO1FBRXpCLElBQUksS0FBSyxJQUFJLE1BQU0sSUFBSSxVQUFVLEVBQUU7WUFDakMsSUFBSSxLQUFLLENBQUMsUUFBUSxFQUFF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U0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQzVCLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0IsT0FBTyxFQUFFLEtBQUssS0FBSyxDQUFDO1FBQ3RCLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQzs7d0hBbklVLDJCQUEyQjs0R0FBM0IsMkJBQTJCLHdSQUg1Qiw2QkFBNkI7MkZBRzVCLDJCQUEyQjtrQkFMdkMsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUscUJBQXFCO29CQUMvQixRQUFRLEVBQUUsNkJBQTZCO29CQUN2QyxlQUFlLEVBQUUsdUJBQXVCLENBQUMsTUFBTTtpQkFDaEQ7OEJBRVUsSUFBSTtzQkFBWixLQUFLO2dCQUNHLFFBQVE7c0JBQWhCLEtBQUs7Z0JBQ0csYUFBYTtzQkFBckIsS0FBSztnQkFDRyxhQUFhO3NCQUFyQixLQUFLO2dCQUNHLFdBQVc7c0JBQW5CLEtBQUs7Z0JBQ0csV0FBVztzQkFBbkIsS0FBSztnQkFFSSxRQUFRO3NCQUFqQixNQUFNO2dCQUNHLE1BQU07c0JBQWYsTUFBTSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSW5wdXQsIE91dHB1dCwgRXZlbnRFbWl0dGVyLCBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgU2VsZWN0aW9uVHlwZSB9IGZyb20gJy4uLy4uL3R5cGVzL3NlbGVjdGlvbi50eXBlJztcbmltcG9ydCB7IHNlbGVjdFJvd3NCZXR3ZWVuLCBzZWxlY3RSb3dzIH0gZnJvbSAnLi4vLi4vdXRpbHMvc2VsZWN0aW9uJztcbmltcG9ydCB7IEtleXMgfSBmcm9tICcuLi8uLi91dGlscy9rZXlzJztcblxuZXhwb3J0IGludGVyZmFjZSBNb2RlbCB7XG4gIHR5cGU6IHN0cmluZztcbiAgZXZlbnQ6IE1vdXNlRXZlbnQgfCBLZXlib2FyZEV2ZW50O1xuICByb3c6IGFueTtcbiAgcm93RWxlbWVudDogYW55O1xuICBjZWxsRWxlbWVudDogYW55O1xuICBjZWxsSW5kZXg6IG51bWJlcjtcbn1cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnZGF0YXRhYmxlLXNlbGVjdGlvbicsXG4gIHRlbXBsYXRlOiBgIDxuZy1jb250ZW50PjwvbmctY29udGVudD4gYCxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2hcbn0pXG5leHBvcnQgY2xhc3MgRGF0YVRhYmxlU2VsZWN0aW9uQ29tcG9uZW50IHtcbiAgQElucHV0KCkgcm93czogYW55W107XG4gIEBJbnB1dCgpIHNlbGVjdGVkOiBhbnlbXTtcbiAgQElucHV0KCkgc2VsZWN0RW5hYmxlZDogYm9vbGVhbjtcbiAgQElucHV0KCkgc2VsZWN0aW9uVHlwZTogU2VsZWN0aW9uVHlwZTtcbiAgQElucHV0KCkgcm93SWRlbnRpdHk6IGFueTtcbiAgQElucHV0KCkgc2VsZWN0Q2hlY2s6IGFueTtcblxuICBAT3V0cHV0KCkgYWN0aXZhdGU6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICBAT3V0cHV0KCkgc2VsZWN0OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICBwcmV2SW5kZXg6IG51bWJlcjtcblxuICBzZWxlY3RSb3coZXZlbnQ6IEtleWJvYXJkRXZlbnQgfCBNb3VzZUV2ZW50LCBpbmRleDogbnVtYmVyLCByb3c6IGFueSk6IHZvaWQge1xuICAgIGlmICghdGhpcy5zZWxlY3RFbmFibGVkKSByZXR1cm47XG5cbiAgICBjb25zdCBjaGtib3ggPSB0aGlzLnNlbGVjdGlvblR5cGUgPT09IFNlbGVjdGlvblR5cGUuY2hlY2tib3g7XG4gICAgY29uc3QgbXVsdGkgPSB0aGlzLnNlbGVjdGlvblR5cGUgPT09IFNlbGVjdGlvblR5cGUubXVsdGk7XG4gICAgY29uc3QgbXVsdGlDbGljayA9IHRoaXMuc2VsZWN0aW9uVHlwZSA9PT0gU2VsZWN0aW9uVHlwZS5tdWx0aUNsaWNrO1xuICAgIGxldCBzZWxlY3RlZDogYW55W10gPSBbXTtcblxuICAgIGlmIChtdWx0aSB8fCBjaGtib3ggfHwgbXVsdGlDbGljaykge1xuICAgICAgaWYgKGV2ZW50LnNoaWZ0S2V5KSB7XG4gICAgICAgIHNlbGVjdGVkID0gc2VsZWN0Um93c0JldHdlZW4oW10sIHRoaXMucm93cywgaW5kZXgsIHRoaXMucHJldkluZGV4LCB0aGlzLmdldFJvd1NlbGVjdGVkSWR4LmJpbmQodGhpcykpO1xuICAgICAgfSBlbHNlIGlmIChldmVudC5jdHJsS2V5IHx8IGV2ZW50Lm1ldGFLZXkgfHwgbXVsdGlDbGljayB8fCBjaGtib3gpIHtcbiAgICAgICAgc2VsZWN0ZWQgPSBzZWxlY3RSb3dzKFsuLi50aGlzLnNlbGVjdGVkXSwgcm93LCB0aGlzLmdldFJvd1NlbGVjdGVkSWR4LmJpbmQodGhpcykpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2VsZWN0ZWQgPSBzZWxlY3RSb3dzKFtdLCByb3csIHRoaXMuZ2V0Um93U2VsZWN0ZWRJZHguYmluZCh0aGlzKSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHNlbGVjdGVkID0gc2VsZWN0Um93cyhbXSwgcm93LCB0aGlzLmdldFJvd1NlbGVjdGVkSWR4LmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgdGhpcy5zZWxlY3RDaGVjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgc2VsZWN0ZWQgPSBzZWxlY3RlZC5maWx0ZXIodGhpcy5zZWxlY3RDaGVjay5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICB0aGlzLnNlbGVjdGVkLnNwbGljZSgwLCB0aGlzLnNlbGVjdGVkLmxlbmd0aCk7XG4gICAgdGhpcy5zZWxlY3RlZC5wdXNoKC4uLnNlbGVjdGVkKTtcblxuICAgIHRoaXMucHJldkluZGV4ID0gaW5kZXg7XG5cbiAgICB0aGlzLnNlbGVjdC5lbWl0KHtcbiAgICAgIHNlbGVjdGVkXG4gICAgfSk7XG4gIH1cblxuICBvbkFjdGl2YXRlKG1vZGVsOiBNb2RlbCwgaW5kZXg6IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IHsgdHlwZSwgZXZlbnQsIHJvdyB9ID0gbW9kZWw7XG4gICAgY29uc3QgY2hrYm94ID0gdGhpcy5zZWxlY3Rpb25UeXBlID09PSBTZWxlY3Rpb25UeXBlLmNoZWNrYm94O1xuICAgIGNvbnN0IHNlbGVjdCA9ICghY2hrYm94ICYmICh0eXBlID09PSAnY2xpY2snIHx8IHR5cGUgPT09ICdkYmxjbGljaycpKSB8fCAoY2hrYm94ICYmIHR5cGUgPT09ICdjaGVja2JveCcpO1xuXG4gICAgaWYgKHNlbGVjdCkge1xuICAgICAgdGhpcy5zZWxlY3RSb3coZXZlbnQsIGluZGV4LCByb3cpO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2tleWRvd24nKSB7XG4gICAgICBpZiAoKDxLZXlib2FyZEV2ZW50PmV2ZW50KS5rZXlDb2RlID09PSBLZXlzLnJldHVybikge1xuICAgICAgICB0aGlzLnNlbGVjdFJvdyhldmVudCwgaW5kZXgsIHJvdyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLm9uS2V5Ym9hcmRGb2N1cyhtb2RlbCk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuYWN0aXZhdGUuZW1pdChtb2RlbCk7XG4gIH1cblxuICBvbktleWJvYXJkRm9jdXMobW9kZWw6IE1vZGVsKTogdm9pZCB7XG4gICAgY29uc3QgeyBrZXlDb2RlIH0gPSA8S2V5Ym9hcmRFdmVudD5tb2RlbC5ldmVudDtcbiAgICBjb25zdCBzaG91bGRGb2N1cyA9IGtleUNvZGUgPT09IEtleXMudXAgfHwga2V5Q29kZSA9PT0gS2V5cy5kb3duIHx8IGtleUNvZGUgPT09IEtleXMucmlnaHQgfHwga2V5Q29kZSA9PT0gS2V5cy5sZWZ0O1xuXG4gICAgaWYgKHNob3VsZEZvY3VzKSB7XG4gICAgICBjb25zdCBpc0NlbGxTZWxlY3Rpb24gPSB0aGlzLnNlbGVjdGlvblR5cGUgPT09IFNlbGVjdGlvblR5cGUuY2VsbDtcblxuICAgICAgaWYgKCFtb2RlbC5jZWxsRWxlbWVudCB8fCAhaXNDZWxsU2VsZWN0aW9uKSB7XG4gICAgICAgIHRoaXMuZm9jdXNSb3cobW9kZWwucm93RWxlbWVudCwga2V5Q29kZSk7XG4gICAgICB9IGVsc2UgaWYgKGlzQ2VsbFNlbGVjdGlvbikge1xuICAgICAgICB0aGlzLmZvY3VzQ2VsbChtb2RlbC5jZWxsRWxlbWVudCwgbW9kZWwucm93RWxlbWVudCwga2V5Q29kZSwgbW9kZWwuY2VsbEluZGV4KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmb2N1c1Jvdyhyb3dFbGVtZW50OiBhbnksIGtleUNvZGU6IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IG5leHRSb3dFbGVtZW50ID0gdGhpcy5nZXRQcmV2TmV4dFJvdyhyb3dFbGVtZW50LCBrZXlDb2RlKTtcbiAgICBpZiAobmV4dFJvd0VsZW1lbnQpIG5leHRSb3dFbGVtZW50LmZvY3VzKCk7XG4gIH1cblxuICBnZXRQcmV2TmV4dFJvdyhyb3dFbGVtZW50OiBhbnksIGtleUNvZGU6IG51bWJlcik6IGFueSB7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IHJvd0VsZW1lbnQucGFyZW50RWxlbWVudDtcblxuICAgIGlmIChwYXJlbnRFbGVtZW50KSB7XG4gICAgICBsZXQgZm9jdXNFbGVtZW50OiBIVE1MRWxlbWVudDtcbiAgICAgIGlmIChrZXlDb2RlID09PSBLZXlzLnVwKSB7XG4gICAgICAgIGZvY3VzRWxlbWVudCA9IHBhcmVudEVsZW1lbnQucHJldmlvdXNFbGVtZW50U2libGluZztcbiAgICAgIH0gZWxzZSBpZiAoa2V5Q29kZSA9PT0gS2V5cy5kb3duKSB7XG4gICAgICAgIGZvY3VzRWxlbWVudCA9IHBhcmVudEVsZW1lbnQubmV4dEVsZW1lbnRTaWJsaW5nO1xuICAgICAgfVxuXG4gICAgICBpZiAoZm9jdXNFbGVtZW50ICYmIGZvY3VzRWxlbWVudC5jaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIGZvY3VzRWxlbWVudC5jaGlsZHJlblswXTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmb2N1c0NlbGwoY2VsbEVsZW1lbnQ6IGFueSwgcm93RWxlbWVudDogYW55LCBrZXlDb2RlOiBudW1iZXIsIGNlbGxJbmRleDogbnVtYmVyKTogdm9pZCB7XG4gICAgbGV0IG5leHRDZWxsRWxlbWVudDogSFRNTEVsZW1lbnQ7XG5cbiAgICBpZiAoa2V5Q29kZSA9PT0gS2V5cy5sZWZ0KSB7XG4gICAgICBuZXh0Q2VsbEVsZW1lbnQgPSBjZWxsRWxlbWVudC5wcmV2aW91c0VsZW1lbnRTaWJsaW5nO1xuICAgIH0gZWxzZSBpZiAoa2V5Q29kZSA9PT0gS2V5cy5yaWdodCkge1xuICAgICAgbmV4dENlbGxFbGVtZW50ID0gY2VsbEVsZW1lbnQubmV4dEVsZW1lbnRTaWJsaW5nO1xuICAgIH0gZWxzZSBpZiAoa2V5Q29kZSA9PT0gS2V5cy51cCB8fCBrZXlDb2RlID09PSBLZXlzLmRvd24pIHtcbiAgICAgIGNvbnN0IG5leHRSb3dFbGVtZW50ID0gdGhpcy5nZXRQcmV2TmV4dFJvdyhyb3dFbGVtZW50LCBrZXlDb2RlKTtcbiAgICAgIGlmIChuZXh0Um93RWxlbWVudCkge1xuICAgICAgICBjb25zdCBjaGlsZHJlbiA9IG5leHRSb3dFbGVtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2RhdGF0YWJsZS1ib2R5LWNlbGwnKTtcbiAgICAgICAgaWYgKGNoaWxkcmVuLmxlbmd0aCkgbmV4dENlbGxFbGVtZW50ID0gY2hpbGRyZW5bY2VsbEluZGV4XTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobmV4dENlbGxFbGVtZW50KSBuZXh0Q2VsbEVsZW1lbnQuZm9jdXMoKTtcbiAgfVxuXG4gIGdldFJvd1NlbGVjdGVkKHJvdzogYW55KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Um93U2VsZWN0ZWRJZHgocm93LCB0aGlzLnNlbGVjdGVkKSA+IC0xO1xuICB9XG5cbiAgZ2V0Um93U2VsZWN0ZWRJZHgocm93OiBhbnksIHNlbGVjdGVkOiBhbnlbXSk6IG51bWJlciB7XG4gICAgaWYgKCFzZWxlY3RlZCB8fCAhc2VsZWN0ZWQubGVuZ3RoKSByZXR1cm4gLTE7XG5cbiAgICBjb25zdCByb3dJZCA9IHRoaXMucm93SWRlbnRpdHkocm93KTtcbiAgICByZXR1cm4gc2VsZWN0ZWQuZmluZEluZGV4KHIgPT4ge1xuICAgICAgY29uc3QgaWQgPSB0aGlzLnJvd0lkZW50aXR5KHIpO1xuICAgICAgcmV0dXJuIGlkID09PSByb3dJZDtcbiAgICB9KTtcbiAgfVxufVxuIl19