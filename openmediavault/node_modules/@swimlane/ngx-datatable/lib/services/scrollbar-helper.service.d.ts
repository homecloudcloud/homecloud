import * as i0 from "@angular/core";
/**
 * Gets the width of the scrollbar.  Nesc for windows
 * http://stackoverflow.com/a/13382873/888165
 */
export declare class ScrollbarHelper {
    private document;
    width: number;
    constructor(document: any);
    getWidth(): number;
    static ɵfac: i0.ɵɵFactoryDeclaration<ScrollbarHelper, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<ScrollbarHelper>;
}
