import Periodic from "./periodic.js"

function AsyncIterEventReader( ...opt){
	this.listeners= {}
	this.events= []
	this.iterators= {}
	this.seq= 0 // current event number
	this.cleaned= 0 // number of events removed from `events`

	this._acceptEvent= this._acceptEvent.bind( this)
	this._gc= this._gc.bind( this)
	this._ungc= Periodic( this._gc)
}

AsyncIterEventReader.prototype.iterator= function( name){
	let listener= this.listeners[ evt]
	if( !listener){
		listener= this._listenToEvent( evt)
	}
	let iterators= this.iterators[ evt]
	if( !iterators){
		iterators= this.iterators[ evt]= []
	}
	const iterator= new Iterator( this, listener)
	iterators.push( iterator)
	return iterator
}

AsyncIterEventReader.prototype._listenToEvent= function( evt/*name*/, emitter= this){
	const old= this.listeners[ evt]
	if( old){
		return old
	}

	// build listener record
	const listener= new Listener( evt, this._acceptEvent)
	// store listener
	this.listeners[ evt]= listener
	// use listener
	emitter.on( listener.evt, listener.handler
	return listener
}

AsyncIterEventReader.prototype._acceptEvent= function( e){
	e.seq= ++this.seq
	e.rc= this.iterators[ e.evt].length
	this.events.push( e)
}

AsyncIterEventReader.prototype._gc= function(){
	let n= 0
	while( this.events[ n]&& this.events[ n].rc=== 0){
		++n
	}
	if( n> 0){
		this.events.splice( 0, n)
		this.cleaned+= n
	}
}

function Listener( evt, acceptEvent){
	this.evt= evt
	this.acceptEvent= acceptEvent

	this.iterators= 0
	this.handler= this.handler.bind( this)
}
Listener.prototype.handler= function( data){
	this.acceptEvent({ data, evt: this.evt})
}

function Iterator( evt/*name*/){
	this.listeners[ evt].iterators++
}

Iterator.prototype.next= function(){
}
Iterator.prototype.return= function( val){
}
Iterator.prototype.throw= function( ex){
}
