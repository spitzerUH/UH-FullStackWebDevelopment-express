require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())

morgan.token('body', function (req) {
  return req?.body ? JSON.stringify(req.body) : ''
})

app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body')
)

let phonebook = []

app.get('/info', (request, response) => {
  response.send(`
    <p>Phonebook has info for ${phonebook.length} people</p>
    <p>${new Date()}</p>`)
})

app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then((result) => {
      phonebook = result
      response.json(result)
    })
    .catch(next)
})

app.post('/api/persons', (request, response, next) => {
  let person = request.body

  const newPerson = new Person(person)

  newPerson
    .save()
    .then((res) => {
      response.json(res)
    })
    .catch(next)
})

app.put('/api/persons/:id', (request, response, next) => {
  const personToUpdate = {
    name: request.body.name,
    number: request.body.number,
  }

  Person.findByIdAndUpdate(request.params.id, personToUpdate, { new: true })
    .then((updatedNote) => {
      if (updatedNote) {
        response.json(updatedNote)
      } else {
        response.sendStatus(404)
      }
    })
    .catch((error) => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id

  Person.findById(id)
    .then((res) => {
      if (res) {
        response.json(res)
      } else {
        response.sendStatus(404)
      }
    })
    .catch(next)
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch((error) => next(error))
})

//#region Error handler middleware

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}
app.use(errorHandler)

//#endregion

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
