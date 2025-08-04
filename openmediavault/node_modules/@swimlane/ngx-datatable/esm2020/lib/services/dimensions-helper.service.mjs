import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * Gets the width of the scrollbar.  Nesc for windows
 * http://stackoverflow.com/a/13382873/888165
 */
export class DimensionsHelper {
    getDimensions(element) {
        return element.getBoundingClientRect();
    }
}
DimensionsHelper.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.1.1", ngImport: i0, type: DimensionsHelper, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
DimensionsHelper.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.1.1", ngImport: i0, type: DimensionsHelper });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.1.1", ngImport: i0, type: DimensionsHelper, decorators: [{
            type: Injectable
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGltZW5zaW9ucy1oZWxwZXIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3N3aW1sYW5lL25neC1kYXRhdGFibGUvc3JjL2xpYi9zZXJ2aWNlcy9kaW1lbnNpb25zLWhlbHBlci5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBVSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7O0FBRW5EOzs7R0FHRztBQUVILE1BQU0sT0FBTyxnQkFBZ0I7SUFDM0IsYUFBYSxDQUFDLE9BQWdCO1FBQzVCLE9BQU8sT0FBTyxDQUFDLHFCQUFxQixFQUFFLENBQUM7SUFDekMsQ0FBQzs7NkdBSFUsZ0JBQWdCO2lIQUFoQixnQkFBZ0I7MkZBQWhCLGdCQUFnQjtrQkFENUIsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdCwgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG4vKipcbiAqIEdldHMgdGhlIHdpZHRoIG9mIHRoZSBzY3JvbGxiYXIuICBOZXNjIGZvciB3aW5kb3dzXG4gKiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xMzM4Mjg3My84ODgxNjVcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIERpbWVuc2lvbnNIZWxwZXIge1xuICBnZXREaW1lbnNpb25zKGVsZW1lbnQ6IEVsZW1lbnQpOiBDbGllbnRSZWN0IHtcbiAgICByZXR1cm4gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgfVxufVxuIl19