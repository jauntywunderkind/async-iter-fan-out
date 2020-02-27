const tasks= []

setInterval(function(){
	for( let task of tasks){
		task()
	}
}, 1000)

export function addTask( task){
	tasks.push( task)
	return function removeTask(){
		const index= tasks.indexOf( task)
		if( index!== -1){
			tasks.splice( index, 1)
			return true
		}
		return false
	}
}

export default addTask
