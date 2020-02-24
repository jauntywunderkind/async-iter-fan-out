function AsyncIterEventReaders( ...opt){
	this.listeners= {}
	this.events= []
	this.iterators= {}
	this.seq= 0 // current event number
	this.cleaned= 0 // number of events removed from `events`

	this._acceptEvent= this._acceptEvent.bind( this)
}
AsyncIterEventReaders.prototype._listenToEvent= function( evt/*name*/, emitter= this){
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
}

AsyncIterEventReader.prototype._acceptEvent= function( e){
	e.seq= ++this.seq
	e.rc= this.iterators[ e.evt].length
	this.events.push( e)
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
	if( !this.listeners[ evt]){
		this._listenToEvenT( evt)
	}
	this.listeners[ evt].iterators++

}

