const mongoose = require("mongoose");

if (process.argv.length < 3) {
    console.log("give password as argument");
    process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://fullstack:${password}@uh-fullstackwebdevelopm.dfalr.mongodb.net/?retryWrites=true&w=majority&appName=UH-FullStackWebDevelopment`;

mongoose.set("strictQuery", false);

mongoose.connect(url);

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
});

const Person = mongoose.model("Person", personSchema);

if (process.argv.length == 3) {
    // list all phonebook entries

    Person.find({}).then((result) => {
        console.log("phonebook:");

        result.forEach((person) => {
            console.log(`${person.name} ${person.number}`);
        });
        mongoose.connection.close();
    });
} else if (process.argv.length == 5) {
    // add phonebook entry
    const person = new Person({
        name: process.argv[3],
        number: process.argv[4],
    });

    person.save().then((result) => {
        console.log(
            `added ${result.name} number ${result.number} to phonebook`
        );
        mongoose.connection.close();
    });
} else {
    console.log("wrong number of arguments");
    process.exit(1);
}
