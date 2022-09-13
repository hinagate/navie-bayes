let data = {}

let probTable = {
    yTruth: {
        IDX: {},
        p: {}
    },
    classes: {}
}

let inputIDs = {}

// https://stackoverflow.com/questions/3065342/how-do-i-iterate-through-table-rows-and-cells-in-javascript
function tableToJson(table) {
    let headers = []
    let _classes = {}

    for (let i=0; i<table.rows[0].cells.length; i++) {
        headers[i] = table.rows[0].cells[i].innerHTML.toLowerCase().replace(/ /gi,'')
        _classes[headers[i]] = []
    }

    for (let i=1; i<(table.rows.length-1); i++) {
        let tableRow = table.rows[i]
        for (let j=0; j<tableRow.cells.length; j++) {
            _classes[headers[j]].push(parseInt(tableRow.cells[j].innerHTML))
        }
    }

    let _y = _classes.y
    delete _classes.y
    delete _classes['']
    delete _classes['<buttonclass="material-icons"onclick="newcol()">add</button>']
    let _data = {dim: {entries: _y.length, classes: headers.length}, classes: _classes, y: _y}
    console.log(_data)
    return _data
}

function preProcess(){
    // reset probTable incase of change
    probTable = {
        yTruth: {
            IDX: {},
            p: {}
        },
        classes: {}
    }

    // Possible truths (Binary):
    let truths = [1, 1,1] // countUnique(data.y)

    // P(y=1), P(y=0)
    truths.forEach(truth => {
        let _idxOf = indexOfAll(data.y, truth)
        probTable.yTruth.IDX[`y=${truth}`] = _idxOf
        probTable.yTruth.p[`y=${truth}`] = _idxOf.length / data.dim.entries

        probTable.classes[`P(y=${truth})`] = {
            frac: `${_idxOf.length}/${data.dim.entries}`,
            p: {
                pos: _idxOf.length,
                total: data.dim.entries
            }
        }

    })

    Object.keys(data.classes).forEach(function(cName) {
        truths.forEach(truthA => {
            let _idxOf = indexOfAll(data.classes[cName], truthA)

            probTable.classes[`P(${cName}=${truthA})`] = {
                frac: `${_idxOf.length}/${data.dim.entries}`,
                p: {
                    pos: _idxOf.length,
                    total: data.dim.entries
                }
            }

            console.log(`P(${cName}=${truthA}) = ${_idxOf.length}/${data.dim.entries}`)

            truths.forEach(truthB => {
                let _common = probTable.yTruth.IDX[`y=${truthB}`].filter(x => _idxOf.includes(x))
                probTable.classes[`P(${cName}=${truthA}|y=${truthB})`] = {
                    frac: `${_common.length}/${probTable.yTruth.IDX[`y=${truthB}`].length}`,
                    p: {
                        pos: _common.length,
                        total: probTable.yTruth.IDX[`y=${truthB}`].length
                    }
                }
                console.log(`P(${cName}=${truthA}|y=${truthB}) = ${_common.length}/${probTable.yTruth.IDX[`y=${truthB}`].length}`)
            })

        })
    })

    //console.log(probTable)
}

// https://stackoverflow.com/questions/15052702/count-unique-elements-in-array-without-sorting/44405494#44405494
function countUnique(iterable) {
    return new Set(iterable)
}

// https://stackoverflow.com/questions/20798477/how-to-find-index-of-all-occurrences-of-element-in-array/52984577#52984577
const indexOfAll = (arr, val) => arr.reduce((acc, el, i) => (el === val ? [...acc, i] : acc), [])

