const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("dist"));

morgan.token("body", function (req, res) {
    return req?.body ? JSON.stringify(req.body) : "";
});
app.use(
    morgan(
        ":method :url :status :res[content-length] - :response-time ms :body"
    )
);

let phonebook = [
    {
        id: "1",
        name: "Arto Hellas",
        number: "040-123456",
    },
    {
        id: "2",
        name: "Ada Lovelace",
        number: "39-44-5323523",
    },
    {
        id: "3",
        name: "Dan Abramov",
        number: "12-43-234345",
    },
    {
        id: "4",
        name: "Mary Poppendieck",
        number: "39-23-64231221",
    },
];

app.get("/info", (request, response) => {
    response.send(`
    <p>Phonebook has info for ${phonebook.length} people</p>
    <p>${new Date()}</p>`);
});

app.get("/api/persons", (request, response) => {
    response.json(phonebook);
});

app.post("/api/persons", (request, response) => {
    let person = request.body;

    missingParams = [];

    if (!person?.name) {
        missingParams.push("name");
    }
    if (!person?.number) {
        missingParams.push("number");
    }

    if (missingParams.length > 0) {
        response.status(422).json({
            error: `request must contain a ${missingParams.join(" and ")}`,
        });
        return;
    }

    const id = Math.round(Math.random() * Number.MAX_SAFE_INTEGER);
    person.id = `${id}`;

    if (phonebook.find((p) => p.id != id)) {
        if (phonebook.find((p) => p.name == person.name)) {
            response.status(409).send("name must be unique");
            return;
        }
        phonebook.push(person);
        response.json(person);
    } else {
        response
            .status(500)
            .send(
                `Jackpot. The server generated a random ID that already exists (Chance: ${
                    (phonebook.length / Number.MAX_SAFE_INTEGER) * 100
                }%). Try again.`
            );
    }
});

app.get("/api/persons/:id", (request, response) => {
    const id = request.params.id;
    if (phonebook.find((p) => p.id == id))
        response.json(phonebook.find((p) => p.id == id));
    else response.sendStatus(404);
});

app.delete("/api/persons/:id", (request, response) => {
    const id = request.params.id;
    const index = phonebook.findIndex((p) => p.id === id);
    if (index == -1) {
        response.sendStatus(404);
    } else {
        phonebook.splice(index, 1);
        response.sendStatus(204);
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
