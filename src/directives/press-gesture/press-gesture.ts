import {Directive, ElementRef,  OnInit, OnDestroy, Output, EventEmitter} from '@angular/core';
import {Gesture} from 'ionic-angular/gestures/gesture';
declare var Hammer;  /* declare as u might get error hammer not found though its loaded already by ionic when we use gesture*/

/*
Generated class for the PressGesture directive.

See https://angular.io/docs/ts/latest/api/core/index/DirectiveMetadata-class.html
for more info on Angular 2 Directives.
*/
@Directive({
selector: '[dblTap]' // Attribute selector
})
export class PressGestureDirective implements OnInit, OnDestroy{

el: HTMLElement;
pressGesture: Gesture;
@Output() dblTap: EventEmitter<any> = new EventEmitter();

constructor(el: ElementRef) {
this.el = el.nativeElement;
}

ngOnInit() {
this.pressGesture = new Gesture(this.el, {
recognizers: [
[Hammer.Tap, {taps: 2, interval:350}]
]
});
this.pressGesture.listen();
this.pressGesture.on('tap', e => {
this.dblTap.emit(e);
})
}

ngOnDestroy() {
this.pressGesture.destroy();
}

}
