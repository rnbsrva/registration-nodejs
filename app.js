import express from "express";
import postgres from "pg";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import ejs from "ejs";
import bcrypt from "bcrypt";

const app = express();
const port = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.engine('html',ejs.renderFile);
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const Pool = postgres.Pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'node',
  password: '0000',
  port: 5432,
})


pool.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

   
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
      [username, email, hashedPassword]
    );

   
    res.status(200).json({ success: true });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});



app.post('/login', async (req, res) => {
  try {
    console.log("started for response");

    const { username, password } = req.body;

    const user = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (!user.rows.length) {
      console.log("Invalid username");
      return res.status(401).json({ success: false, error: 'Invalid username or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.rows[0].password);

    if (!passwordMatch) {
      console.log("Invalid username or password");
      return res.status(401).json({ success: false, error: 'Invalid username or password' });
    }

    console.log("ended for response");
    res.status(200).json({ success: true });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


app.get('/main',(req,res) => res.render('main'))