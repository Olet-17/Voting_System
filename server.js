const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public'), {index:false}));

// Perdorimi i file-s ne folderet e jashtem
app.use('/css', express.static(path.join(__dirname, 'css')));


app.use('/js', express.static(path.join(__dirname, 'js')));


app.use('/images', express.static(path.join(__dirname, 'images')));

// Root Page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'main.html'));
});
// Konektimi i mongoDB
mongoose.connect('mongodb://localhost:27017/Voting_System')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Skema e kandidateve
const candidateSchema = new mongoose.Schema({
    name: String,
    description: { type: String, default: "" },
    infoLink: { type: String, default: "" },
    votes: { type: Number, default: 0 }
}, { collection: 'Candidates' });

const Candidate = mongoose.model('Candidate', candidateSchema);

// Skema e votuesve
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    hasVoted: { type: Boolean, default: false }
}, { collection: 'Users' });

const User = mongoose.model('User', userSchema);


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'main.html'));
});

// Shtimi i kandidateve
app.post('/candidates', async (req, res) => {
    const { name, description, infoLink } = req.body;
    if (!name) return res.status(400).json({ message: 'Candidate name is required.' });

    try {
        const newCandidate = new Candidate({ name, description, infoLink });
        await newCandidate.save();
        res.status(201).json({ message: 'Candidate added successfully!', candidate: newCandidate });
    } catch (err) {
        res.status(500).json({ message: 'Error adding candidate.', error: err });
    }
});

// Marja e kandidateve
app.get('/candidates', async (req, res) => {
    try {
        const candidates = await Candidate.find();
        res.status(200).json({ candidates });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching candidates.', error: err });
    }
});

// Votimi i kandidateve
app.post('/vote', async (req, res) => {
    const { username, password, candidateIds } = req.body;

    // Validimi i inputeve
    if (!username || !password || !candidateIds || candidateIds.length !== 3) {
        return res.status(400).json({ message: "You must vote for exactly 3 candidates." });
    }

    try {
        
        let user = await User.findOne({ username, password });

        
        if (!user) {
            user = new User({ username, password, hasVoted: false });
        }

        
        if (user.hasVoted) {
            return res.status(403).json({ message: "You have already voted." });
        }

       
        user.hasVoted = true;
        await user.save();

       
        await Candidate.updateMany(
            { _id: { $in: candidateIds } },
            { $inc: { votes: 1 } }
        );

        res.status(200).json({ message: "Your votes have been submitted successfully!" });
    } catch (err) {
        res.status(500).json({ message: "Error voting.", error: err });
    }
});

// Regjistrimi i userave
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  
  const existingUser = await User.findOne({ username });
  if (existingUser) {
      return res.status(400).json({ message: 'Username already taken.' });
  }

  // Krijimi i userit te ri
  const newUser = new User({ username, password });
  await newUser.save();

  res.status(201).json({ message: 'User registered successfully!' });
});

// Logimii useris
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Kerkimi i userit ne databaz
  const user = await User.findOne({ username, password });
  if (!user) {
      return res.status(400).json({ message: 'Invalid username or password.' });
  }

  res.status(200).json({ message: 'Login successful!' });
});


// Live-Polli
app.get('/live-results', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendVotes = async () => {
      const candidates = await Candidate.find();
      res.write(`data: ${JSON.stringify(candidates)}\n\n`);
  };

  // Dergimi i funksionit
  sendVotes();

  // Update qdo 5000 milisekonda dmth 5 sekonda
  const interval = setInterval(sendVotes, 5000);

  // Nese ndalet funksioni dmth "req" ka me u ndal edhe intervali
  req.on('close', () => clearInterval(interval));
});


// Live-Polli
app.get('/live-poll', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'live-poll.html'));
});

// Stratimi i serverit
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
