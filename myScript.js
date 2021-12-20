$(function init(){
  prepareSolitaire()
  $('.card').draggable({
    stack: '.card',
    stack: '.empty',
		containment: 'body',
    revertDuration: 100,
    revert: true,
		disabled: true,
    start: function(event, ui){$(this).parents().css('z-index',100);},
    stop: function(event, ui){$(this).parents().css('z-index',1); }
  });

  $('.card').droppable({
    accept: '.card',
    greedy: true,
    drop: function(event, ui) {
        var dropped = ui.draggable;
        var droppedOn = $(this);
				if($moveCard(dropped, droppedOn)){
        	$(dropped).detach().css({top: 0,left: 0}).appendTo(droppedOn);
					var droppedParent =  dropped.parents().filter(function () {
											return $(this).data('row') == '0';
									});
					if($collapsible(droppedParent)){
						var emptySpace = droppedOn.parents('.empty');
						droppedParent.children().draggable('destroy');
						droppedParent.draggable('destroy');
						droppedParent.remove();
						emptySpace.removeClass();
						emptySpace.addClass('completed');
						emptySpace.css('z-index',1);
						emptySpace.droppable('destroy');
					}

					$refreshDraggable();
				}
    }
  });


  $('.empty').droppable({
    accept: '.card',
    drop: function(event, ui) {
        var dropped = ui.draggable;
        var droppedOn = $(this);
				if(droppedOn.children().length == 0 && $moveCard(dropped, droppedOn)){
					$(dropped).parents().css('z-index',1);
					$(dropped).detach().css({top: 0,left: 0}).appendTo(droppedOn);
				if($collapsible(dropped)){
					$collapse(dropped);
					dropped.children().draggable('destroy');
					dropped.draggable('destroy');
					dropped.remove();
					droppedOn.removeClass();
					droppedOn.addClass('completed');
					droppedOn.css('z-index',1);
					droppedOn.droppable('destroy');
				}
				$refreshDraggable();
    }
	}
  });


	$('.cell').droppable({
		accept: '.card',
		drop: function(event, ui) {
				var dropped = ui.draggable;
				var droppedOn = $(this);
				if(dropped.children().length == 0 || $collapsible(dropped)){
					if($moveCard(dropped, droppedOn)){
						$(dropped).parents().css('z-index',1);
						$(dropped).detach().css({top: 0,left: 0}).appendTo(droppedOn);
						if($collapsible(dropped)){
							$collapse(dropped);
							dropped.remove();
							droppedOn.removeClass();
							droppedOn.addClass('completed');
							console.log(droppedOn);
							droppedOn.droppable('destroy');
						}

						$refreshDraggable();
					}
				}
		}
	});
	$refreshDraggable();
});





function $refreshDraggable(){
	$('.card').each(function(){
		if($canDrag($(this))){
			$(this).draggable("enable");
		} else{
			$(this).draggable("disable");
		}
	});
}








function handleCardDrop(event, ui){

}









function clearBoard(){
	$('.card').remove();
}





function prepareSolitaire(){

  var shuffled = shuffleDeck(deck);
  var column = 0;
	var row = -1
  shuffled.forEach(element => {

    var $target = $('[data-row='+row+'][data-column="'+column%8+'"]');
    $target.append($createCard(element, row+1, column%8));
		placeCard(row+1, column%8, element)

		column++;
		if (column%8 == 0){ row++; }
  });

}

function $createCard(value, row, column){
	var $tCard = $('<div class="card" data-value="'+value+'" data-row="'+row+'" data-column="'+column+'">');
	$tCard.css({
		'background':'url("images/'+value+'.png") center',
		'background-size': 'cover',
		'background-repeat':'no-repeat'
	});
  return $tCard;
}






function $getCard(row,column){ //doesn't work because jquery data() is weird
	return $('.card[data-row='+row+'][data-column="'+column+'"]');
}




//model
const board = Array.from(Array(12), () => new Array(8)); //row x columns
const deck = [1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,6,6,6,6,7,7,7,7,8,8,8,8,9,9,9,9,10,10,10,10];

function shuffleDeck(array) {
  var arrCopy = Object.assign([], array);
  var copy = [];
  var n = array.length;
  var i;

  // While there remain elements to shuffle…
  while (n) {

    // Pick a remaining element…
    i = Math.floor(Math.random() * n--);

    // And move it to the new array.
    copy.push(arrCopy.splice(i, 1)[0]);
  }

  return copy;
}

function placeCard(row, column, value){
	board[row][column] = value;
}

function removeCard(row, column){
	var tValue = board[row][column];
	board[row][column] = undefined;
	return(tValue);
}

function $canDrag($card){
	var row = $card.data('row');
	var column = $card.data('column');
	var value = $card.data('value');

	return canDrag(row, column);
}
function canDrag(row, column){
	if(board[row][column]===undefined) { return false; }

	if ( board[row+1][column] === undefined || (  board[row+1][column]== board[row][column] && canDrag(row+1, column) ))
		return true;
	else
		return false;
}

function isLegal(row, column, tColumn){
	var tRow = columnFloor(tColumn);
	if(column==tColumn || (tColumn>7 && tRow>-1)){
		return false;
	}
	if(canDrag(row, column)){
		if(tRow == -1){ return true; }
		if(board[row][column] == board[tRow][tColumn]){ return true; }
	}
	return false;
}




function $isLegal($card, $target){
	if($($target).hasClass('empty')&&$target.children().length == 0){
		return true;
	}
	var row = $($card).data('row');
	var column = $($card).data('column');
	var tColumn = $($target).data('column');
	return isLegal(row, column, tColumn);

}



function $moveCard($card, $target){
	var tColumn = $target.data('column');
	var row = $card.data('row');
	var column = $card.data('column');

	if( moveCard(row, column, tColumn)){
		var tRow = $target.data('row');
		$card.data('row', (++tRow));
		$card.data('column', tColumn);
		var $tempCard = $card.children();
		while($tempCard.length >0){
			$tempCard.data('row', (++tRow));
			$tempCard.data('column', tColumn);
			$tempCard = $tempCard.children();
		}
		return true;
	}
}


function moveCard(row, column, tColumn){
	if(isLegal(row, column, tColumn)){
		var tRow = columnFloor(tColumn)+1;
		placeCard(tRow, tColumn,removeCard(row, column));
		var i = 1
		var tValue =board[row+i][column];
		while (!(tValue === undefined)){
			placeCard(tRow+i,tColumn,removeCard(row+i,column));
			i++;
			tValue = board[row+i][column];
		}
		return true;
	}
	return false;
}


function $collapsible($card){
	var row = $card.data('row');
	var column = $card.data('column');
	var tValue = board[row][column];
	if(tValue==board[row+1][column]&& tValue==board[row+2][column] && tValue==board[row+3][column]){

		return true;
	}
	return false;
}




function $collapse($card){
	var column = $card.data('column');
	removeCard(0, column);
	removeCard(1, column);
	removeCard(2, column);
	removeCard(3, column);
}



function columnFloor (column){
	var tRow = -1;
	while (tRow < 8){
	 if(board[tRow+1][column] === undefined){
		 return tRow;
	 }
	 tRow++;
 	}
	return false;
}
