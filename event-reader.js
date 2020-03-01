import Denque from "denque"
import Defer from "p-defer"

export function EventReader( opt){
	Object.assign( this, {
		// emitter to read events out of
		emitter: this,
		// listeners on the emitter
		listeners: {}
	}, opt)
}
export default EventReader

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
	// events to be read out
	this.events= new Deque()
	// collection of all iterators
	this.iterators= []
	// number of items removed from queue
	this.seq= 0
	// event type for this listener
	this.type= type
	// defer for iterators to signal their need for data
	this.notify= null

	this.handler= this.handler.bind( this)
}

EventReaderListener.prototype.handler= function( data){
	// store event for iterators
	this.events.push({
		data,
		type: this.type,
		rc: this.iterators.length
	})
	if( this.notify){
		// wake up anyone waiting for an event
		this.notify.resolve()
		this.notify= null
	}
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
	// number of events on listener that have gone by for this iterator
	// different _startIterator hooks are likely to munge this
	this.seq= listener.seq
}

EventReaderIterator.prototype.next= async function(){
	// repeat until we get an event
	while( true){
		// if positive, we are ahead in reading by this many
		let min= this.seq- this.listener.seq
		if( min< 1){
			// negative is unexpected: the listener has dequeued events before we saw them
			this.seq= this.listener.seq
			min= 0
		}

		// check for an available event
		if( this.listener.events.length> min){
			const value= this.listener.events.peekAt( min)
			// saw another event
			++this.seq
			// mark on the event that it's been seen
			--value.rc
			// run post iteration hook
			this.listener._postIteration()
			return {
				done: false,
				value
			}
		}

		// wait for a value to appear
		if( !this.listener.notify){
			this.listener.notify= Defer()
		}
		// i believe we will wake up from this in the same
		// order as we go in, so many outstanding .next
		// calls will still resolve in order
		await this.listener.notify.promise
	}
}
EventReaderIterator.prototype.return= async function( val){
}
EventReaderIterator.prototype.throw= async function( ex){
}