function probability(truth, c) {
    let _conditions = ''
    Object.keys(data.classes).forEach(function(cName, idx, array) {
        _conditions += `${cName}=${c[cName]}`
        if (idx !== array.length - 1){
            _conditions += ", "
        }
    })
    console.log(`input: P(y=${truth} | ${_conditions})`)
    
    let _numeratorPLatex = `P(y=${truth})`
    let _denomPLatex = ''

    let _numeratorFrac = `(${probTable.classes[`P(y=${truth})`].frac})`
    let _denomFrac = ``

    let _numeratorFracLatex = `\\frac{${probTable.classes[`P(y=${truth})`].p.pos}}{${probTable.classes[`P(y=${truth})`].p.total}}*`
    let _denomFracLatex = ''

    let _numeratorResult = probTable.classes[`P(y=${truth})`].p.pos / probTable.classes[`P(y=${truth})`].p.total
    let _denomResult = 0
    
    Object.keys(data.classes).forEach(function(cName, idx, array) {
        let x = probTable.classes[`P(${cName}=${c[cName]}|y=${truth})`]

        _numeratorResult = _numeratorResult * (x.p.pos / x.p.total)

        _numeratorFrac += `(${x.frac})`

        _numeratorFracLatex += `\\frac{${x.p.pos}}{${x.p.total}}`

        _numeratorPLatex += `P(${cName}=${c[cName]}|y=${truth})`

        if (idx !== array.length - 1){
            _numeratorFracLatex += "*"
        }  
    })
    
    //console.log(probTable.yTruth.p)
    
    Object.keys(probTable.yTruth.p).forEach(function(truth, idx, array) {
        let _pN = probTable.classes[`P(${truth})`].p.pos / probTable.classes[`P(${truth})`].p.total

        _denomFrac += `(${probTable.classes[`P(${truth})`].frac})`
        _denomFracLatex += `\\frac{${probTable.classes[`P(${truth})`].p.pos}}{${probTable.classes[`P(${truth})`].p.total}}*`
        _denomPLatex += `P(${truth})`
        
        Object.keys(data.classes).forEach(function(cName, idx, array) {
            _pN = _pN * (probTable.classes[`P(${cName}=${c[cName]}|${truth})`].p.pos / probTable.classes[`P(${cName}=${c[cName]}|${truth})`].p.total)
            
            _denomFrac += `(${probTable.classes[`P(${cName}=${c[cName]}|${truth})`].frac})`
            _denomFracLatex += `\\frac{${probTable.classes[`P(${cName}=${c[cName]}|${truth})`].p.pos}}{${probTable.classes[`P(${cName}=${c[cName]}|${truth})`].p.total}}`
            _denomPLatex += `P(${cName}=${c[cName]}|${truth})`

            if (idx !== array.length - 1) {
                _denomFracLatex += "*"
            }
        })
       
        _denomResult = _denomResult + _pN
        
        if (idx !== array.length - 1) {
            _denomFrac += "+"
            _denomFracLatex += "+"
            _denomPLatex += "+"
        }
    })

    let _latexResult = `P(y=${truth} | ${_conditions}) = \\frac{${_numeratorPLatex}}{${_denomPLatex}} = \\frac{${_numeratorFracLatex}}{${_denomFracLatex}} = ${_numeratorResult / _denomResult}`
    let _fracResult = `(${_numeratorFrac}) / (${_denomFrac})`
    //console.log(`${_numeratorPLatex}) / ${_denomPLatex}`)
    //console.log(`${_numeratorFracLatex} / ${_denomFracLatex}`)
    //console.log(`= ${_numeratorResult / _denomResult}`)
    return {latexResult: _latexResult, fracResult: _fracResult}
}

function setNewParams() {
    let oldParams = fetchParams().features
    let newParams = {}

    init()

    Object.keys(data.classes).forEach(function(cName, idx, array) {
        if (idx <= Object.keys(oldParams).length){
            newParams[cName] = Object.values(oldParams)[idx]
            if ((newParams[cName] !== 1) && (newParams[cName] !== 0)) {
                newParams[cName] = 0
            }
        }else {
            newParams[cName] = 0
        }
    })
    
    setParams(newParams)
}

function setParams(args) {
    let argHTML = ``
    Object.keys(data.classes).forEach(function(cName, idx, array) {
        inputIDs[cName] = makeID(5)
        argHTML += `${cName} = <span id="${inputIDs[cName]}" onclick=changeValueBool(event.target)>${args[cName]}</span>`
        if (idx !== array.length - 1){
            argHTML += ", "
        }
    })
    document.getElementById("featureConst").innerHTML = `${argHTML}`
}

function fetchParams() {
    let _params = {y: parseInt(document.getElementById("yVal").innerText), features:{}}
    Object.keys(data.classes).forEach(function(cName, idx, array) {
        _params.features[cName] = parseInt(document.getElementById(inputIDs[cName]).innerText)
    })
    return _params
}

function init() {
    let table = document.getElementById('dataInputTable')

    data = tableToJson(table)

    preProcess()
}

function main() {
    init()

    let params = fetchParams()
    let result = probability(params.y, params.features)

    //console.log(result)
    
    document.getElementById("latexResult").innerHTML = `<h4>Result </h4> <latex-js>\\documentclass{article} \\begin{document} \\[${result.latexResult}\\] \\end{document}</latex-js>`
    
    document.getElementById("latexResultText").value = result.latexResult

    document.getElementById("fracResultText").value = result.fracResult

    let _probTable = ``
    Object.keys(probTable.classes).forEach(function(cName, idx, array) {
        _probTable += `<tr><td>${cName}</td><td>${probTable.classes[cName].frac}</td></tr>`
    })
    document.getElementById("probTableResult").innerHTML = ``
    document.getElementById("probTableResult").innerHTML = `<table>${_probTable}</table>`
}

init()

setParams({a:1, b:1, c:1})

main()

//console.log(probTable.classes)
