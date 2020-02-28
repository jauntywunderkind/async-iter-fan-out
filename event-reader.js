import Denque from "denque"

function EventReader( opt){
	Object.assign( this, {
		emitter: this,
		listeners: {}
	}, opt)
}

EventReader.prototype.iterator= function( type){
	const listener= this.listener( type)
	return listener.iterator()
}

EventReader.prototype.listener= function( type){
	const old= this.listeners[ type]
	if( old){
		return old
	}

	// build listener record
	const listener= new EventReaderListener( type, this)
	// store listener
	this.listeners[ type]= listener
	// use listener
	if( this.emitter.addEventListener){
		this.emitter.addEventListener( type, listener.handler,{ passive: true})
	}else{
		this.emitter.on( type, listener.handler)
	}
	return listener
}

function EventReaderListener( type, eventReader){
	this.events= new Deque()
	this.iterators= []
	this.seq= 0
	this.type= type

	this.handler= this.handler.bind( this)
}

EventReaderListener.prototype.handler= function( data){
	this.events.push({
		data,
		type: this.type,
		rc: this.iterators.length
	})
}

EventReaderListener.prototype.iterator= function(){
	const iterator= new EventReaderIterator( this)
	this.iterators.push( iterator)
	this._startIterator( iterator)
	return iterator
}

EventReaderListener.Iteration= {
	/**
	* Post-iteration hook to remove events with an `rc` of 0
	*/
	PostRemove(){
		while( this.events.length&& this.events.peekFront().rc=== 0){
			this.events.unshift()
			++this.seq
		}
	}
}

EventReaderListener.prototype._postIteration= EventReaderListener.Iteration.PostRemove

EventReaderListener.Iterator= {
	/**
	* Start-iterator hook to read any & all current events
	*/
	StartAll( iterator){
		iterator.seq= this.seq
		for( let i= 0; i< this.events.length; ++i){
			++this.events.peekAt( i).rc
		}
	},
	/**
	* Start-iterator hook to read only values which have not been read
	*/
	StartNew( iterator){
		iterator.seq= this.seq+ this.events.length
	}
}

EventReaderListener.prototype._startIterator= EventReaderListener.Iterator.StartAll

function EventReaderIterator( listener){
	this.listener= listener
}

EventReaderIterator.prototype.next= function(){
}
EventReaderIterator.prototype.return= function( val){
}
EventReaderIterator.prototype.throw= function( ex){
}
