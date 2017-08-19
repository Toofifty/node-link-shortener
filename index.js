const fs = require('fs')
const shortid = require('shortid')
const express = require('express')

let app = express()

app.set('view engine', 'pug')

let links = {}

const write = (obj) => {
    fs.writeFile('links', JSON.stringify(obj), (err) => {
        if (err) throw err
    })
}

// Load links
if (fs.existsSync('links')) {
    links = JSON.parse(fs.readFileSync('links', 'ascii'))
}

app.get('/', (req, res) => {
    res.render('index', { links, newid: shortid.generate(), host: req.headers.host })
})

app.get('/:id', (req, res) => {
    let id = req.params.id
    if (links[id]) {
        res.redirect('http://' + links[id])
    } else {
        res.render('not-found', { host: req.headers.host, id })
    }
})

app.get('/add/:id/:link', (req, res) => {
    let id = req.params.id
    let link = decodeURIComponent(req.params.link)
    if (!links[id]) {
        if (link.substr(0, 7) === 'http://') {
            link = link.substr(7, link.length)
        } else if (link.substr(0, 8) === 'https://') {
            link = link.substr(8, link.length)
        }
        if (link.substr(link.length - 1, link.length) === '/') {
            link = link.substr(0, link.length - 1)
        }
        res.send(JSON.stringify({
            success: 'Added new link',
            id, link,
            newid: shortid.generate(),
            host: req.headers.host
        }))
        console.log('Added ' + id + ' => ' + link)
        links[id] = link
        write(links)
    } else {
        res.send(JSON.stringify({ error: 'Link already exists' }))
    }
})

app.get('/del/:id', (req, res) => {
    let id = req.params.id
    if (links[id]) {
        res.send(JSON.stringify({ success: 'Deleted link', id }))
        console.log('Deleted ' + id)
        delete links[id]
        write(links)
    } else {
        res.send(JSON.stringify({ error: 'Link doesn\'t exist' }))
    }
})

app.listen(3001)
