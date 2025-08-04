import { EventEmitter, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import * as i0 from "@angular/core";
export declare class LongPressDirective implements OnDestroy {
    pressEnabled: boolean;
    pressModel: any;
    duration: number;
    longPressStart: EventEmitter<any>;
    longPressing: EventEmitter<any>;
    longPressEnd: EventEmitter<any>;
    pressing: boolean;
    isLongPressing: boolean;
    timeout: any;
    mouseX: number;
    mouseY: number;
    subscription: Subscription;
    get press(): boolean;
    get isLongPress(): boolean;
    onMouseDown(event: MouseEvent): void;
    onMouseMove(event: MouseEvent): void;
    loop(event: MouseEvent): void;
    endPress(): void;
    onMouseup(): void;
    ngOnDestroy(): void;
    private _destroySubscription;
    static ɵfac: i0.ɵɵFactoryDeclaration<LongPressDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<LongPressDirective, "[long-press]", never, { "pressEnabled": "pressEnabled"; "pressModel": "pressModel"; "duration": "duration"; }, { "longPressStart": "longPressStart"; "longPressing": "longPressing"; "longPressEnd": "longPressEnd"; }, never>;
}
