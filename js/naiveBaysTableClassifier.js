const data = {
    dim: {
        entries: 6,
        classes: 3 + 1
    },
    classes: {
        a: [0, 1, 0, 1, 0, 1],
        b: [1, 1, 0, 1, 1, 0],
        c: [1, 1, 0, 0, 0, 1],
    },
    y: [0, 0, 0, 1, 1, 1]
}

let probTable = {
    yTruth: {
        IDX: {},
        p: {}
    },
    classes: {}
}

// https://stackoverflow.com/questions/15052702/count-unique-elements-in-array-without-sorting/44405494#44405494
function countUnique(iterable) {
    return new Set(iterable)
}

// https://stackoverflow.com/questions/20798477/how-to-find-index-of-all-occurrences-of-element-in-array/52984577#52984577
const indexOfAll = (arr, val) => arr.reduce((acc, el, i) => (el === val ? [...acc, i] : acc), [])

function probability(truth, c) {
    let _conditions = ''
    Object.keys(data.classes).forEach(function(cName) {
        _conditions += `${cName}=${c[cName]},`
    })
    console.log(`input: P(y=${truth} | ${_conditions})`)
    
    let _numeratorPString = `P(y=${truth})`
    let _denomPString = ''

    let _numeratorOpString = `${probTable.classes[`P(y=${truth})`].frac}`
    let _denomOpString = ''

    let _numeratorResult = probTable.classes[`P(y=${truth})`].p.pos / probTable.classes[`P(y=${truth})`].p.total
    let _denomResult = 1
    
    Object.keys(data.classes).forEach(function(cName) {

        let x = probTable.classes[`P(${cName}=${c[cName]}|y=${truth})`]
        let u = probTable.classes[`P(${cName}=${c[cName]})`]

        _numeratorResult = _numeratorResult * (x.p.pos / x.p.total)
        _denomResult = _denomResult * (u.p.pos / u.p.total)

        _numeratorOpString += ` * ${x.frac}`
        _denomOpString += `* ${u.frac}`

        _numeratorPString += `P(${cName}=${c[cName]}|y=${truth})`
        _denomPString += `P(${cName}=${c[cName]})`
        
    })
    
    console.log(`${_numeratorPString} / ${_denomPString}`)
    console.log(`${_numeratorOpString} / ${_denomOpString}`)
    console.log(`= ${_numeratorResult / _denomResult}`)
    return
}

function main(){

    // Possible truths (Binary):
    let truths = [1, 0] // countUnique(data.y)

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

    console.log(probTable)
    // P(y=1 | a = 1, b = 0, c = 0)
    probability(1, {a:1, b:0, c:0})
}

main()