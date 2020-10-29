// https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
function makeID(length) {
    var result = ''
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    var charactersLength = characters.length
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
}

function _setAndRun(e, type=false) {
    e.addEventListener("keyup", function(event) {
        if (event.keyCode === 13) {
          event.preventDefault()
          e.innerHTML = e.querySelector('input').value
          if (type) {
            setNewParams()
          }
          main()
        }
    })

    e.addEventListener("focusout", function() {
        e.innerHTML = e.querySelector('input').value
        if (type) {
            setNewParams()
        }
        main()
    })
    
}

function changeValueText(e) {
    e.focus()
    e.innerHTML = `<input type="text" value=${e.innerText}></input>`
    _setAndRun(e, true)
    return
}

function changeValueBool(e) {
    e.focus()
    e.innerHTML = `<input type="number" value=${e.innerText} min="0" max="1"></input>`
    _setAndRun(e)
    return
}

function delRow(e) {
    let _dataTable = document.getElementById("dataInputTable")
    if (_dataTable.rows.length > 3) {
        document.getElementById("dataInputTable").deleteRow(e.parentNode.parentNode.rowIndex)
        init()
        main()
    }
}

function newRow(e) {
    init()
    
    let _dataTable = document.getElementById("dataInputTable")
    let _newRow = _dataTable.insertRow(e.parentNode.parentNode.rowIndex)
    let _dummy = _newRow.insertCell(0).innerText = `#${e.parentNode.parentNode.rowIndex - 1}`
    let _lastIDX = 0
    if (Object.keys(data.classes).length !== 0) {
        Object.keys(data.classes).forEach(function(cName, idx, array) {
            _lastIDX = idx
            let _newCell = _newRow.insertCell(idx +1)
            _newCell.setAttribute("onclick", "changeValueBool(event.target)")
            _newCell.innerText = 0
        })
    }else {
        _lastIDX = -1
    }


    let _yVal = _newRow.insertCell(_lastIDX + 2)
    _yVal.setAttribute("onclick", "changeValueBool(event.target)")
    _yVal.innerText = 0
    _newRow.insertCell(_lastIDX + 3).innerHTML = `<button class="material-icons" onclick="delRow(this)">delete</button>`
    
    main()
}

function delCol(e) {
    init()
    
    let _idxToDel = e.parentNode.cellIndex
    let _dataTable = document.getElementById("dataInputTable")
    
    for (var i = 0, row; row = _dataTable.rows[i]; i++) {
        console.log(row)
        row.deleteCell(_idxToDel)
    }
    setNewParams()
    main()
}

function newCol() {
    init()

    let _dataTable = document.getElementById("dataInputTable")
    
    let _header = _dataTable.rows[0].insertCell(1)
    _header.setAttribute("onclick", "changeValueText(event.target)")
    _header.innerText = makeID(3)

    let _maxLen = _dataTable.rows.length - 1

    console.log(_maxLen)
    for (var i = 1, row; row = _dataTable.rows[i]; i++) {
        let _newCol = row.insertCell(1)
        _newCol.setAttribute("onclick", "changeValueBool(event.target)")
        _newCol.innerText = 0
        if (i === _maxLen-1){
            break
        }
    }

    let _delRow = _dataTable.rows[_maxLen].insertCell(1)
    _delRow.innerHTML = `<button class="material-icons" onclick="delCol(this)">delete</button>`

    setNewParams()
    main()
}