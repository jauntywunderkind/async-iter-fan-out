import Denque from "denque"
import Defer from "p-defer"

export function FanOut( opt){
	// events to be read out
	this.events= new Denque()
	// collection of all iterators
	this.iterators= []
	// number of items removed from queue
	this.seq= 0
	// defer for iterators to signal their need for data
	this.notify= null
}
export default FanOut

FanOut.prototype.push= function( data){
	this.events.push({
		data,
		rc: this.iterators.length
	})
	if( this.notify){
		// wake up anyone waiting for an event
		this.notify.resolve()
		this.notify= null
	}
}

FanOut.prototype[ Symbol.asyncIterator]= function(){
	const iterator= new FanOutIterator( this)
	if( this.done){
		return iterator
	}

	this.iterators.push( iterator)
	if( this._startIterator){
		this._startIterator( iterator)
	}
	return iterator
}

FanOut.prototype.end= function(){
	for( let iter of this.iterators){
		iter.return()
	}
	this.done= true
}

FanOut.Iteration= {
	/**
	* Post-iteration hook to remove events with an `rc` of 0
	*/
	PostRemove(){
		while( this.events.length&& this.events.peekFront().rc=== 0){
			this.events.shift()
			++this.seq
		}
	}
}

FanOut.prototype._postIteration= FanOut.Iteration.PostRemove

FanOut.Iterator= {
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
	},

	/**
	*/
	Terminate( iterator){
		const i= this.iterators.indexOf( iterator)
		if( i=== -1){
			return
		}
		this.iterators.splice( i, 1)
	}
}

FanOut.prototype._startIterator= FanOut.Iterator.StartNew
FanOut.prototype._terminateIterator= FanOut.Iterator.Terminate

export function FanOutIterator( fanOut){
	this.fanOut= fanOut
	// number of events on listener that have gone by for this iterator
	// different _startIterator hooks are likely to munge this
	this.seq= fanOut.seq
}

FanOutIterator.prototype.next= async function(){
	// repeat until we get an event
	while( true){
		if( this.done|| !this.fanOut|| this.fanOut.done){
			return {
				done: true,
				value: undefined
			}
		}

		// if positive, we are ahead in reading by this many
		let min= this.seq- this.fanOut.seq
		if( min< 0){
			// negative is unexpected: the listener has dequeued events before we saw them
			this.seq= this.fanOut.seq
			min= 0
		}

		// check for an available event
		if( this.fanOut.events.length> min){
			const wrapped= this.fanOut.events.peekAt( min)
			// saw another event
			++this.seq
			// mark on the event that it's been seen
			--wrapped.rc
			// run post iteration hook
			if( this._postIteration){
				this._postIteration()
			}else if( this.fanOut._postIteration){
				this.fanOut._postIteration()
			}
			return {
				done: false,
				value: wrapped.data
			}
		}

		// wait for a value to appear
		if( !this.fanOut.notify){
			this.fanOut.notify= Defer()
		}
		// i believe we will wake up from this in the same
		// order as we go in, so many outstanding .next
		// calls will still resolve in order
		await this.fanOut.notify.promise
	}
}
FanOutIterator.prototype.return= async function( value){
	const fanOut= this.fanOut

	this.done= true
	this.fanOut._terminateIterator( this)
	this.fanOut= null

	if( fanOut.notify){
		// wake up up fanOut's iterators, as this iterator may be blocked
		// TRADEOFF:
		// so this implies that really notify is a per iterator event
		// but such an impl would generate additional allocation pressure per iteration 
		// whereas by leaving this at the fanOut level causes some mild extra work only when terminating an iterationwhen terminating an iteration.
		// if many early-terminated iterations are expected this may be worth re-visiting
		const notify= fanOut.notify
		fanOut.notify= null
		notify.resolve()
	}
	return {
		done: true,
		value
	}
}
FanOutIterator.prototype.throw= async function( ex){
	await this.return()
	throw ex
}
FanOutIterator.prototype[ Symbol.asyncIterator]= function(){
	return this.fanOut[ Symbol.asyncIterator]()
}
