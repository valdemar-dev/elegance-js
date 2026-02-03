# Event Listeners
Event listeners in Elegance are special element options that can be attached to any [event](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Events) on any element.

The `eventListener` function takes in two parameters, a `callback`, which takes in the [Event Object](https://developer.mozilla.org/en-US/docs/Web/API/Event), and whatever state you passed in. The second parameter is an array of [state](/state) that you want to be accessible within the function.

## Notes
There is a special type `SetEvent<EventType, TargetElement>`, that should be used to *type* the event correctly. For example `SetEvent<MouseEvent, HTMLDivElement>`. It's very useful for getting rid of type casting.

If you don't need the `event` parameter passed into `callback`, you can declare it as an underscore: `_`, which will make TypeScript not throw warnings.

## Event List
### Mouse Events
* onClick
* onDoubleClick
* onContextMenu
* onMouseDown
* onMouseUp
* onMouseEnter
* onMouseLeave
* onMouseMove
* onMouseOver
* onMouseOut
* onWheel

### Keyboard Events
* onKeyDown
* onKeyUp
* onKeyPress

### Focus Events
* onFocus
* onBlur
* onFocusIn
* onFocusOut

### Form Events
* onChange
* onInput
* onSubmit
* onInvalid
* onReset

### UI Events
* onScroll