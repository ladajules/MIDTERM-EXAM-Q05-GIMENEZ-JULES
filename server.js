const express = require('express');
const fs = require('fs');
const path = require('path');
const PORT = 3000;

const app = express();
app.use(express.json());
app.use(express.static('public'));

const dataPath = path.join(__dirname, 'data.json');

function getReservations() {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    return Array.isArray(data) ? data : data.reservations;
}
function saveReservations(reservations) {
    fs.writeFileSync(dataPath, JSON.stringify(reservations, null, 2));
}

app.get('/', (req, res) => {
    res.send('iz working');
});

// get all reservations
app.get('/api/reservations/', (req, res) => {
    try {
        const reservations = getReservations();
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ error: 'Error in fetching all reservations.' });
    }
});

// get reservation by ID
app.get('/api/reservations/:id', (req, res) => {
    try {
        const reservations = getReservations();
        const reservation = reservations.find(r => r.id === parseInt(req.params.id));

        if (reservation) {
            res.json(reservation);
        } else {
            res.status(404).json({ error: 'Reservation not found.' });
        }

    } catch(error) {
        res.status(500).json({ error: 'Error in fetching reservation by ID.' });
    }
});

// create a new reservation
app.post('/api/reservations/', (req, res) => {
    try {
        const newReservation = req.body;

        // validation: room cannot have more than one reservation on the same date
        const reservations = getReservations();
        const isRoomReserved = reservations.some(r => r.room === newReservation.room && r.date === newReservation.date);

        if (isRoomReserved) {
            return res.status(400).json({ error: 'Room is already reserved on this date.' });
        }

        reservations.push(newReservation);
        saveReservations(reservations);
        res.status(201).json(newReservation);


    } catch(error) {
        res.status(500).json({ error: 'Error in creating a new reservation.' });
    }
});

// delete a reservation by ID
app.delete('/api/reservations/:id', (req, res) => {
    try {
        const reservations = getReservations();
        const reservationIndex = reservations.findIndex(r => r.id === parseInt(req.params.id));

        if (reservationIndex !== -1) {
            reservations.splice(reservationIndex, 1);
            saveReservations(reservations);
            res.status(200).json({ message: 'Reservation deleted successfully.' });
        } else {
            res.status(404).json({ error: 'Reservation not found.' });
        }

    } catch(error) {
        res.status(500).json({ error: 'Error in deleting reservation by ID.' });
    }
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});